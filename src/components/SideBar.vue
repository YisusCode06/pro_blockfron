<script setup>
import axios from "axios";
import { ref, onMounted } from 'vue';
import RegistroInmueble from "./vendedor/RegistroInmueble.vue";
import ListaInmueble from "./vendedor/ListaInmueble.vue";
import HistorialVentas from "./vendedor/HistorialVentas.vue";
import CatalogoInmueble from "./comprador/CatalogoInmueble.vue";
import HistorialCompras from "./comprador/HistorialCompras.vue";
import DocumentosPendientes from "./notario/DocumentosPendientes.vue";
import HistorialDocumentos from "./notario/HistorialDocumentos.vue";

// Obtener la cookie del usuario
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const userData = ref(null);
const selectedOption = ref(''); // Opción seleccionada

onMounted(async () => {
  const userId = getCookie('userId');
  if (!userId) {
    alert('Debe iniciar sesión para ver este contenido');
    // Redirigir a la página de login si es necesario
    // window.location.href = '/login';
    return;
  }

  try {
    const response = await axios.get(`https://pro-block.vercel.app/api/v1/user/${userId}`);
    userData.value = response.data;
    console.log(userData.value);
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
  }
});

// Función para cambiar la opción seleccionada
const selectOption = (option) => {
  selectedOption.value = option;
};

const logout = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  window.location.href = '/';
};
</script>


<template>
  <div class="container-fluid">
    <div class="row flex-nowrap">
      <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
        <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">

          <h1 class="fs-5 d-none d-sm-inline">Menu</h1>

          <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">

            <!-- Opciones para vendedor -->
            <li v-if="userData && userData.role === 'seller'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('registro-inmueble')">
                <box-icon name='home' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Registro de inmueble</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'seller'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('lista-inmueble')">
                <box-icon name='list-ul' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Lista de inmuebles</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'seller'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('historial-ventas')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Historial de ventas</span>
              </a>
            </li>

            <!-- Opciones para comprador -->
            <li v-if="userData && userData.role === 'buyer'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('catalogo-inmueble')">
                <box-icon name='book' type='solid' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Catalogo de inmuebles</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'buyer'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('historial-compras')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Historial de compra</span>
              </a>
            </li>

            <!-- Opciones para admin -->
            <li v-if="userData && userData.role === 'admin'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('documentos-pendientes')">
                <box-icon name='book-content' type='solid' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Documentos pendientes</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'admin'" class="nav-item">
              <a href="#" class="nav-link align-middle px-0" @click="selectOption('historial-documentos')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'></box-icon> <span
                  class="ms-1 d-none d-sm-inline">Historial de documentos</span>
              </a>
            </li>

          </ul>

          <hr>
          <div class="pb-4 end-cont">
            <h1 v-if="userData">{{ userData.username }}</h1>
            <h1 v-else>Cargando...</h1>
            <button type="button" class="btn btn-danger w-100" @click="logout">Cerrar Sesion</button>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="cp-comp col py-3">
        <!-- Mostrar componente según la opción seleccionada -->
        <registro-inmueble v-if="selectedOption === 'registro-inmueble'"/>
        <lista-inmueble v-if="selectedOption === 'lista-inmueble'"/>
        <historial-ventas v-if="selectedOption === 'historial-ventas'"/>
        <catalogo-inmueble v-if="selectedOption === 'catalogo-inmueble'"/>
        <historial-compras v-if="selectedOption === 'historial-compras'"/>
        <documentos-pendientes v-if="selectedOption === 'documentos-pendientes'"/>
        <historial-documentos v-if="selectedOption === 'historial-documentos'"/>
      </div>
    </div>
  </div>
</template>


<style scoped>
.cp-comp{
  height: 100vh;
  overflow-y: auto;
}
span {
  color: white;
  font-weight: bold;
}

.end-cont {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
