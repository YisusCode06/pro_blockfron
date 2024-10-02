<template>
    <div>
      <!-- Botón para abrir/cerrar el sidebar -->
      <button class="btn btn-primary m-3" @click="toggleSidebar">
        <i :class="sidebarCollapsed ? 'fas fa-arrow-right' : 'fas fa-bars'"></i>
      </button>
  
      <!-- Sidebar Lateral -->
      <div class="d-flex">
        <div :class="['bg-light border', { collapsed: sidebarCollapsed }]" id="sidebar">
          <ul class="list-group list-group-flush position-relative">
            <li class="list-group-item" data-tooltip="Gestiones Pendientes" @click="loadPending">
              <i class="fas fa-clock"></i> <span>Gestiones Pendientes</span>
            </li>
            <li class="list-group-item" data-tooltip="Gestiones Atendidas" @click="loadAttended">
              <i class="fas fa-check"></i> <span>Gestiones Atendidas</span>
            </li>
            <li class="list-group-item mt-auto" @click="logout">
              <i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>
            </li>
          </ul>
        </div>
  
        <!-- Contenido principal -->
        <div id="mainContent" class="p-4" :style="{ flexGrow: 1, marginLeft: sidebarCollapsed ? '80px' : '250px' }">
          <h1>Bienvenido a la Gestión Notarial</h1>
          <p>Aquí puede gestionar sus asuntos notariales.</p>
          <div id="contentArea" v-html="contentArea"></div> <!-- Área para cargar contenido dinámico -->
        </div>
      </div>
  
      <!-- Tooltip personalizado -->
      <div id="tooltip" class="tooltip-custom" v-if="tooltipVisible" :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }">
        {{ tooltipText }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        sidebarCollapsed: false,
        contentArea: '',
        tooltipText: '',
        tooltipVisible: false,
        tooltipPosition: { x: 0, y: 0 },
      };
    },
    methods: {
      toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
      },
      loadPending() {
        this.contentArea = `
          <h2>Gestiones Pendientes</h2>
          <p>Aquí se mostrarán las gestiones pendientes del notario.</p>
        `;
      },
      loadAttended() {
        this.contentArea = `
          <h2>Gestiones Atendidas</h2>
          <p>Aquí se mostrarán las gestiones atendidas del notario.</p>
        `;
      },
      logout() {
        // Lógica para cerrar sesión
        alert('Sesión cerrada');
      },
      showTooltip(event, text) {
        this.tooltipText = text;
        this.tooltipVisible = true;
        this.tooltipPosition = {
          x: event.clientX + 5,
          y: event.clientY + 5,
        };
      },
      hideTooltip() {
        this.tooltipVisible = false;
      },
    },
    mounted() {
      const items = document.querySelectorAll('#sidebar .list-group-item');
      items.forEach(item => {
        item.addEventListener('mouseover', (e) => {
          if (this.sidebarCollapsed) {
            this.showTooltip(e, item.getAttribute('data-tooltip'));
          }
        });
        item.addEventListener('mousemove', (e) => {
          if (this.sidebarCollapsed) {
            this.tooltipPosition = {
              x: e.clientX + 5,
              y: e.clientY + 5,
            };
          }
        });
        item.addEventListener('mouseout', () => {
          this.hideTooltip();
        });
      });
    },
  };
  </script>
  
  <style scoped>
  #sidebar {
    width: 250px;
    height: 100vh;
    transition: width 0.3s;
  }
  #sidebar.collapsed {
    width: 80px;
  }
  #sidebar .list-group-item {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.3s;
  }
  #sidebar.collapsed .list-group-item span {
    display: none;
  }
  #sidebar .list-group-item i {
    font-size: 20px;
  }
  #mainContent {
    height: 100vh; /* Altura total de la ventana */
    overflow-y: auto; /* Scroll solo en el contenido principal */
    transition: margin-left 0.3s;
  }
  .tooltip-custom {
    position: absolute;
    background-color: #333;
    color: #fff;
    padding: 5px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 1000;
  }
  </style>
  