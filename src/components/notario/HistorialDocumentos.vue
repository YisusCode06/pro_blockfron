<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';

const userData = ref(null);
const usersData = ref([]);
const propertyData = ref([]);
const transactionData = ref([]);
const userTransactions = ref([]); 

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

        // Filtrar transacciones por estado "completed" o "failed"
        userTransactions.value = transactionData.value.filter(
            (transaction) => transaction.status === 'failed' || transaction.status === 'completed'
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

// Función para generar el PDF del contrato
const generateTransactionPDF = (transaction) => {
    const doc = new jsPDF({ format: 'a4' }); // Usamos formato A4
    const pageWidth = doc.internal.pageSize.getWidth(); // Ancho de la página

    const propertyTitle = getPropertyTitle(transaction.property);
    const sellerName = getSellerUsername(transaction.seller);
    const buyerName = getSellerUsername(transaction.buyer);

    // Texto básico del contrato en el PDF, siguiendo la ley peruana para inmuebles
    doc.setFontSize(18);
    doc.text('Contrato de Compraventa de Inmueble', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);

    const textContent = `
    En la ciudad de Trujillo, Perú, se celebra el presente contrato de compraventa de inmueble entre las siguientes partes:
    Vendedor: ${sellerName}, identificado con ID, propietario del inmueble ubicado en: ${propertyTitle}.
    Comprador: ${buyerName}, identificado con ID, quien adquiere el mencionado inmueble por la suma de ${transaction.amount} Tezos.
    El presente contrato se realiza conforme a las leyes peruanas, y ambas partes declaran estar de acuerdo con las condiciones de la compraventa.
    La propiedad será transferida en los términos acordados y conforme a la legislación vigente.
    `;

    // Justificación del texto dividiéndolo en líneas
    const splitText = doc.splitTextToSize(textContent, pageWidth - 40); // Márgenes laterales
    doc.text(splitText, 20, 40);

    // Agregar fecha
    doc.text(`Fecha de creación del contrato: ${new Date(transaction.createdAt).toLocaleDateString()}.`, 20, 100);

    // Firmas (IDs de usuario)
    doc.text('ID del Vendedor:', 20, 120);
    doc.text(transaction.seller, 70, 120); // ID del vendedor

    doc.text('ID del Comprador:', 20, 130);
    doc.text(transaction.buyer, 70, 130); // ID del comprador

    // Línea para la firma (bajo el ID)
    doc.text('_____________________________', 20, 140);
    doc.text('_____________________________', 20, 150);

    doc.text('Firma del Vendedor', 20, 145);
    doc.text('Firma del Comprador', 20, 155);

    // Descargar el PDF
    doc.save(`contrato_transaccion_${transaction._id}.pdf`);
};
</script>

<template>
    <div class="container mt-4">
        <h2>Historial de Documentos</h2>
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
                    <th scope="col">Acciones</th>
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
                    <!-- Botón para generar el PDF del contrato individual -->
                    <td>
                        <button @click="generateTransactionPDF(transaction)" class="btn btn-success">
                            Generar Contrato PDF
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped></style>
