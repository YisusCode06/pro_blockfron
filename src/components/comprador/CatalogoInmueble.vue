<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { TempleWallet } from "@temple-wallet/dapp";
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import SaldoTempleWallet from '../general/SaldoTempleWallet.vue';


const userData = ref(null);
const propertyData = ref([]);
const filteredProperties = ref([]); // Propiedades filtradas
const usersData = ref([]); // Cambiar a un array porque contiene una lista de usuarios
const selectedProperty = ref(null); // Propiedad seleccionada al hacer clic en "Comprar"
const showModal = ref(false); // Estado para mostrar/ocultar el modal
const transaccionHash = ref(null); //
// Nuevas variables para los filtros
const selectedFilter = ref(''); // Almacena el filtro seleccionado
const filterValue = ref(''); // Almacena el valor del filtro
const balance = ref(0);

// Términos y condiciones
const termsConditions = ref([
    { text: 'El vendedor entregará el bien, siempre y cuando se le haya transferido la cantidad acordada y esté verificado por el notario.', accepted: false },
    { text: 'El vendedor se compromete a mantener la seguridad y confidencialidad de la información del comprador.', accepted: false },
    { text: 'El comprador debera abonar un porcentaje al notario para la aprobacion de su transaccion', accepted: false }
]);
// Nueva función para filtrar propiedades
const filterProperties = () => {
    // Filtrar propiedades que están a la venta y verificadas
    let properties = propertyData.value.filter(property => property.isForSale === true && property.isVerify === true);

    // Filtrar y ordenar propiedades por precio de menor a mayor
    if (selectedFilter.value === 'precio') {
        // Ordenar las propiedades de menor a mayor precio
        properties = properties.sort((a, b) => a.price - b.price);
    }
    // Filtrar por fecha de publicación
    if (selectedFilter.value === 'fechaPublicacion') {
        properties = properties.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
    }

    // Filtrar por orden alfabético
    if (selectedFilter.value === 'alfabetico') {
        properties = properties.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (selectedFilter.value === 'saldo') {
        properties = properties.filter(property => property.price <= balance.value);
    }
    // Asignar propiedades filtradas
    filteredProperties.value = properties;
};

const updateBalance = (newBalance) => {
    balance.value = newBalance; // Actualizar el saldo
    filterProperties(); // Refiltrar las propiedades cuando se actualiza el saldo
};

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
            (property) => property.isForSale === true && property.isVerify === true
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
        Swal.fire({
            icon: 'error',
            title: 'Faltan términos por aceptar',
            text: 'Debe aceptar todos los términos y condiciones antes de continuar.',
        });
        return;
    }

    if (selectedProperty.value) {
        console.log('Precio de la propiedad:', selectedProperty.value.price);
        console.log('Dirección del propietario:', getOwnerWallet(selectedProperty.value.owner));

        try {
            await connectWallet(); // Esperar la conexión a la wallet
            await sendTezos(selectedProperty.value.price, getOwnerWallet(selectedProperty.value.owner)); // Esperar el envío de Tezos
            await registerTransactions(selectedProperty.value._id, userData.value._id, selectedProperty.value.owner, transaccionHash, selectedProperty.value.price); // Registrar transacción
            await updatePropertyStatus(selectedProperty.value._id); // Actualizar el estado de la propiedad

        } catch (err) {
            // Si hay un error en connectWallet o sendTezos, el flujo se detiene aquí.
            console.error("Error en el proceso de compra:", err);
            alert("Hubo un error en la transacción. Intente de nuevo.");
            return; // Detener ejecución si hay algún error
        }
    }

    showModal.value = false;
    window.location.reload();
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
        transaccionHash.value = operation.opHash;
        console.info(`Transacción exitosa: ${transaccionHash}`);
        alert(`Transacción exitosa! Token de Contrato Inteligente: ${transaccionHash}`);
    } catch (err) {
        console.error('Error al enviar Tezos:', err);
        throw new Error("Error al enviar Tezos"); // Lanza el error para que se detenga el flujo
    }
};

const registerTransactions = async (idproperty, idbuyer, idseller, transaccionHash, amount) => {
    const transactionData = {
        property: idproperty,
        buyer: idbuyer,
        seller: idseller,
        transactionHash: transaccionHash.value,
        amount: amount,
    };
    console.log(transactionData);
    try {
        const response = await axios.post('https://pro-block.vercel.app/api/v1/transaction', transactionData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        alert("Transaccion registrada exitosamente");
    } catch (error) {
        console.error('Error al registrar la transaccion:', error);
        alert('Hubo un error al registrar la transaccion');
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
        <h1 class="Titulo">Catálogo de Inmuebles</h1>
        <br>

        <div class="filter-options">
            <select v-model="selectedFilter" @change="filterProperties" class="custom-select">
                <option value="" disabled selected>Seleccionar filtro</option>
                <option value="precio">Precio</option>
                <option value="fechaPublicacion">Fecha de publicación</option>
                <option value="alfabetico">Orden alfabético</option>
                <option value="saldo">Propiedades con precio menor o igual al saldo</option> <!-- Nueva opción -->
            </select>
            <SaldoTempleWallet @balance-updated="updateBalance" />
        </div>

        <br>

        <div class="row">

            <!-- Iteramos sobre los inmuebles filtrados para mostrarlos en tarjetas -->
            <div v-for="property in filteredProperties" :key="property._id" class="col-md-4 mb-4">
                <div class="card">
                    <div class="image_container">
                        <!-- Mostrar la imagen principal del inmueble -->
                        <img :src="property.images[0]" class="image" alt="Imagen del inmueble" />
                    </div>

                    <div class="title">
                        <span>{{ property.title }}</span>
                    </div>
                    <div class="des">
                        <span>{{ property.description }} </span>
                    </div>
                    <div class="size">
                        <span>{{ property.size }} m²</span>
                    </div>

                    <div class="action">
                        <div class="price">
                            <span> {{ property.price }} TEZ</span>
                        </div>
                        <button class="btn" @click="openBuyModal(property)">
                            Comprar
                        </button>
                    </div>
                    <p class="card-text border p-2 border-info rounded" style="color: white; text-align: center;">
                        <strong> {{ property.isVerify ? 'Verificado ⚕️' : 'Pendiente' }}</strong>
                    </p>
                    <div class="card-footer text-muted">
                        Fecha de publicacion: {{ new Date(property.createdAt).toLocaleDateString() }}
                        <br>
                        Propietario Actual: {{ getOwnerUsername(property.owner) }}
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
@import url(./CatalogoInmueble.css);
</style>
