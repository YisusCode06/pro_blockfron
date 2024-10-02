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
            <div id="contentArea" v-html="contentArea"></div>
        </div>

        <div id="tooltip" class="tooltip-custom" v-if="tooltipVisible"
            :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }">
            {{ tooltipText }}
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
                                <label class="form-check-label" :for="'condition' + index">
                                    {{ condition.text }}
                                </label>
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
            contentArea: '',
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
        };
    },
    methods: {
        toggleSidebar() {
            this.isCollapsed = !this.isCollapsed;
        },
        async loadCatalog() {
            this.contentArea = `<h2>Catálogo de Inmuebles Disponibles</h2><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>`;
            try {
                const response = await fetch('https://pro-block.vercel.app/api/v1/property');
                const properties = await response.json();
                const propertiesForSale = properties.filter(property => property.isForSale);

                if (propertiesForSale.length > 0) {
                    let propertyListHTML = '<div class="row">';

                    for (const property of propertiesForSale) {
                        const ownerUsername = await this.getUsername(property.owner);
                        propertyListHTML += `
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div id="carousel-${property._id}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                      ${property.images.map((img, index) => `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                          <img src="${img}" class="d-block w-100" alt="Imagen del inmueble">
                        </div>
                      `).join('')}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${property._id}" data-bs-slide="prev">
                      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel-${property._id}" data-bs-slide="next">
                      <span class="carousel-control-next-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Next</span>
                    </button>
                  </div>
                  <div class="card-body">
                    <p class="card-text">Vendido por: ${ownerUsername}</p>
                    <button class="btn btn-success">Disponible</button>
                    <h5 class="card-title">${property.title}</h5>
                    <p class="card-text">${property.description}</p>
                    <p class="card-text"><strong>Precio:</strong> XTZ/ ${property.price}</p>
                    <p class="card-text"><strong>Tamaño:</strong> ${property.size} m²</p>
                    <p class="card-text"><strong>Ubicación:</strong> ${property.address.street}, ${property.address.city}</p>
                   <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#termsModal" @click="setSelectedPropertyPrice(property.price)">Comprar</button>
                  </div>
                </div>
              </div>
            `;
                    }

                    propertyListHTML += '</div>';
                    this.contentArea = propertyListHTML;
                } else {
                    this.contentArea = '<p>No hay inmuebles disponibles para la venta.</p>';
                }
            } catch (error) {
                this.contentArea = '<p>Error al cargar los inmuebles. Inténtalo de nuevo más tarde.</p>';
                console.error(error);
            }
        },
        async getUsername(ownerId) {
            try {
                const response = await fetch(`https://pro-block.vercel.app/api/v1/user/${ownerId}`);
                const user = await response.json();
                this.walletAddress = user.walletAddress;
                return user.username || 'Desconocido';
            } catch (error) {
                console.error(`Error al obtener el usuario con ID ${ownerId}:`, error);
                return 'Desconocido';
            }
        },
        setSelectedPropertyPrice(price) {
            console.log("Selected property price:", price); // Debug log
            this.selectedPropertyPrice = price; // Set the selected property's price
        },

        loadPurchased() {
            this.contentArea = `
        <h2>Inmuebles Comprados</h2>
        <p>Aquí puede ver los inmuebles que ha comprado.</p>
      `;
        },
        acceptTerms() {
            console.log("Términos aceptados. Procesando compra...");
            this.connectWallet();
            const modal = this.$refs.termsModal;
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide(); // Cierra el modal
            }
        },
        logout() {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            window.location.href = '/';
        },
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
        async sendTezos() {
            try {
                // Verificar si el wallet está conectado
                if (!this.wallet || !this.wallet.connected) {
                    throw new Error("Temple Wallet no está conectado. Conéctalo primero.");
                }

                // Use the selected property price instead of a static value
                const amountInTezos = parseFloat(this.selectedPropertyPrice); // Ensure it's a float
 // Use the price from the selected property
                console.log(amountInTezos); //
                // Realizar la transacción
                const operation = await this.tezos.wallet.transfer({
                    to: this.walletAddress,
                    amount: 10, // Use the selected property's price here
                }).send();

                // Esperar la confirmación
                await operation.confirmation();
                this.transactionHash = operation.opHash;
                console.info(`Transacción exitosa: ${this.transactionHash}`);
            } catch (err) {
                console.error('Error al enviar Tezos:', err);
            }
        },

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
