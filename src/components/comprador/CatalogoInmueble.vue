<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { TempleWallet } from "@temple-wallet/dapp";
import Swal from 'sweetalert2'; // Importamos SweetAlert2

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

    // Asignar propiedades filtradas
    filteredProperties.value = properties;
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
            </select>
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

.card {
    --bg-card: #0E1420;
    --primary: #6d28d9;
    --primary-800: #4c1d95;
    --primary-shadow: #2e1065;
    --light: #d9d9d9;
    --zinc-800: #18181b;
    --bg-linear: linear-gradient(0deg, var(--primary) 50%, var(--light) 125%);

    position: relative;

    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* Aumentamos el espacio entre los elementos */

    padding: 2rem;
    /* Aumentamos el padding */
    width: 22rem;
    /* Aumentamos el ancho de la tarjeta */
    background-color: var(--bg-card);

    border-radius: 1rem;
}

.image_container {
    overflow: hidden;
    cursor: pointer;
    position: relative;
    z-index: 5;
    width: 100%;
    height: 12rem;
    background-color: var(--primary-800);
    border-radius: 0.5rem;
}

.image_container .image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--light);
    text-transform: capitalize;
    
    /* Nuevas propiedades para limitar a una línea */
    overflow: hidden;         /* Oculta el desbordamiento */
    white-space: nowrap;     /* Evita que el texto se divida en varias líneas */
    text-overflow: ellipsis; /* Muestra "..." si el texto se corta */
}


.size {
    font-size: 1rem;
    color: var(--light);
}

.des {
    font-size: 1rem;
    color: var(--light);
    display: -webkit-box;
    /* Usado para el truncado */
    display: box;
    /* Para navegadores que soportan la especificación */
    -webkit-box-orient: vertical;
    /* Orientación vertical */
    overflow: hidden;
    /* Oculta el texto que sobresale */
    -webkit-line-clamp: 1;
    /* Número máximo de líneas a mostrar (webkit) */
    line-clamp: 1;
    /* Número máximo de líneas a mostrar (estándar) */
    text-overflow: ellipsis;
    /* Agrega "..." si el texto es demasiado largo */
}



.action {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--light);
}

.cart-button {
    cursor: pointer;
    padding: 0.5rem 1rem;
    background-color: var(--primary);
    color: var(--light);
    border: none;
    border-radius: 0.5rem;
    transition: background-color 0.3s ease;
}

.cart-button:hover {
    background-color: var(--primary-800);
}

.card-footer {
    font-size: 1rem;
    color: #ffffff;
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

.Titulo {
    color: white;
    background-color: #0E1420;
    text-align: center;
    /* Centra el texto */
    padding: 10px;
    /* Opcional: Espaciado interno para mejorar el aspecto */
}

/* From Uiverse.io by kleenpulse */
.btn {
    --border-color: linear-gradient(-45deg, #ffae00, #7e03aa, #00fffb);
    --border-width: 0.125em;
    --curve-size: 0.5em;
    --blur: 30px;
    --bg: #080312;
    --color: #afffff;
    color: var(--color);
    cursor: pointer;
    /* use position: relative; so that BG is only for .btn */
    position: relative;
    isolation: isolate;
    display: inline-grid;
    place-content: center;
    padding: 0.5em 1.5em;
    font-size: 17px;
    border: 0;
    text-transform: uppercase;
    box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.6);
    clip-path: polygon(
            /* Top-left */
            0% var(--curve-size),
            var(--curve-size) 0,
            /* top-right */
            100% 0,
            100% calc(100% - var(--curve-size)),
            /* bottom-right 1 */
            calc(100% - var(--curve-size)) 100%,
            /* bottom-right 2 */
            0 100%);
    transition: color 250ms;
}

.btn::after,
.btn::before {
    content: "";
    position: absolute;
    inset: 0;
}

.btn::before {
    background: var(--border-color);
    background-size: 300% 300%;
    animation: move-bg7234 5s ease infinite;
    z-index: -2;
}

@keyframes move-bg7234 {
    0% {
        background-position: 31% 0%;
    }

    50% {
        background-position: 70% 100%;
    }

    100% {
        background-position: 31% 0%;
    }
}

.btn::after {
    background: var(--bg);
    z-index: -1;
    clip-path: polygon(
            /* Top-left */
            var(--border-width) calc(var(--curve-size) + var(--border-width) * 0.5),
            calc(var(--curve-size) + var(--border-width) * 0.5) var(--border-width),
            /* top-right */
            calc(100% - var(--border-width)) var(--border-width),
            calc(100% - var(--border-width)) calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)),
            /* bottom-right 1 */
            calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)) calc(100% - var(--border-width)),
            /* bottom-right 2 */
            var(--border-width) calc(100% - var(--border-width)));
    transition: clip-path 500ms;
}

.btn:where(:hover, :focus)::after {
    clip-path: polygon(
            /* Top-left */
            calc(100% - var(--border-width)) calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)),
            calc(100% - var(--border-width)) var(--border-width),
            /* top-right */
            calc(100% - var(--border-width)) var(--border-width),
            calc(100% - var(--border-width)) calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)),
            /* bottom-right 1 */
            calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)) calc(100% - var(--border-width)),
            /* bottom-right 2 */
            calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)) calc(100% - var(--border-width)));
    transition: 200ms;
}

.btn:where(:hover, :focus) {
    color: #fff;
}

.filter-options {
    margin: 20px; /* Margen para separar del resto de los elementos */
    display: flex;
    justify-content:flex-start; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
}

.custom-select {
    display: inline-block;

    width: 100%; /* Ancho completo en dispositivos pequeños */
    max-width: 300px; /* Ancho máximo para pantallas grandes */
    padding: 10px 15px; /* Espaciado interno */
    border: 1px solid #727272; /* Borde del select */
    border-radius: 5px; /* Bordes redondeados */
    background-color: #0E1420; /* Color de fondo */
    color: #e9e1e1; /* Color del texto */
    font-size: 24px; /* Tamaño de la fuente */
    appearance: none; /* Elimina el estilo por defecto */
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23007BFF" stroke-width="2"><path d="M5 8l5 5 5-5H5z"/></svg>'); /* Ícono de flecha */
    background-repeat: no-repeat;
    background-position: right 10px center; /* Posición del ícono */
    background-size: 12px; /* Tamaño del ícono */
    cursor: pointer; /* Cambia el cursor al pasar sobre el select */
    transition: border-color 0.3s ease, background-color 0.3s ease; /* Transición suave para el borde y fondo */
}

.custom-select:hover {
    border-color: #000000; /* Cambia el color del borde al pasar el mouse */
    background-color: #23325241; /* Cambia el color de fondo al pasar el mouse */
}

.custom-select:focus {
    border-color: #000000; /* Cambia el color del borde al enfocarlo */
    outline: none; /* Elimina el contorno por defecto */
}

.custom-select option {
    padding: 10px; /* Espaciado interno para opciones */
    background-color: #0E1420; /* Color de fondo de las opciones */
    color: #ffffff; /* Color del texto de las opciones */
}

/* Estilo responsivo */
@media (max-width: 600px) {
    .custom-select {
        font-size: 14px; /* Tamaño de fuente más pequeño en pantallas pequeñas */
        padding: 8px 12px; /* Espaciado interno reducido en pantallas pequeñas */
    }
}

</style>
