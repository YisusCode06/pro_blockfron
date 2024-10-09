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

    // Mostrar el token de contrato (transactionHash)
    doc.text('Token de Contrato:', 20, 140);
    doc.text(transaction.transactionHash, 70, 140); // Token de contrato

    // Línea para la firma (bajo el ID)
    doc.text('_____________________________', 20, 150);
    doc.text('_____________________________', 20, 160);

    doc.text('Firma del Vendedor', 20, 155);
    doc.text('Firma del Comprador', 20, 165);

    // Descargar el PDF
    doc.save(`contrato_transaccion_${transaction._id}.pdf`);
};

</script>

<template>
    <div class="container">
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
                        <button @click="generateTransactionPDF(transaction)" class="download-button">
                            <div class="docs">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2"
                                    fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                Docs
                            </div>
                            <div class="download">
                                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2"
                                    fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </div>
                        </button>

                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.download-button {
  position: relative;
  border-width: 0;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  z-index: 1;
}

.download-button .docs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 4px;
  z-index: 1;
  background-color: #242a35; /* Cambia esto a #111827 si lo deseas */
  border: solid 1px #e8e8e82d;
  transition: all 0.5s cubic-bezier(0.77, 0, 0.175, 1);
}

.download-button:hover {
  box-shadow:
    rgba(0, 0, 0, 0.25) 0px 54px 55px,
    rgba(0, 0, 0, 0.12) 0px -12px 30px,
    rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px,
    rgba(0, 0, 0, 0.09) 0px -3px 5px;
}

.download {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90%;
  margin: 0 auto;
  z-index: -1;
  border-radius: 4px;
  transform: translateY(0%);
  background-color: #01e056; /* Cambia esto a otro color si lo deseas */
  border: solid 1px #01e0572d;
  transition: all 0.5s cubic-bezier(0.77, 0, 0.175, 1);
}

.download-button:hover .download {
  transform: translateY(100%);
}

.download svg polyline,
.download svg line {
  animation: docs 1s infinite;
}

@keyframes docs {
  0% {
    transform: translateY(0%);
  }
  50% {
    transform: translateY(-15%);
  }
  100% {
    transform: translateY(0%);
  }
}
</style>
