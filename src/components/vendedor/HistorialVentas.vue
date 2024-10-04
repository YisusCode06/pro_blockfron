<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const userData = ref(null);
const propertyData = ref([]);
const filteredProperties = ref([]); // Propiedades filtradas

// Función para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Función para filtrar las propiedades por dueño y ya vendidas (no en venta)
const filterPropertiesByOwner = () => {
  if (userData.value && userData.value._id) {
    filteredProperties.value = propertyData.value.filter(
      (property) => property.owner === userData.value._id && property.isForSale === false
    );
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
</script>

<template>
  <div class="container">
    <h1 class="Titulo">Catálogo de Inmuebles</h1>

    <div class="row">
      <!-- Iteramos sobre los inmuebles filtrados para mostrarlos en tarjetas -->
      <div v-for="property in filteredProperties" :key="property._id" class="col-md-4 mb-4">
        <div class="card_box">
          <!-- Mostrar el estado "vendido" con un banner -->
          <span></span>

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

          </div>

          <!-- Mostrar la fecha de creación del inmueble -->
          <div class="card-footer text-muted">
            Publicado el: {{ new Date(property.createdAt).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilo de la tarjeta */
.card_box {
  width: 100%;
  height: auto;
  border-radius: 20px;
  background: linear-gradient(170deg, rgba(58, 56, 56, 0.623) 0%, rgb(31, 31, 31) 100%);
  position: relative;
  box-shadow: 0 25px 50px rgba(0,0,0,0.55);
  cursor: pointer;
  transition: all .3s;
}

.card_box:hover {
  transform: scale(0.95);
}

.card_box img {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card_box span {
  position: absolute;
  overflow: hidden;
  width: 150px;
  height: 150px;
  top: -10px;
  left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card_box span::before {
  content: 'Vendido';
  position: absolute;
  width: 150%;
  height: 40px;
  background-image: linear-gradient(45deg, #ff6547 0%, #ffb144 51%, #ff7053 100%);
  transform: rotate(-45deg) translateY(-20px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 5px 10px rgba(0,0,0,0.23);
}

.card_box span::after {
  content: '';
  position: absolute;
  width: 10px;
  bottom: 0;
  left: 0;
  height: 10px;
  z-index: -1;
  box-shadow: 140px -140px #cc3f47;
  background-image: linear-gradient(45deg, #FF512F 0%, #F09819 51%, #FF512F 100%);
}

.card-footer {
  text-align: center;
}
.Titulo {
    color: white;
    background-color: #27272A;
    text-align: center;
    /* Centra el texto */
    padding: 10px;
    /* Opcional: Espaciado interno para mejorar el aspecto */
    margin-bottom:40px ;
}
.container{
  color: white;
}
</style>
