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
import VerificacionesPendientes from "./notario/VerificacionesPendientes.vue";

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
const currentTime = ref(''); // Referencia para la hora actual

const updateTime = () => {
  const now = new Date();
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  currentTime.value = now.toLocaleString('en-US', options);
};

// Actualizar la hora cada segundo
setInterval(updateTime, 1000);

onMounted(() => {
  updateTime(); // Llamar a la función para establecer la hora inicialmente
});
</script>

<template>
  <div class="container-fluid">
    <div class="row flex-nowrap">
      <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0 custom-sidebar">
        <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
          <h1 class="fs-5 d-none d-sm-inline">Menu</h1>
          <br>
          <br>
          <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
            <div>
              <div class="card" v-if="userData">
                <p class="time-text"><span>{{ currentTime }}</span><span class="time-sub-text"></span></p>
                <p class="day-text">{{ userData.username }}</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" stroke-width="0"
                  fill="currentColor" stroke="currentColor" class="moon">
                </svg>
             
              </div>
              <br>
            </div>
            <!-- Opciones para vendedor -->
            <li v-if="userData && userData.role === 'seller'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option" @click.prevent="selectOption('registro-inmueble')">
                <box-icon name='home' animation='tada' color='#ffffff' class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Registro de inmueble</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'seller'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option" @click.prevent="selectOption('lista-inmueble')">
                <box-icon name='list-ul' animation='tada' color='#ffffff' class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Lista de inmuebles</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'seller'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option" @click.prevent="selectOption('historial-ventas')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'
                  class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Historial de ventas</span>
              </a>
            </li>

            <!-- Opciones para comprador -->
            <li v-if="userData && userData.role === 'buyer'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option" @click.prevent="selectOption('catalogo-inmueble')">
                <box-icon name='book' type='solid' animation='tada' color='#ffffff' class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Catalogo de inmuebles</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'buyer'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option" @click.prevent="selectOption('historial-compras')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'
                  class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Historial de compra</span>
              </a>
            </li>

            <!-- Opciones para admin -->
            <li v-if="userData && userData.role === 'admin'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option"
                @click.prevent="selectOption('documentos-pendientes')">
                <box-icon name='book-content' type='solid' animation='tada' color='#ffffff'
                  class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Documentos pendientes</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'admin'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option"
                @click.prevent="selectOption('historial-documentos')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'
                  class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Historial de documentos</span>
              </a>
            </li>

            <li v-if="userData && userData.role === 'admin'" class="nav-item">
              <a href="#" class="nav-link align-middle btn-option"
                @click.prevent="selectOption('verificaciones-pendientes')">
                <box-icon name='hourglass-bottom' type='solid' animation='tada' color='#ffffff'
                  class="icon-option"></box-icon>
                <span class="ms-1 d-none d-sm-inline">Verificaciones Pendientes</span>
              </a>
            </li>

          </ul>

          <hr>
          
          <div class="pb-4 end-cont">

            <button  @click="logout">Cerrar Sesion</button>
          </div>

        </div>
      </div>

      <!-- Contenido principal -->
      <div class="cp-comp col py-3">
        <!-- Mostrar componente según la opción seleccionada -->
        <registro-inmueble v-if="selectedOption === 'registro-inmueble'" />
        <lista-inmueble v-if="selectedOption === 'lista-inmueble'" />
        <historial-ventas v-if="selectedOption === 'historial-ventas'" />
        <catalogo-inmueble v-if="selectedOption === 'catalogo-inmueble'" />
        <historial-compras v-if="selectedOption === 'historial-compras'" />
        <documentos-pendientes v-if="selectedOption === 'documentos-pendientes'" />
        <historial-documentos v-if="selectedOption === 'historial-documentos'" />
        <verificaciones-pendientes v-if="selectedOption ==='verificaciones-pendientes'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cp-comp {
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

.card {
  width: 180px;
  height: 160px;
  background: rgb(17, 4, 134);
  border-radius: 15px;
  box-shadow: rgb(0, 0, 0, 0.7) 5px 10px 50px, rgb(0, 0, 0, 0.7) -5px 0px 250px;
  display: flex;
  color: white;
  justify-content: center;
  position: relative;
  flex-direction: column;
  background: linear-gradient(to right, rgb(20, 30, 48), rgb(36, 59, 85));
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.card:hover {
  box-shadow: rgb(0, 0, 0) 5px 10px 50px, rgb(0, 0, 0) -5px 0px 250px;
}

.time-text {
  font-size: 42px;
  margin-top: 0px;
  margin-left: 15px;
  font-weight: 600;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.time-sub-text {
  font-size: 15px;
  margin-left: 5px;
}

.day-text {
  font-size: 18px;
  margin-top: 0px;
  margin-left: 15px;
  font-weight: 500;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.moon {
  font-size: 20px;
  position: absolute;
  right: 15px;
  top: 15px;
  transition: all 0.3s ease-in-out;
}

.card:hover>.moon {
  font-size: 23px;
}

/* Estilo personalizado para la barra lateral */
.custom-sidebar {
  background-color: #111827;
  /* Cambiar color de fondo */
}

/* Estilo para los botones de las opciones del menú */
.btn-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  border-radius: 5px;
  background-color: #1F2937;
  /* Color de fondo del botón */
  margin: 5px 0;
  transition: background-color 0.3s;
  text-decoration: none;
  /* Quitar subrayado */
}

.btn-option:hover {
  background-color: #374151;
  /* Color de fondo al pasar el mouse */
}

/* Estilo para los íconos */
.icon-option {
  width: 24px;
  /* Ajustar el tamaño del ícono */
  height: 24px;
  /* Ajustar el tamaño del ícono */
  margin-right: 10px;
  /* Espaciado entre el ícono y el texto */
}
/* From Uiverse.io by mrhyddenn */ 
button {
  position: relative;
  margin: 0;
  padding: 0.8em 1em;
  outline: none;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  background-color: #1E293B;
  border-radius: 10px;
  color: #fff;
  font-weight: 300;
  font-size: 18px;
  font-family: inherit;
  z-index: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.02, 0.01, 0.47, 1);
}

button:hover {
  animation: sh0 0.5s ease-in-out both;
}

@keyframes sh0 {
  0% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }

  25% {
    transform: rotate(7deg) translate3d(0, 0, 0);
  }

  50% {
    transform: rotate(-7deg) translate3d(0, 0, 0);
  }

  75% {
    transform: rotate(1deg) translate3d(0, 0, 0);
  }

  100% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }
}

button:hover span {
  animation: storm 0.7s ease-in-out both;
  animation-delay: 0.06s;
}

button::before,
button::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  transition: transform 0.15s cubic-bezier(0.02, 0.01, 0.47, 1), opacity 0.15s cubic-bezier(0.02, 0.01, 0.47, 1);
  z-index: -1;
  transform: translate(100%, -25%) translate3d(0, 0, 0);
}

button:hover::before,
button:hover::after {
  opacity: 0.15;
  transition: transform 0.2s cubic-bezier(0.02, 0.01, 0.47, 1), opacity 0.2s cubic-bezier(0.02, 0.01, 0.47, 1);
}

button:hover::before {
  transform: translate3d(50%, 0, 0) scale(0.9);
}

button:hover::after {
  transform: translate(50%, 0) scale(1.1);
}


</style>
