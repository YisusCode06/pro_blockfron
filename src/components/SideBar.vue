<script setup>
import axios from "axios";
import { ref, onMounted } from 'vue';
import { getCookie, logout } from "./Sidebar";
import RegistroInmueble from "./vendedor/RegistroInmueble.vue";
import ListaInmueble from "./vendedor/ListaInmueble.vue";
import HistorialVentas from "./vendedor/HistorialVentas.vue";
import CatalogoInmueble from "./comprador/CatalogoInmueble.vue";
import HistorialCompras from "./comprador/HistorialCompras.vue";
import DocumentosPendientes from "./notario/DocumentosPendientes.vue";
import HistorialDocumentos from "./notario/HistorialDocumentos.vue";
import VerificacionesPendientes from "./notario/VerificacionesPendientes.vue";

const userData = ref(null);
const selectedOption = ref('');

onMounted(async () => {
  const userId = getCookie('userId');
  if (!userId) {
    alert('Debe iniciar sesión para ver este contenido');
    window.location.href = '/';
    return;
  }

  try {
    const response = await axios.get(`https://pro-block.vercel.app/api/v1/user/${userId}`);
    userData.value = response.data;

    // Dependiendo del rol del usuario, establecer el primer componente por defecto
    if (userData.value.role === 'seller') {
      selectedOption.value = 'registro-inmueble'; // Primer componente para vendedor
    } else if (userData.value.role === 'buyer') {
      selectedOption.value = 'catalogo-inmueble'; // Primer componente para comprador
    } else if (userData.value.role === 'admin') {
      selectedOption.value = 'documentos-pendientes'; // Primer componente para admin
    }

  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
  }
});

const selectOption = (option) => {
  selectedOption.value = option;
};

const currentTime = ref(''); 

const updateTime = () => {
  const now = new Date();
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  currentTime.value = now.toLocaleString('en-US', options);
};

setInterval(updateTime, 1000);

onMounted(() => {
  updateTime();
});
</script>

<template>
  <body>
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="../assets/images/descarga.jpeg" alt="logo" />
        <h2>Inmobiliaria</h2>
      </div>
      <ul class="sidebar-links">
        <h4 v-if="userData && userData.role === 'seller'">
          <span>Menu Vendedor</span>
          <div class="menu-separator"></div>
        </h4>
        <li v-if="userData && userData.role === 'seller'">
          <a href="" @click.prevent="selectOption('registro-inmueble')">
            <span class="bx bxs-dashboard"></span>Registro de inmueble</a>
        </li>
        <li v-if="userData && userData.role === 'seller'">
          <a href="#" @click.prevent="selectOption('lista-inmueble')"><span class="bx bx-show"></span>Lista de
            inmuebles</a>
        </li>
        <li v-if="userData && userData.role === 'seller'">
          <a href="#" @click.prevent="selectOption('historial-ventas')"><span
              class="bx bxs-bar-chart-alt-2"></span>Historial de ventas</a>
        </li>
        <h4 v-if="userData && userData.role === 'buyer'">
          <span>Menu Comprador</span>
          <div class="menu-separator"></div>
        </h4>
        <li v-if="userData && userData.role === 'buyer'">
          <a href="#" @click.prevent="selectOption('catalogo-inmueble')"><span class="bx bx-folder"></span>Catalogo de
            inmuebles</a>
        </li>
        <li v-if="userData && userData.role === 'buyer'">
          <a href="#" @click.prevent="selectOption('historial-compras')"><span class="bx bxs-group"></span>Historial de
            compra</a>
        </li>
        <h4 v-if="userData && userData.role === 'admin'">
          <span>Menu Notario</span>
          <div class="menu-separator"></div>
        </h4>
        <li v-if="userData && userData.role === 'admin'">
          <a href="#" @click.prevent="selectOption('documentos-pendientes')"><span
              class="bx bx-folder"></span>Documentos Pendientes</a>
        </li>
        <li v-if="userData && userData.role === 'admin'">
          <a href="#" @click.prevent="selectOption('historial-documentos')"><span class="bx bx-folder"></span>Historial
            de documentos</a>
        </li>
        <li v-if="userData && userData.role === 'admin'">
          <a href="#" @click.prevent="selectOption('verificaciones-pendientes')"><span
              class="bx bx-folder"></span>Verificaciones Pendientes</a>
        </li>
        <h4>
          <span>Mi Cuenta</span>
          <div class="menu-separator"></div>
        </h4>
        <li>
          <a href="#" @click="logout"><span class="bx bx-log-out"></span>Cerrar Sesion</a>
        </li>
      </ul>
      <div v-if="userData" class="user-account">
        <div class="user-profile">
          <img src="../assets/images/3b73483fa5af06e3ba35f4f71e541e7a.jpg" alt="Profile Image" />
          <div class="user-detail">
            <h3>{{ userData.username }}</h3>
            <span>{{ userData.role }}</span>
          </div>
        </div>
      </div>
    </aside>
    <!-- Contenido principal -->
    <div class="cont-principal">
      <!-- para buyer -->
      <registro-inmueble v-if="selectedOption === 'registro-inmueble'" />
      <lista-inmueble v-if="selectedOption === 'lista-inmueble'" />
      <historial-ventas v-if="selectedOption === 'historial-ventas'" />
      <!-- para seller -->
      <catalogo-inmueble v-if="selectedOption === 'catalogo-inmueble'" />
      <historial-compras v-if="selectedOption === 'historial-compras'" />
      <!-- para admin o notario -->
      <documentos-pendientes v-if="selectedOption === 'documentos-pendientes'" />
      <historial-documentos v-if="selectedOption === 'historial-documentos'" />
      <verificaciones-pendientes v-if="selectedOption === 'verificaciones-pendientes'" />
    </div>
  </body>
</template>

<style scoped>
@import url(./Sidebar.css);
</style>
