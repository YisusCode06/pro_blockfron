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
  // Creamos el objeto de datos del inmueble basándonos en el formulario
  const propertyData = {
    title: property.value.title,
    description: property.value.description,
    price: parseFloat(property.value.price),
    size: parseFloat(property.value.size),
    images: property.value.images.split(',').map(img => img.trim()), // Las imágenes deben estar separadas por comas
    address: {
      street: property.value.address.street,
      city: property.value.address.city,
      state: property.value.address.state,
      postalCode: property.value.address.postalCode,
      country: property.value.address.country,
    },
    isForSale: property.value.isForSale === 'true', // Convertir la opción a booleano
    owner: userData.value._id, // Asignamos el id del usuario como dueño del inmueble
  };

  // Hacemos la solicitud POST para registrar el inmueble
  try {
    const response = await axios.post('https://pro-block.vercel.app/api/v1/property', propertyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    alert('Inmueble registrado exitosamente');
    window.location.reload();
    console.log(response.data); // Podemos manejar la respuesta aquí
  } catch (error) {
    console.error('Error al registrar el inmueble:', error);
    alert('Hubo un error al registrar el inmueble');
  }
};
</script>

<template>
  <h2>Registro de Inmuebles</h2>
  <form @submit.prevent="registerProperty">
    <div class="mb-3">
      <label for="propertyTitle" class="form-label">Título del Inmueble</label>
      <input type="text" class="form-control" v-model="property.title" placeholder="Ej. Casa en Lima" required />
    </div>

    <div class="mb-3">
      <label for="propertyDescription" class="form-label">Descripción</label>
      <textarea
        class="form-control"
        v-model="property.description"
        rows="3"
        placeholder="Describe el inmueble"
        required
      ></textarea>
    </div>

    <div class="mb-3">
      <label for="propertyPrice" class="form-label">Precio</label>
      <input type="number" class="form-control" v-model="property.price" placeholder="Precio en dólares" required />
    </div>

    <div class="mb-3">
      <label for="propertySize" class="form-label">Tamaño (m²)</label>
      <input type="number" class="form-control" v-model="property.size" placeholder="Tamaño en metros cuadrados" required />
    </div>

    <div class="mb-3">
      <label for="propertyImages" class="form-label">Imágenes del Inmueble</label>
      <input
        type="text"
        class="form-control"
        v-model="property.images"
        placeholder="URL de las imágenes, separadas por comas"
      />
    </div>

    <h4>Dirección</h4>
    <div class="mb-3">
      <label for="propertyStreet" class="form-label">Calle</label>
      <input type="text" class="form-control" v-model="property.address.street" placeholder="Calle" required />
    </div>

    <div class="mb-3">
      <label for="propertyCity" class="form-label">Ciudad</label>
      <input type="text" class="form-control" v-model="property.address.city" placeholder="Ciudad" required />
    </div>

    <div class="mb-3">
      <label for="propertyState" class="form-label">Estado/Provincia</label>
      <input type="text" class="form-control" v-model="property.address.state" placeholder="Estado/Provincia" required />
    </div>

    <div class="mb-3">
      <label for="propertyPostalCode" class="form-label">Código Postal</label>
      <input type="text" class="form-control" v-model="property.address.postalCode" placeholder="Código Postal" required />
    </div>

    <div class="mb-3">
      <label for="propertyCountry" class="form-label">País</label>
      <input type="text" class="form-control" v-model="property.address.country" placeholder="País" required />
    </div>

    <div class="mb-3">
      <label for="isForSale" class="form-label">¿Está en venta?</label>
      <select class="form-select" v-model="property.isForSale" required>
        <option value="true" selected>En venta</option>
        <option value="false">No en venta</option>
      </select>
    </div>

    <button type="submit" class="btn btn-primary">Registrar Inmueble</button>
  </form>
</template>

<style scoped></style>
