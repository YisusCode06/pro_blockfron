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
.form-container {
  width: 100%;
  /* Cambiar a 100% para que ocupe todo el ancho */
  max-width: 800px;
  /* Puedes ajustar este valor según tus necesidades */
  margin: 0 auto;
  /* Centrar horizontalmente */
  border-radius: 0.75rem;
  background-color: rgba(17, 24, 39, 1);
  padding: 2rem;
  color: rgba(243, 244, 246, 1);
}

.title {
  text-align: center;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
}

.form {
  margin-top: 1.5rem;
}

.form-row {
  display: flex;
  /* Usar flexbox para alinear los subformularios horizontalmente */
  justify-content: space-between;
  /* Espacio entre los subformularios */
}

.sub-form {
  flex: 1;
  /* Cada subformulario ocupa el mismo ancho */
  padding: 1rem;
  border: 1px solid rgba(55, 65, 81, 1);
  border-radius: 0.375rem;
  background-color: rgba(30, 41, 59, 1);
  margin: 0 1rem;
  /* Espacio lateral entre subformularios */
}

.sub-form:first-of-type {
  margin-left: 0;
  /* Eliminar margen izquierdo del primer subformulario */
}

.sub-form:last-of-type {
  margin-right: 0;
  /* Eliminar margen derecho del último subformulario */
}

.input-group {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.input-group label {
  display: block;
  color: rgba(156, 163, 175, 1);
  margin-bottom: 4px;
}

.input-group input,
.input-group textarea,
.input-group select {
  width: 100%;
  /* Asegura que los campos de entrada ocupen todo el ancho */
  border-radius: 0.375rem;
  border: 1px solid rgba(55, 65, 81, 1);
  outline: 0;
  background-color: rgba(17, 24, 39, 1);
  padding: 0.75rem 1rem;
  color: rgba(243, 244, 246, 1);
}

.input-group input:focus,
.input-group textarea:focus,
.input-group select:focus {
  border-color: rgba(167, 139, 250);
}

.btn-primary {
  display: block;
  width: 100%;
  background-color: rgba(167, 139, 250, 1);
  padding: 0.75rem;
  text-align: center;
  color: rgba(17, 24, 39, 1);
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  margin-top: 1rem;
  /* Espacio superior para el botón */
}
.button-container {
  display: flex;               /* Usar flexbox para centrar el contenido */
  justify-content: center;     /* Centra horizontalmente */
  align-items: center;         /* Centra verticalmente (opcional) */
  height: 5vh;               /* Asegúrate de que el contenedor ocupe toda la altura de la ventana */
  margin-top: 20px;           /* Espacio adicional hacia abajo */
}
button {
 display: inline-block;
 width: 750px;
 height: 50px;
 border-radius: 10px;
 border: 1px solid #03045e;
 position: relative;
 overflow: hidden;
 transition: all 0.5s ease-in;
 z-index: 1;
}

button::before,
button::after {
 content: '';
 position: absolute;
 top: 0;
 width: 0;
 height: 100%;
 transform: skew(15deg);
 transition: all 0.5s;
 overflow: hidden;
 z-index: -1;
}

button::before {
 left: -40px;
 background: #111827;
}

button::after {
 right: -10px;
 background: #1E293B;
}

button:hover::before,
button:hover::after {
 width: 58%;
}

button:hover span {
 color: #e0aaff;
 transition: 0.3s;
}

button span {
 color: #03045e;
 font-size: 18px;
 transition: all 0.3s ease-in;
}

</style>
