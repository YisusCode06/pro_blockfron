<template>
  <div id="app">
    <button class="btn btn-primary m-3" @click="toggleSidebar">
      <i :class="sidebarCollapsed ? 'fas fa-arrow-right' : 'fas fa-bars'"></i>
    </button>

    <div class="d-flex" style="height: 100vh;">
      <div id="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <ul class="list-group list-group-flush position-relative">
          <li class="list-group-item" @click="showRegisterForm" data-tooltip="Registro de inmuebles">
            <i class="fas fa-edit"></i> <span>Registro de inmuebles</span>
          </li>
          <li class="list-group-item" @click="showPropertyList" data-tooltip="Lista de inmuebles">
            <i class="fas fa-list"></i> <span>Lista de inmuebles</span>
          </li>
          <li class="list-group-item" data-tooltip="Inmuebles vendidos">
            <i class="fas fa-check"></i> <span>Inmuebles vendidos</span>
          </li>
          <li class="list-group-item mt-auto" @click="logout" data-tooltip="Cerrar Sesión">
            <i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>
          </li>
        </ul>
      </div>

      <div id="mainContent" class="flex-grow-1" :style="{ marginLeft: sidebarCollapsed ? '80px' : '250px' }">
        <h1>Bienvenido a la gestión de Vendedores</h1>
        <p>Aquí puede registrar, listar y gestionar inmuebles.</p>
        <div id="contentArea" v-html="contentArea"></div> <!-- Área para cargar contenido dinámico -->
      </div>
    </div>

    <!-- Tooltip personalizado -->
    <div id="tooltip" class="tooltip-custom"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarCollapsed: false,
      contentArea: '',
    };
  },
  mounted() {
    const token = this.getCookie('token');
    if (!token) {
      window.location.href = '/'; // Cambia '/login' por la URL de tu página de login
    }
  },
  methods: {
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    async logout() {
      // Eliminar las cookies
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; // Cambia 'authToken' si es necesario
      document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; // Cambia 'userId' si es necesario

      // Redirigir al usuario a la página de login
      window.location.href = '/'; // Cambia '/login' por la URL de tu página de login
    },
    showRegisterForm() {
      this.contentArea = `
        <h2>Registro de Inmuebles</h2>
        <form id="propertyForm" @submit.prevent="registerProperty">
          <div class="mb-3">
            <label for="propertyTitle" class="form-label">Título del Inmueble</label>
            <input type="text" class="form-control" id="propertyTitle" placeholder="Ej. Casa en Lima" required>
          </div>
          <div class="mb-3">
            <label for="propertyDescription" class="form-label">Descripción</label>
            <textarea class="form-control" id="propertyDescription" rows="3" placeholder="Describe el inmueble" required></textarea>
          </div>
          <div class="mb-3">
            <label for="propertyPrice" class="form-label">Precio</label>
            <input type="number" class="form-control" id="propertyPrice" placeholder="Precio en dólares" required>
          </div>
          <div class="mb-3">
            <label for="propertySize" class="form-label">Tamaño (m²)</label>
            <input type="number" class="form-control" id="propertySize" placeholder="Tamaño en metros cuadrados" required>
          </div>
          <div class="mb-3">
            <label for="propertyImages" class="form-label">Imágenes del Inmueble</label>
            <input type="text" class="form-control" id="propertyImages" placeholder="URL de las imágenes, separadas por comas">
          </div>
          <h4>Dirección</h4>
          <div class="mb-3">
            <label for="propertyStreet" class="form-label">Calle</label>
            <input type="text" class="form-control" id="propertyStreet" placeholder="Calle" required>
          </div>
          <div class="mb-3">
            <label for="propertyCity" class="form-label">Ciudad</label>
            <input type="text" class="form-control" id="propertyCity" placeholder="Ciudad" required>
          </div>
          <div class="mb-3">
            <label for="propertyState" class="form-label">Estado/Provincia</label>
            <input type="text" class="form-control" id="propertyState" placeholder="Estado/Provincia" required>
          </div>
          <div class="mb-3">
            <label for="propertyPostalCode" class="form-label">Código Postal</label>
            <input type="text" class="form-control" id="propertyPostalCode" placeholder="Código Postal" required>
          </div>
          <div class="mb-3">
            <label for="propertyCountry" class="form-label">País</label>
            <input type="text" class="form-control" id="propertyCountry" placeholder="País" required>
          </div>
          <div class="mb-3">
            <label for="isForSale" class="form-label">¿Está en venta?</label>
            <select class="form-select" id="isForSale" required>
              <option value="true" selected>En venta</option>
              <option value="false">No en venta</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Registrar Inmueble</button>
        </form>
      `;
    },
    async registerProperty() {
      const ownerId = this.getCookie('userId'); // Asumimos que la cookie se llama 'userId'

      if (!ownerId) {
        alert('No se encontró el ID del usuario en las cookies');
        return;
      }

      const propertyData = {
        title: document.getElementById('propertyTitle').value,
        description: document.getElementById('propertyDescription').value,
        price: parseFloat(document.getElementById('propertyPrice').value),
        size: parseFloat(document.getElementById('propertySize').value),
        images: document.getElementById('propertyImages').value.split(',').map(img => img.trim()),
        address: {
          street: document.getElementById('propertyStreet').value,
          city: document.getElementById('propertyCity').value,
          state: document.getElementById('propertyState').value,
          postalCode: document.getElementById('propertyPostalCode').value,
          country: document.getElementById('propertyCountry').value,
        },
        isForSale: document.getElementById('isForSale').value === 'true',
        owner: ownerId,
      };

      try {
        const response = await fetch('https://pro-block.vercel.app/api/v1/property', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(propertyData),
        });

        const result = await response.json();
        if (response.ok) {
          alert('Inmueble registrado con éxito');
          this.contentArea = ''; // Limpia el área de contenido
        } else {
          alert('Error al registrar el inmueble: ' + result.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al registrar el inmueble');
      }
    },
    async showPropertyList() {
      this.contentArea = `
        <h2>Lista de Inmuebles</h2>
        <p>Aquí se mostrarán todos los inmuebles registrados.</p>
        <div class="row" id="propertyList"></div>
      `;

      const userId = this.getCookie('userId');
      if (!userId) {
        alert('Usuario no autenticado');
        return;
      }

      // Obtener la lista de inmuebles desde la API
      try {
        const response = await fetch(`https://pro-block.vercel.app/api/v1/property?ownerId=${userId}`);
        const properties = await response.json();

        const propertyList = document.getElementById('propertyList');
        properties.forEach(property => {
          const col = document.createElement('div');
          col.className = 'col-md-4 mb-3';
          col.innerHTML = `
            <div class="card">
              <img src="${property.images[0]}" class="card-img-top" alt="${property.title}">
              <div class="card-body">
                <h5 class="card-title">${property.title}</h5>
                <p class="card-text">${property.description}</p>
                <p class="card-text"><strong>Precio:</strong> Tez${property.price}</p>
                <p class="card-text"><strong>Tamaño:</strong> ${property.size} m²</p>
                <p class="card-text"><strong>Dirección:</strong> ${property.address.street}, ${property.address.city}, ${property.address.state}, ${property.address.postalCode}, ${property.address.country}</p>
                <p class="card-text"><strong>Estado:</strong> ${property.isForSale ? 'En venta' : 'No en venta'}</p>
              </div>
            </div>
          `;
          propertyList.appendChild(col);
        });
      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al obtener la lista de inmuebles');
      }
    }
  }
}
</script>

<style>
#sidebar {
  width: 250px;
  transition: width 0.3s;
}
#sidebar.collapsed {
  width: 80px;
}
#mainContent {
  transition: margin-left 0.3s;
}
.list-group-item {
  cursor: pointer;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
.tooltip-custom {
  position: absolute;
  background-color: #333;
  color: white;
  padding: 5px;
  border-radius: 5px;
  display: none;
}
</style>
