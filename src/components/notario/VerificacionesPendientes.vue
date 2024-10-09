<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const documentData = ref([]);
const propertyData = ref([]);
const usersData = ref([]);
const transactionData = ref([]); // Aquí almacenaremos las transacciones
const selectedDocuments = ref([]); // Aquí almacenaremos los documentos seleccionados para verificación

// Función para obtener cookies
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Obtener datos del API
onMounted(async () => {
    try {
        const [docRes, propRes, userRes, transRes] = await Promise.all([
            axios.get('https://pro-block.vercel.app/api/v1/document'),
            axios.get('https://pro-block.vercel.app/api/v1/property'),
            axios.get('https://pro-block.vercel.app/api/v1/user'),
            axios.get('https://pro-block.vercel.app/api/v1/transaction'), // Obtener transacciones
        ]);
        documentData.value = docRes.data;
        propertyData.value = propRes.data;
        usersData.value = userRes.data;
        transactionData.value = transRes.data; // Guardar transacciones
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
});

// Función para obtener el título de la propiedad por ID
const getPropertyTitle = (propertyId) => {
    const property = propertyData.value.find(p => p._id === propertyId);
    return property ? property.title : 'Propiedad desconocida';
};

// Función para obtener el nombre de usuario (vendedor o comprador) por ID
const getUserName = (userId) => {
    const user = usersData.value.find(u => u._id === userId);
    return user ? user.username : 'Usuario desconocido';
};

// Función para obtener el comprador de la transacción
const getBuyerFromTransaction = (propertyId) => {
    const transaction = transactionData.value.find(t => t.property === propertyId && t.status === 'completed');
    return transaction ? transaction.buyer : null;
};

// Función para manejar el cambio de los checkboxes
const handleCheckboxChange = (docId) => {
    if (selectedDocuments.value.includes(docId)) {
        selectedDocuments.value = selectedDocuments.value.filter(id => id !== docId);
    } else {
        selectedDocuments.value.push(docId);
    }
};

// Función para verificar si todos los documentos de la propiedad están seleccionados
const isAllDocumentsSelected = (propertyId) => {
    const docsForProperty = documentData.value.filter(doc => doc.idproperty === propertyId);
    return docsForProperty.every(doc => selectedDocuments.value.includes(doc._id));
};

// Función para aprobar la verificación de los documentos
const approveVerification = async(propertyId) => {
    if (selectedDocuments.value.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'Por favor, selecciona al menos un documento para aprobar la verificación.',
        });
        return;
    }

    // Confirmar acción
    const result = await Swal.fire({
        title: '¿Está seguro?',
        text: 'Esta acción aprobará la verificación de los documentos seleccionados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, aprobar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`https://pro-block.vercel.app/api/v1/property/${propertyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isVerify: true })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el verificado de la propiedad.');
            }

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: `Los documentos de la propiedad ${propertyId} han sido aprobados.`,
            });

            // Limpiar selección de documentos
            selectedDocuments.value = [];
            window.location.reload();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Hubo un problema al aprobar la verificación.',
            });
        }
    }
};

// Filtrar propiedades que tienen isVerify en false y tienen documentos subidos
const filteredProperties = computed(() => {
    return propertyData.value.filter(property => 
        !property.isVerify &&
        documentData.value.some(doc => doc.idproperty === property._id)
    );
});

// Computed para verificar si no hay propiedades para verificar
const hasPropertiesToVerify = computed(() => filteredProperties.value.length > 0);
</script>

<template>
    <h1>Aprobar Documentos</h1>

    <!-- Mensaje si no hay propiedades que verificar -->
    <div v-if="!hasPropertiesToVerify" class="alert alert-info">
        No hay propiedades pendientes de verificación.
    </div>

    <div v-for="property in filteredProperties" :key="property._id" class="border p-2 rounded border-primary">
        <h3>{{ getPropertyTitle(property._id) }}</h3>
        <p><strong>Vendedor:</strong> {{ getUserName(property.owner) }}</p>
        <!-- <p><strong>Comprador:</strong> {{ getUserName(getBuyerFromTransaction(property._id)) }}</p> -->

        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Documento</th>
                    <th>Visualizar</th>
                    <th>Seleccionar</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="doc in documentData.filter(d => d.idproperty === property._id)" :key="doc._id">
                    <td>{{ doc.fileUrl }}</td>
                    <td>
                        <a :href="'http://localhost:3000' + doc.fileUrl" target="_blank" class="btn btn-primary">Ver Documento</a>
                    </td>
                    <td>
                        <input type="checkbox" :value="doc._id" @change="handleCheckboxChange(doc._id)">
                    </td>
                </tr>
            </tbody>
        </table>

        <button 
            class="btn btn-success" 
            :disabled="!isAllDocumentsSelected(property._id)" 
            @click="approveVerification(property._id)">
            Aprobar Verificación
        </button>
    </div>
</template>

<style scoped>
.table {
    margin-top: 20px;
}
</style>
