<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100 bg-light py-5">
    <div class="col-md-8 col-lg-6">
      <div class="card shadow-lg border-0 rounded-4">
        <div class="card-body p-5">
          <h3 class="card-title text-center mb-4 fw-bold">Registro de Usuario</h3>
          <form @submit.prevent="registerUser">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="username" class="form-label fw-semibold">Nombre de Usuario</label>
                <input type="text" class="form-control form-control-lg" v-model="user.username" placeholder="Nombre de usuario" required />
              </div>
              <div class="col-md-6 mb-3">
                <label for="email" class="form-label fw-semibold">Correo Electrónico</label>
                <input type="email" class="form-control form-control-lg" v-model="user.email" placeholder="Correo electrónico" required />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="password" class="form-label fw-semibold">Contraseña</label>
                <input type="password" class="form-control form-control-lg" v-model="user.password" placeholder="Contraseña" required />
              </div>
              <div class="col-md-6 mb-3">
                <label for="dni" class="form-label fw-semibold">DNI</label>
                <input type="text" class="form-control form-control-lg" v-model="user.dni" placeholder="DNI" required />
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="phone" class="form-label fw-semibold">Teléfono</label>
                <input type="text" class="form-control form-control-lg" v-model="user.phone" placeholder="Teléfono" required />
              </div>
              <div class="col-md-6 mb-3">
                <label for="walletAddress" class="form-label fw-semibold">Dirección de la Billetera</label>
                <input type="text" class="form-control form-control-lg" v-model="user.walletAddress" placeholder="Billetera" required />
              </div>
            </div>

            <div class="mb-3">
              <label for="role" class="form-label fw-semibold">Rol</label>
              <select class="form-select form-select-lg" v-model="user.role" required>
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
              </select>
            </div>

            <div class="mb-4">
              <h5 class="fw-bold">Dirección</h5>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="street" class="form-label">Calle</label>
                  <input type="text" class="form-control form-control-lg" v-model="user.address.street" placeholder="Calle" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="city" class="form-label">Ciudad</label>
                  <input type="text" class="form-control form-control-lg" v-model="user.address.city" placeholder="Ciudad" required />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="state" class="form-label">Provincia</label>
                  <input type="text" class="form-control form-control-lg" v-model="user.address.state" placeholder="Provincia" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="postalCode" class="form-label">Código Postal</label>
                  <input type="text" class="form-control form-control-lg" v-model="user.address.postalCode" placeholder="Código Postal" required />
                </div>
              </div>
              <div class="mb-3">
                <label for="country" class="form-label">País</label>
                <input type="text" class="form-control form-control-lg" v-model="user.address.country" placeholder="País" required />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100 fw-semibold">Registrar</button>
          </form>

          <div class="text-center mt-4">
            <RouterLink to="/">
              <a class="text-decoration-none text-primary">¿Ya tienes cuenta? Iniciar Sesión</a>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const user = ref({
      username: '',
      email: '',
      password: '',
      dni: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      role: 'buyer',
      walletAddress: ''
    });

    const registerUser = async () => {
      try {
        const response = await fetch('https://pro-block.vercel.app/api/v1/user/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user.value)
        });

        if (response.ok) {
          alert('Usuario registrado con éxito');
          window.location.href = '/';
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error al registrar el usuario:', error);
        alert('Error al registrar el usuario');
      }
    };

    return {
      user,
      registerUser
    };
  }
};
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
}
.card {
  border-radius: 20px;
}
.card-body {
  padding: 2rem;
}
.btn {
  border-radius: 10px;
}
a:hover {
  text-decoration: underline;
}
</style>