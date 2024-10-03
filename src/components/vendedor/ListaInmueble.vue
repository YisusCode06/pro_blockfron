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

// Función para filtrar las propiedades por dueño y en venta
const filterPropertiesByOwner = () => {
  if (userData.value && userData.value._id) {
    filteredProperties.value = propertyData.value.filter(
      (property) => property.owner === userData.value._id && property.isForSale === true
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
    <h1>Mis Inmuebles en Venta</h1>
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
.card-img-top {
  object-fit: cover;
  height: 200px;
}
</style>
