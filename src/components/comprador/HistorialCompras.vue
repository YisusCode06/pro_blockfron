<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

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
            (transaction) => transaction.buyer === userData.value._id
        );
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
</script>

<template>
    <div class="container mt-4">
        <h2>Propiedades Compradas</h2>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Propiedad</th>
                    <th scope="col">Vendedor</th>
                    <th scope="col">Monto (Tezos)</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Token de Contrato</th>
                    <th scope="col">Fecha de Creación</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(transaction, index) in userTransactions" :key="transaction._id">
                    <th scope="row">{{ index + 1 }}</th>
                    <!-- Llama a la función getPropertyTitle para obtener el título de la propiedad -->
                    <td>{{ getPropertyTitle(transaction.property) }}</td>
                    <!-- Llama a la función getSellerUsername para obtener el nombre del vendedor -->
                    <td>{{ getSellerUsername(transaction.seller) }}</td>
                    <td>{{ transaction.amount }}</td>
                    <td>{{ transaction.status }}</td>
                    <td>{{ transaction.transactionHash }}</td>
                    <td>{{ new Date(transaction.createdAt).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped></style>