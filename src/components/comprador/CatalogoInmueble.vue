<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { TempleWallet } from "@temple-wallet/dapp";

const userData = ref(null);
const propertyData = ref([]);
const filteredProperties = ref([]); // Propiedades filtradas
const usersData = ref([]); // Cambiar a un array porque contiene una lista de usuarios
const selectedProperty = ref(null); // Propiedad seleccionada al hacer clic en "Comprar"
const showModal = ref(false); // Estado para mostrar/ocultar el modal

// Términos y condiciones
const termsConditions = ref([
    { text: 'El vendedor entregará el bien, siempre y cuando se le haya transferido la cantidad acordada y esté verificado por el notario.', accepted: false },
    { text: 'El vendedor se compromete a mantener la seguridad y confidencialidad de la información del comprador.', accepted: false },
    { text: 'Se cobrará 10 tez para la comisión del notario.', accepted: false }
]);

// Función para obtener cookies
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Función para filtrar las propiedades en venta
const filterPropertiesByOwner = () => {
    if (userData.value && userData.value._id) {
        filteredProperties.value = propertyData.value.filter(
            (property) => property.isForSale === true
        );
    }
};

// Función para obtener el username del dueño de la propiedad
const getOwnerUsername = (ownerId) => {
    const owner = usersData.value.find(user => user._id === ownerId);
    return owner ? owner.username : 'Desconocido';
};

// Función para obtener el addressWallet del dueño de la propiedad
const getOwnerWallet = (ownerId) => {
    const owner = usersData.value.find(user => user._id === ownerId);
    // Verifica si el propietario existe y tiene la propiedad addressWallet
    return owner && owner.walletAddress ? owner.walletAddress : 'Desconocido';
};

// Función que se ejecuta al aceptar los términos
const acceptTermsAndBuy = async () => {
    const allAccepted = termsConditions.value.every(term => term.accepted);
    if (!allAccepted) {
        alert('Debe aceptar todos los términos y condiciones.');
        return;
    }

    if (selectedProperty.value) {
        console.log('Precio de la propiedad:', selectedProperty.value.price);
        console.log('Dirección del propietario:', getOwnerWallet(selectedProperty.value.owner));

        await connectWallet(); // Esperar la conexión a la wallet
        await sendTezos(selectedProperty.value.price, getOwnerWallet(selectedProperty.value.owner)); // Esperar el envío de Tezos
        await updatePropertyStatus(selectedProperty.value._id); // Actualizar el estado de la propiedad
    }

    showModal.value = false;
};

const wallet = ref(null);
const tezos = ref(null);

const connectWallet = async () => {
    try {
        const available = await TempleWallet.isAvailable();
        if (!available) {
            throw new Error("Temple Wallet no está instalado");
        }

        wallet.value = new TempleWallet("Mi DApp");
        await wallet.value.connect("ghostnet");
        tezos.value = wallet.value.toTezos();
        const walletAddress = await tezos.value.wallet.pkh();
        console.info(`Dirección conectada: ${walletAddress}`);
    } catch (err) {
        console.error('Error al conectar la wallet:', err);
    }
};

const sendTezos = async (amountInTezos, recipientWalletAddress) => {
    try {
        if (!wallet.value || !wallet.value.connected) {
            throw new Error("Temple Wallet no está conectado. Conéctalo primero.");
        }

        console.log("Cantidad en Tezos:", amountInTezos);

        const operation = await tezos.value.wallet.transfer({
            to: recipientWalletAddress, // Corregido nombre de variable
            amount: amountInTezos,
        }).send();

        await operation.confirmation();
        const transactionHash = operation.opHash;
        console.info(`Transacción exitosa: ${transactionHash}`);
        alert(`Transacción exitosa! Token de Contrato Inteligente: ${transactionHash}`);
    } catch (err) {
        console.error('Error al enviar Tezos:', err);
    }
};


// Actualizar el campo isForSale de la propiedad en la API
const updatePropertyStatus = async (propertyId) => {
    try {
        const response = await fetch(`https://pro-block.vercel.app/api/v1/property/${propertyId}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isForSale: false }) 
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el estado de la propiedad');
        }

        console.log(`Propiedad ${propertyId} actualizada exitosamente.`);
        // Volver a cargar los datos del catálogo
        await filterPropertiesByOwner();
    } catch (error) {
        console.error('Error al actualizar la propiedad:', error);
    }
};



// Cuando el componente se monta, obtenemos los datos del usuario
onMounted(async () => {
    const userId = getCookie('userId');
    if (!userId) {
        alert('Debe iniciar sesión para ver este contenido');
        return;
    }

    try {
        const response = await axios.get(`https://pro-block.vercel.app/api/v1/user/${userId}`);
        userData.value = response.data;

        // Filtrar propiedades cuando ya tengamos los datos del usuario
        filterPropertiesByOwner();
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
    }
});

// Cargar lista de todos los usuarios al montar el componente
onMounted(async () => {
    try {
        const response = await axios.get('https://pro-block.vercel.app/api/v1/user/');
        usersData.value = response.data; // Asegurarse de que usersData sea un array

    } catch (error) {
        console.error('Error al obtener los datos de los usuarios:', error);
    }
});

// Cargar lista de inmuebles al montar el componente
onMounted(async () => {
    try {
        const response = await axios.get('https://pro-block.vercel.app/api/v1/property');
        propertyData.value = response.data;

        // Filtrar propiedades después de cargar las propiedades
        filterPropertiesByOwner();
    } catch (error) {
        console.error('Error al obtener los datos de los inmuebles:', error);
    }
});

// Mostrar el modal cuando el usuario hace clic en "Comprar"
const openBuyModal = (property) => {
    selectedProperty.value = property; // Guardamos la propiedad seleccionada
    showModal.value = true; // Mostramos el modal
};
</script>

<template>
    <div class="container">
        <h1>Catálogo de Inmuebles</h1>
        <div class="row">
            <!-- Iteramos sobre los inmuebles filtrados para mostrarlos en tarjetas -->
            <div v-for="property in filteredProperties" :key="property._id" class="col-md-4 mb-4">
                <div class="card h-100">
                    <!-- Mostrar la imagen principal del inmueble -->
                    <img :src="property.images[0]" class="card-img-top" alt="Imagen del inmueble" />

                    <div class="card-body">
                        <!-- Título del inmueble -->
                        <h5 class="card-title">{{ property.title }}</h5>

                        <!-- Descripción breve -->
                        <p class="card-text">{{ property.description }}</p>

                        <!-- Precio del inmueble -->
                        <p class="card-text"><strong>Precio:</strong> ${{ property.price }}</p>

                        <!-- Tamaño del inmueble -->
                        <p class="card-text"><strong>Tamaño:</strong> {{ property.size }} m²</p>

                        <!-- Dirección del inmueble -->
                        <p class="card-text">
                            <strong>Dirección:</strong> {{ property.address.street }}, {{ property.address.city }},
                            {{ property.address.state }}, {{ property.address.country }}
                        </p>

                        <!-- Estado de venta -->
                        <p class="card-text">
                            <strong>Estado:</strong> {{ property.isForSale ? 'En venta' : 'No está en venta' }}
                        </p>
                    </div>
                    <button type="button" class="btn btn-success" @click="openBuyModal(property)">Comprar</button>
                    <!-- Mostrar la fecha de creación del inmueble -->
                    <div class="card-footer text-muted">
                        Publicado el: {{ new Date(property.createdAt).toLocaleDateString() }}
                        <br>
                        Vendido por: {{ getOwnerUsername(property.owner) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para aceptar términos y condiciones -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <h2>Términos y Condiciones</h2>
                <div v-for="(term, index) in termsConditions" :key="index">
                    <label>
                        <input type="checkbox" v-model="term.accepted" />
                        {{ term.text }}
                    </label>
                </div>
                <button @click="acceptTermsAndBuy">Aceptar y Comprar</button>
                <button @click="showModal = false">Cancelar</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-img-top {
    object-fit: cover;
    height: 200px;
}

/* Estilos para el modal */
.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
}
</style>
