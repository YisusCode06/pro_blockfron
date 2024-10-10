<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Definimos los datos del inmueble
const property = ref({
  title: '',
  description: '',
  price: '',
  size: '',
  images: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  isForSale: 'true', // Por defecto, se establece como en venta
});

// Obtener datos del usuario
const userData = ref(null);

// Función para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
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
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
  }
});

// Función para registrar el inmueble
const registerProperty = async () => {
  const propertyData = {
    title: property.value.title,
    description: property.value.description,
    price: parseFloat(property.value.price),
    size: parseFloat(property.value.size),
    images: property.value.images.split(',').map(img => img.trim()),
    address: {
      street: property.value.address.street,
      city: property.value.address.city,
      state: property.value.address.state,
      postalCode: property.value.address.postalCode,
      country: property.value.address.country,
    },
    isForSale: property.value.isForSale === 'true',
    owner: userData.value._id,
  };

  try {
    const response = await axios.post('https://pro-block.vercel.app/api/v1/property', propertyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    alert('Inmueble registrado exitosamente');
    window.location.reload();
    console.log(response.data);
  } catch (error) {
    console.error('Error al registrar el inmueble:', error);
    alert('Hubo un error al registrar el inmueble');
  }
};
</script>

<template>
  <div class="form-container">
    <p class="title">Registro de Inmuebles</p>
    <form class="form" @submit.prevent="registerProperty">
      <div class="form-row">
        <!-- Información del Inmueble -->
        <fieldset class="sub-form">
          <legend>Información del Inmueble</legend>
          <div class="input-group">
            <label for="propertyTitle">Título del Inmueble</label>
            <input type="text" class="form-control" v-model="property.title" placeholder="Ej. Casa en Lima" required />
          </div>

          <div class="input-group">
            <label for="propertyDescription">Descripción</label>
            <textarea class="form-control" v-model="property.description" rows="3" placeholder="Describe el inmueble"
              required></textarea>
          </div>

          <div class="input-group">
            <label for="propertyPrice">Precio</label>
            <input type="number" class="form-control" v-model="property.price" placeholder="Precio en dólares"
              required />
          </div>

          <div class="input-group">
            <label for="propertySize">Tamaño (m²)</label>
            <input type="number" class="form-control" v-model="property.size" placeholder="Tamaño en metros cuadrados"
              required />
          </div>

          <div class="input-group">
            <label for="propertyImages">Imágenes del Inmueble</label>
            <input type="text" class="form-control" v-model="property.images"
              placeholder="URL de las imágenes, separadas por comas" />
          </div>
        </fieldset>

        <!-- Dirección -->
        <fieldset class="sub-form">
          <legend>Dirección</legend>
          <div class="input-group">
            <label for="propertyStreet">Calle</label>
            <input type="text" class="form-control" v-model="property.address.street" placeholder="Calle" required />
          </div>

          <div class="input-group">
            <label for="propertyCity">Ciudad</label>
            <input type="text" class="form-control" v-model="property.address.city" placeholder="Ciudad" required />
          </div>

          <div class="input-group">
            <label for="propertyState">Estado/Provincia</label>
            <input type="text" class="form-control" v-model="property.address.state" placeholder="Estado/Provincia"
              required />
          </div>

          <div class="input-group">
            <label for="propertyPostalCode">Código Postal</label>
            <input type="text" class="form-control" v-model="property.address.postalCode" placeholder="Código Postal"
              required />
          </div>

          <div class="input-group">
            <label for="propertyCountry">País</label>
            <input type="text" class="form-control" v-model="property.address.country" placeholder="País" required />
          </div>
        </fieldset>
      </div>
      <div class="button-container">

        <button type="submit">
          <span> Registrar Inmueble
          </span>
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
@import url(./RegistroInmueble.css);
</style>
