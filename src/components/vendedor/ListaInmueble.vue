<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import { getCookie } from '../Sidebar';


const userData = ref(null);
const propertyData = ref([]);
const filteredProperties = ref([]); // Propiedades filtradas
const documents = ref([{ file: null, fileType: null }]); // Inicializa con una fila para subir un documento
const selectedPropertyId = ref(null); // Almacena el ID de la propiedad seleccionada
const documentData = ref(null);
const filteredDocuments = ref(null);

// Función para asignar el ID de la propiedad seleccionada
const selectProperty = (propertyId) => {
  selectedPropertyId.value = propertyId;
  console.log('Propiedad seleccionada con ID:', propertyId);
  filterDocumentsByProperty(propertyId);
};

// Función para filtrar las propiedades por dueño y en venta
const filterPropertiesByOwner = () => {
  if (userData.value && userData.value._id) {
    filteredProperties.value = propertyData.value.filter(
      (property) => property.owner === userData.value._id && property.isForSale === true
    );
  }
};

const filterDocumentsByProperty = (idproperty) => {
  if (idproperty && documentData.value) {
    filteredDocuments.value = documentData.value.filter(doc => doc.idproperty === idproperty);
  }
};

// Función para eliminar documentos con confirmación
const deleteDocument = async (docId, index) => {
  console.log('Eliminando documento con ID:', docId);  // Asegúrate de que el ID se imprime correctamente

  const confirmResult = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esto eliminará el documento permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo',
  });

  if (confirmResult.isConfirmed) {
    try {
      await axios.delete(`https://pro-block.vercel.app/api/v1/document/${docId}`);
      filteredDocuments.value.splice(index, 1); // Eliminar el documento de la lista localmente
      Swal.fire('Eliminado', 'El documento ha sido eliminado con éxito.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el documento.', 'error');
      console.error('Error al eliminar el documento:', error);
    }
  }
};

// Función para mostrar SweetAlert y recargar las propiedades
const reloadProperties = async () => {
  try {
    const response = await axios.get('https://pro-block.vercel.app/api/v1/property');
    propertyData.value = response.data;
    filterPropertiesByOwner();
  } catch (error) {
    console.error('Error al recargar los datos de los inmuebles:', error);
  }
};

const uploadDocuments = async () => {
  if (!selectedPropertyId.value) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor selecciona una propiedad antes de subir los documentos.',
    });
    return;
  }

  if (documents.value.every(doc => !doc.file)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor selecciona al menos un documento para subir.',
    });
    return;
  }

  Swal.fire({
    title: 'Subiendo documentos...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  for (const document of documents.value) {
    if (document.file) {
      const formData = new FormData();
      formData.append('idproperty', selectedPropertyId.value);
      formData.append('iduser', userData.value._id);
      formData.append('file', document.file);

      try {
        const response = await axios.post('https://pro-block.vercel.app/api/v1/document', formData);
        console.log('Documento subido:', response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al subir los documentos.',
        });
        console.error('Error al subir el documento:', error.response?.data || error);
        return;
      }
    }
  }

  // Mostrar SweetAlert de éxito
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: 'Todos los documentos se subieron correctamente.',
  }).then(() => {
    // Recargar la página después de que el usuario cierre el SweetAlert
    location.reload();
  });

  // Recargar los datos de las propiedades
  await reloadProperties();
  documents.value = [{ file: null, fileType: null }];
};


// Función para agregar otra fila para subir un documento
const addDocumentRow = () => {
  documents.value.push({ file: null });
};

// Función para manejar el archivo seleccionado
const handleFileChange = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    documents.value[index].file = file;
    const fileType = file.name.split('.').pop(); // Obtener la extensión del archivo
    documents.value[index].fileType = fileType; // Guardar el tipo de archivo
  }
};

// Observador para actualizar el contenido de `documents`
watch(documents, (newDocs) => {
  console.log('Documentos actualizados:', newDocs);
});

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


onMounted(async () => {
  try {
    const response = await axios.get('https://pro-block.vercel.app/api/v1/document');
    documentData.value = response.data;
  } catch (error) {
    console.error('Error al obtener los datos de los inmuebles:', error);
  }
});

const getFullUrl = (fileUrl) => {
  const baseUrl = ''; // Cambia esto si tienes una URL diferente en producción
  return baseUrl + fileUrl;
};

</script>


<template>
  <div class="container">
    <h1 class="Titulo">Mis Inmuebles en Venta</h1>
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
            <p class="card-text border p-2 border-info rounded">
              <strong>Verificacion:</strong> {{ property.isVerify ? 'Verificado' : 'Pendiente' }}
            </p>
          </div>

          <!-- Mostrar la fecha de creación del inmueble -->
          <div class="card-footer text-muted">
            Publicado el: {{ new Date(property.createdAt).toLocaleDateString() }}
          </div>
          <div v-if="property.isVerify == false" class="card-footer">
            <p>Para verificar su propiedad debe subir:</p>
            <ul>
              <li>Título de propiedad.</li>
              <li>Recibo de Agua.</li>
              <li>Recibo de luz.</li>
              <li>Copia de DNI.</li>
              <li>Copia de partida registral.</li>
              <li>Boleta de pago de arbitrios.</li>
            </ul>
            <!-- Botón que llama a la función y selecciona el id de la propiedad -->
            <button v-if="property.isVerify == false" type="button" class="custom-button" data-bs-toggle="modal"
              data-bs-target="#uploadModal" @click="selectProperty(property._id)">
              <div class="svg-wrapper-1">
                <div class="svg-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path fill="currentColor"
                      d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z">
                    </path>
                  </svg>
                </div>
              </div>
              <span>Subir Documentos</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para subir documentos -->
  <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="uploadModalLabel">Subir Documentos</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h5>Documentos Subidos</h5>
          <table class="table table-bordered" v-if="filteredDocuments && filteredDocuments.length > 0">
            <thead>
              <tr>
                <th>Nombre del Documento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(document, index) in filteredDocuments" :key="document._id">
                <td>{{ document.fileUrl }}</td>
                <td>
                  <a :href="getFullUrl(document.fileUrl)" target="_blank" class="btn btn-success me-2">Ver</a>
                  <button type="button" class="btn btn-danger" @click="deleteDocument(document._id, index)">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>No hay documentos subidos para esta propiedad.</p>

          <h5>Subir Nuevos Documentos (SOLO PDF)</h5>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(document, index) in documents" :key="index">
                <td>
                  <input type="file" class="form-control" @change="(e) => handleFileChange(e, index)" />
                </td>
                <td>
                  <button type="button" class="btn btn-danger" @click="documents.splice(index, 1)"
                    v-if="documents.length > 1">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="btn btn-primary" @click="addDocumentRow">Agregar otro documento</button>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-info" @click="uploadDocuments">Subir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url(./ListaInmueble.css);
</style>
