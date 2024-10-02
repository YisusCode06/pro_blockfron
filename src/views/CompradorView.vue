<template>
    <div>
        <button class="btn btn-primary m-3" @click="toggleSidebar">
            <i class="fas" :class="isCollapsed ? 'fa-arrow-right' : 'fa-bars'"></i>
        </button>

        <div :class="['bg-light border', { collapsed: isCollapsed }]" id="sidebar">
            <ul class="list-group list-group-flush position-relative">
                <li class="list-group-item" data-tooltip="Catálogo de inmuebles" @click="loadCatalog">
                    <i class="fas fa-th-list"></i> <span>Catálogo de inmuebles</span>
                </li>
                <li class="list-group-item" data-tooltip="Inmuebles Comprados" @click="loadPurchased">
                    <i class="fas fa-shopping-cart"></i> <span>Inmuebles Comprados</span>
                </li>
                <li class="list-group-item mt-auto" data-tooltip="Cerrar Sesión" @click="logout">
                    <i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>
                </li>
            </ul>
        </div>

        <div :style="{ marginLeft: isCollapsed ? '80px' : '250px' }" id="mainContent" class="p-4">
            <h1>Bienvenido a la gestión Compradores</h1>
            <p>Aquí puede visualizar su catálogo de inmuebles y realizar compras.</p>

            <!-- Catálogo de inmuebles -->
            <div v-if="loading" class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>

            <div v-if="!loading && properties.length > 0" class="row">
                <div class="col-md-4 mb-4" v-for="(property, index) in properties" :key="index">
                    <div class="card">
                        <div :id="'carousel-' + property._id" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                <div v-for="(img, imgIndex) in property.images" :key="imgIndex"
                                    :class="['carousel-item', { active: imgIndex === 0 }]">
                                    <img :src="img" class="d-block w-100" alt="Imagen del inmueble">
                                </div>
                            </div>
                            <button class="carousel-control-prev" type="button"
                                :data-bs-target="'#carousel-' + property._id" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button"
                                :data-bs-target="'#carousel-' + property._id" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>

                        <div class="card-body">
                            <p class="card-text" v-if="property.ownerName">Vendido por: {{ property.ownerName }}</p>
                            <p class="card-text" v-else>Vendido por: Cargando...</p>

                            <h5 class="card-title">{{ property.title }}</h5>
                            <p class="card-text">{{ property.description }}</p>
                            <p class="card-text"><strong>Precio:</strong> XTZ/ {{ property.price }}</p>
                            <p class="card-text"><strong>Tamaño:</strong> {{ property.size }} m²</p>
                            <p class="card-text"><strong>Ubicación:</strong> {{ property.address.street }}, {{
                                property.address.city }}</p>
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#termsModal"
                                @click="setSelectedPropertyPrice(property.price, property._id)">
                                Comprar
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!loading && properties.length === 0">
                <p>No hay inmuebles disponibles para la venta.</p>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true"
            ref="termsModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="termsModalLabel">Términos y Condiciones</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="termsForm">
                            <div class="form-check" v-for="(condition, index) in termsConditions" :key="index">
                                <input class="form-check-input" type="checkbox" :id="'condition' + index"
                                    v-model="condition.accepted">
                                <label class="form-check-label" :for="'condition' + index">{{ condition.text }}</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" @click="acceptTerms">Aceptar</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>


<script>
import { TempleWallet } from "@temple-wallet/dapp";
export default {
    data() {
        return {
            walletAddress: '',
            isCollapsed: false,
            properties: [],
            loading: false,
            tooltipVisible: false,
            tooltipText: '',
            tooltipX: 0,
            tooltipY: 0,
            termsConditions: [
                { text: 'El vendedor entregará el bien, siempre y cuando se le haya transferido la cantidad acordada y esté verificado por el notario.', accepted: false },
                { text: 'El vendedor se compromete a mantener la seguridad y confidencialidad de la información del comprador.', accepted: false },
                { text: 'Se cobrará 10 tez para la comisión del notario.', accepted: false }
            ],
            wallet: null,
            tezos: null,
            transactionHash: null,
            selectedPropertyPrice: '',
            selectedPropertyId: null, // Añadir ID de la propiedad seleccionada
        };
    },
    methods: {
        // Toggle sidebar collapse
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
        },

        // Load the list of properties from the API
        async loadCatalog() {
            this.loading = true;
            try {
                const response = await fetch('https://pro-block.vercel.app/api/v1/property');
                const properties = await response.json();
                this.properties = properties.filter(property => property.isForSale);

                // Preload usernames for all properties
                for (let property of this.properties) {
                    property.ownerName = await this.getUsername(property.owner); // Almacena el nombre del propietario
                }
            } catch (error) {
                console.error('Error al cargar los inmuebles:', error);
            } finally {
                this.loading = false;
            }
        },

        // Get the username of the property owner based on their ID
        async getUsername(ownerId) {
            try {
                const response = await fetch(`https://pro-block.vercel.app/api/v1/user/${ownerId}`);
                const user = await response.json();
                return user.username || 'Desconocido';
            } catch (error) {
                console.error(`Error al obtener el usuario con ID ${ownerId}:`, error);
                return 'Desconocido';
            }
        },

        // Set the price and ID of the selected property for purchase
        setSelectedPropertyPrice(price, id) {
            this.selectedPropertyPrice = price;
            this.selectedPropertyId = id; // Establecer el ID de la propiedad seleccionada
        }
        ,

        // Load the purchased properties section
        loadPurchased() {
            this.contentArea = `
                <h2>Inmuebles Comprados</h2>
                <p>Aquí puede ver los inmuebles que ha comprado.</p>
            `;
        },

        // Handle terms acceptance and initiate purchase
        acceptTerms() {
            console.log("Términos aceptados. Procesando compra...");
            this.connectWallet();
            const modal = this.$refs.termsModal;
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
            }
        },

        // Log out and clear cookies
        logout() {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            window.location.href = '/';
        },

        // Connect the user's Temple Wallet
        async connectWallet() {
            try {
                const available = await TempleWallet.isAvailable();
                if (!available) {
                    throw new Error("Temple Wallet no está instalado");
                }

                this.wallet = new TempleWallet("Mi DApp");
                await this.wallet.connect("ghostnet");
                this.tezos = this.wallet.toTezos();
                this.walletAddress = await this.tezos.wallet.pkh();
                console.info(`Dirección conectada: ${this.walletAddress}`);
                this.sendTezos();
            } catch (err) {
                console.error('Error al conectar la wallet:', err);
            }
        },

        // Send Tezos payment for the selected property and update isForSale to false
        async sendTezos() {
            try {
                if (!this.wallet || !this.wallet.connected) {
                    throw new Error("Temple Wallet no está conectado. Conéctalo primero.");
                }

                const amountInTezos = parseFloat(this.selectedPropertyPrice);
                console.log("Cantidad en Tezos:", amountInTezos);

                const operation = await this.tezos.wallet.transfer({
                    to: this.walletAddress,
                    amount: amountInTezos // Amount set by selected property
                }).send();

                await operation.confirmation();
                this.transactionHash = operation.opHash;
                console.info(`Transacción exitosa: ${this.transactionHash}`);
                alert(`Transacción exitosa!  Token de Contrato Inteligente: ${this.transactionHash}`);
                // Actualizar la propiedad en el servidor (isForSale a false)
                await this.updatePropertyStatus(this.selectedPropertyId);
            } catch (err) {
                console.error('Error al enviar Tezos:', err);
            }
        },

        // Actualizar el campo isForSale de la propiedad en la API
        async updatePropertyStatus(propertyId) {
            try {
                console.log(propertyId);
                const response = await fetch(`https://pro-block.vercel.app/api/v1/property/${propertyId}`, {
                    method: 'PUT', // Usamos PATCH para actualizar
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isForSale: false }) // Cambiamos isForSale a false
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar el estado de la propiedad');
                }

                console.log(`Propiedad ${propertyId} actualizada exitosamente.`);
                // Aquí podrías cargar nuevamente el catálogo si quieres refrescar la lista
                this.loadCatalog();
            } catch (error) {
                console.error('Error al actualizar la propiedad:', error);
            }
        }
    }
}
</script>


<style scoped>
.collapsed {
    width: 80px !important;
}

.tooltip-custom {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 5px;
    z-index: 1000;
    display: inline-block;
}
</style>
