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



const downloadFile = (url, filename) => {
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = filename; // Asigna el nombre de archivo
    // document.body.appendChild(link);
    // link.click(); // Simula un clic en el enlace
    // document.body.removeChild(link); // Elimina el enlace del DOM
    window.open(url, '_blank'); // Abre el URL en una nueva pestaña
}

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
const approveVerification = async (propertyId) => {
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
    <div class="container">
        <h1 class="my-4 text-center">Aprobar Documentos</h1>

        <!-- Mensaje si no hay propiedades que verificar -->
        <div v-if="!hasPropertiesToVerify" class="alert alert-info text-center">
            No hay propiedades pendientes de verificación.
        </div>

        <!-- Lista de propiedades a verificar -->
        <div v-for="property in filteredProperties" :key="property._id" class="card mb-4 shadow-sm">
            <div class="card-body">
                <h3 class="card-title">{{ getPropertyTitle(property._id) }}</h3>
                <p><strong>Vendedor:</strong> {{ getUserName(property.owner) }}</p>

                <div class="table-responsive">
                    <table class="table table-hover table-bordered">
                        <thead class="thead-dark">
                            <tr>
                                <th>Documento</th>
                                <th>Visualizar</th>
                                <th>Revisado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="doc in documentData.filter(d => d.idproperty === property._id)" :key="doc._id">
                                <td>{{ doc.fileUrl.split('/').pop() }}</td>
                                <td>
                                  

                                    <!-- Botón personalizado con íconos de archivo -->
                                    <button class="Documents-btn"  @click.prevent="downloadFile(doc.fileUrl, doc.fileUrl.split('/').pop())">
                                        <span class="folderContainer">
                                            <!-- Icono de archivo (Fondo) -->
                                            <svg class="fileBack" width="146" height="113" viewBox="0 0 146 113"
                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M0 4C0 1.79086 1.79086 0 4 0H50.3802C51.8285 0 53.2056 0.627965 54.1553 1.72142L64.3303 13.4371C65.2799 14.5306 66.657 15.1585 68.1053 15.1585H141.509C143.718 15.1585 145.509 16.9494 145.509 19.1585V109C145.509 111.209 143.718 113 141.509 113H3.99999C1.79085 113 0 111.209 0 109V4Z"
                                                    fill="url(#paint0_linear_117_4)"></path>
                                                <defs>
                                                    <linearGradient id="paint0_linear_117_4" x1="0" y1="0" x2="72.93"
                                                        y2="95.4804" gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#8F88C2"></stop>
                                                        <stop offset="1" stop-color="#5C52A2"></stop>
                                                    </linearGradient>
                                                </defs>
                                            </svg>

                                            <!-- Icono de página de archivo -->
                                            <svg class="filePage" width="88" height="99" viewBox="0 0 88 99" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <rect width="88" height="99" fill="url(#paint0_linear_117_6)"></rect>
                                                <defs>
                                                    <linearGradient id="paint0_linear_117_6" x1="0" y1="0" x2="81"
                                                        y2="160.5" gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="white"></stop>
                                                        <stop offset="1" stop-color="#686868"></stop>
                                                    </linearGradient>
                                                </defs>
                                            </svg>

                                            <!-- Icono de frente de archivo -->
                                            <svg class="fileFront" width="160" height="79" viewBox="0 0 160 79"
                                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M0.29306 12.2478C0.133905 9.38186 2.41499 6.97059 5.28537 6.97059H30.419H58.1902C59.5751 6.97059 60.9288 6.55982 62.0802 5.79025L68.977 1.18034C70.1283 0.410771 71.482 0 72.8669 0H77H155.462C157.87 0 159.733 2.1129 159.43 4.50232L150.443 75.5023C150.19 77.5013 148.489 79 146.474 79H7.78403C5.66106 79 3.9079 77.3415 3.79019 75.2218L0.29306 12.2478Z"
                                                    fill="url(#paint0_linear_117_5)"></path>
                                                <defs>
                                                    <linearGradient id="paint0_linear_117_5" x1="38.7619" y1="8.71323"
                                                        x2="66.9106" y2="82.8317" gradientUnits="userSpaceOnUse">
                                                        <stop stop-color="#C3BBFF"></stop>
                                                        <stop offset="1" stop-color="#51469A"></stop>
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </span>
                                        <p class="text">ver</p>
                                    </button>
                                </td>

                                <td class="text-center">
                                    <label class="container">
                                        <input type="checkbox" :value="doc._id" @change="handleCheckboxChange(doc._id)">
                                        <div class="checkmark">
                                            <svg viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                                class="icon">
                                                <path
                                                    d="M 24.10 6.29 Q 28.34 7.56 28.00 12.00 Q 27.56 15.10 27.13 18.19 A 0.45 0.45 4.5 0 0 27.57 18.70 Q 33.16 18.79 38.75 18.75 Q 42.13 18.97 43.23 21.45 Q 43.91 22.98 43.27 26.05 Q 40.33 40.08 40.19 40.44 Q 38.85 43.75 35.50 43.75 Q 21.75 43.75 7.29 43.75 A 1.03 1.02 0.0 0 1 6.26 42.73 L 6.42 19.43 A 0.54 0.51 -89.4 0 1 6.93 18.90 L 14.74 18.79 A 2.52 2.31 11.6 0 0 16.91 17.49 L 22.04 7.17 A 1.74 1.73 21.6 0 1 24.10 6.29 Z M 21.92 14.42 Q 20.76 16.58 19.74 18.79 Q 18.74 20.93 18.72 23.43 Q 18.65 31.75 18.92 40.06 A 0.52 0.52 88.9 0 0 19.44 40.56 L 35.51 40.50 A 1.87 1.83 5.9 0 0 37.33 39.05 L 40.51 23.94 Q 40.92 22.03 38.96 21.97 L 23.95 21.57 A 0.49 0.47 2.8 0 1 23.47 21.06 Q 23.76 17.64 25.00 12.00 Q 25.58 9.36 24.28 10.12 Q 23.80 10.40 23.50 11.09 Q 22.79 12.80 21.92 14.42 Z M 15.57 22.41 A 0.62 0.62 0 0 0 14.95 21.79 L 10.01 21.79 A 0.62 0.62 0 0 0 9.39 22.41 L 9.39 40.07 A 0.62 0.62 0 0 0 10.01 40.69 L 14.95 40.69 A 0.62 0.62 0 0 0 15.57 40.07 L 15.57 22.41 Z"
                                                    fill-opacity="1.000"></path>
                                                <circle r="1.51" cy="37.50" cx="12.49" fill-opacity="1.000"></circle>
                                            </svg>
                                        </div>
                                        <p class="like">Liked!</p>
                                    </label>
                                </td>

                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="text-center mt-3">
                    <button class="btn btn-success" :disabled="!isAllDocumentsSelected(property._id)"
                        @click="approveVerification(property._id)">
                        Aprobar Verificación
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 15px;
}

h1 {
    font-size: 2rem;
    color: #343a40;
    font-weight: bold;
}

.card {
    border: none;
    border-radius: 10px;
    transition: box-shadow 0.3s ease;
}

.card-body {
    padding: 20px;
}

.card-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #007bff;
    font-weight: bold;
}

.table-responsive {
    margin-top: 15px;
}

.table {
    margin-bottom: 0;
}

.table th,
.table td {
    text-align: center;
    vertical-align: middle;
}

.thead-dark {
    background-color: #343a40;
    color: white;
}

.table-hover tbody tr:hover {
    background-color: #f1f1f1;
}

.btn {
    transition: background-color 0.3s ease, transform 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
}

.btn-success:disabled {
    background-color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
}

.alert {
    font-size: 1.2rem;
    padding: 20px;
    margin-top: 20px;
}

@media (max-width: 768px) {
    h1 {
        font-size: 1.5rem;
    }

    .card-title {
        font-size: 1.2rem;
    }

    .table-responsive {
        overflow-x: auto;
    }

    .btn {
        font-size: 0.9rem;
    }
}

/* From Uiverse.io by Praashoo7 */
/* Hide the default checkbox */
.container input {
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}



/* Create a custom checkbox */
.checkmark {
    position: relative;
    top: 0;
    left: 0;
    height: 3em;
    width: 3em;
    background-color: #171717;
    border-radius: 10px;
    transition: .2s ease-in-out;
    z-index: 2;
}

.like {
    position: relative;
    font-size: 0.8em;
    top: -3.5em;
    text-align: center;
    z-index: -1;
}

.icon {
    margin: 0.2em;
    fill: white;
    transition: .4s ease-in-out;
}

.checkmark:hover {
    background-color: white;
}

.checkmark:hover .icon {
    fill: black;
    transform: rotate(-8deg);
    transform-origin: bottom left;
}

/* When the checkbox is checked, add a blue background */
.container input:checked~.checkmark {
    background-color: rgb(55, 205, 50);
}

.container input:checked~.like {
    color: white;
    animation: 0.6s up_3951;
}

.container input:checked~.checkmark .icon {
    fill: white;
    transform: none;
    animation: 0.5s jump_3951;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

/* Show the checkmark when checked */
.container input:checked~.checkmark:after {
    display: block;
}

@keyframes up_3951 {
    100% {
        transform: translateY(-2em);
    }
}

@keyframes jump_3951 {
    50% {
        transform-origin: center;
        transform: translateY(-0.5em) rotate(-8deg);
    }

    100% {
        transform-origin: center;
        transform: translateY(0em);
    }
}
.Documents-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  height: 45px;
  border: none;
  padding: 0px 15px;
  border-radius: 5px;
  background-color: rgb(49, 49, 83);
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}
.folderContainer {
  width: 40px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.fileBack {
  z-index: 1;
  width: 80%;
  height: auto;
}
.filePage {
  width: 50%;
  height: auto;
  position: absolute;
  z-index: 2;
  transition: all 0.3s ease-out;
}
.fileFront {
  width: 85%;
  height: auto;
  position: absolute;
  z-index: 3;
  opacity: 0.95;
  transform-origin: bottom;
  transition: all 0.3s ease-out;
}
.text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.Documents-btn:hover .filePage {
  transform: translateY(-5px);
}
.Documents-btn:hover {
  background-color: rgb(58, 58, 94);
}
.Documents-btn:active {
  transform: scale(0.95);
}
.Documents-btn:hover .fileFront {
  transform: rotateX(30deg);
}

</style>
