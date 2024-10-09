<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importa SweetAlert2

const userData = ref(null);
const usersData = ref([]);
const propertyData = ref([]);
const transactionData = ref([]);
const userTransactions = ref([]); // Aquí se guardarán las transacciones del usuario

// Función para obtener cookies
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Obtener los datos del usuario
onMounted(async () => {
    const userId = getCookie('userId');
    if (!userId) {
        alert('Debe iniciar sesión para ver este contenido');
        return;
    }

    try {
        const response = await axios.get(`https://pro-block.vercel.app/api/v1/user/${userId}`);
        userData.value = response.data;
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
    }
});

// Cargar lista de inmuebles al montar el componente
onMounted(async () => {
    try {
        const response = await axios.get('https://pro-block.vercel.app/api/v1/property');
        propertyData.value = response.data;
    } catch (error) {
        console.error('Error al obtener los datos de los inmuebles:', error);
    }
});

// Cargar lista de usuarios al montar el componente
onMounted(async () => {
    try {
        const response = await axios.get('https://pro-block.vercel.app/api/v1/user');
        usersData.value = response.data;
    } catch (error) {
        console.error('Error al obtener los datos de los usuarios:', error);
    }
});

// Cargar lista de transacciones al montar el componente
onMounted(async () => {
    try {
        const response = await axios.get('https://pro-block.vercel.app/api/v1/transaction');
        transactionData.value = response.data;

        // Filtrar transacciones por usuario (comprador)
        userTransactions.value = transactionData.value.filter(
            (transaction) => transaction.status === 'pending'
        );

        // Verificar si no hay documentos pendientes
        if (userTransactions.value.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay documentos pendientes',
                text: 'No tienes ninguna transacción pendiente en este momento.',
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al obtener los datos de las transacciones:', error);
    }
});

// Función para obtener el título de la propiedad por ID
const getPropertyTitle = (propertyId) => {
    const property = propertyData.value.find(p => p._id === propertyId);
    return property ? property.title : 'Propiedad desconocida';
};

// Función para obtener el nombre de usuario del vendedor por ID
const getSellerUsername = (sellerId) => {
    const seller = usersData.value.find(user => user._id === sellerId);
    return seller ? seller.username : 'Usuario desconocido';
};

// Función para actualizar el estado de la transacción
const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
        await axios.put(`https://pro-block.vercel.app/api/v1/transaction/${transactionId}`, {
            status: newStatus,
            updatedAt: new Date(),
        });
        
        // Actualizar el estado de la transacción en la tabla
        const transactionIndex = userTransactions.value.findIndex(t => t._id === transactionId);
        if (transactionIndex !== -1) {
            userTransactions.value[transactionIndex].status = newStatus;
            userTransactions.value[transactionIndex].updatedAt = new Date();
        }

        // Mostrar una alerta después de actualizar el estado
        Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: `La transacción ha sido marcada como ${newStatus}.`,
            confirmButtonText: 'Aceptar'
        });

        // Opcional: Recargar la página si es necesario
        // window.location.reload();
    } catch (error) {
        console.error('Error al actualizar el estado de la transacción:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado de la transacción.',
            confirmButtonText: 'Aceptar'
        });
    }
};
</script>

<template>
    <div class="container mt-4">
        <h2>Documentos Pendientes</h2>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Propiedad</th>
                    <th scope="col">Vendedor</th>
                    <th scope="col">Comprador</th>
                    <th scope="col">Monto (Tezos)</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Token de Contrato</th>
                    <th scope="col">Fecha de Creación</th>
                    <th scope="col">Acciones</th> <!-- Nueva columna para acciones -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="(transaction, index) in userTransactions" :key="transaction._id">
                    <th scope="row">{{ index + 1 }}</th>
                    <td>{{ getPropertyTitle(transaction.property) }}</td>
                    <td>{{ getSellerUsername(transaction.seller) }}</td>
                    <td>{{ getSellerUsername(transaction.buyer) }}</td>
                    <td>{{ transaction.amount }}</td>
                    <td>{{ transaction.status }}</td>
                    <td>{{ transaction.transactionHash }}</td>
                    <td>{{ new Date(transaction.createdAt).toLocaleString() }}</td>
                    <td>
                        <!-- Botón para cambiar el estado a 'completed' -->
                        <button @click="updateTransactionStatus(transaction._id, 'completed')" class="btn btn-success btn-sm w-100 mb-3">
                            Completar
                        </button>
                        <!-- Botón para cambiar el estado a 'failed' -->
                        <button @click="updateTransactionStatus(transaction._id, 'failed')" class="btn btn-danger btn-sm w-100">
                            Fallido
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped></style>
