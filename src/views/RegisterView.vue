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
          // SweetAlert2 para éxito
          Swal.fire({
            icon: 'success',
            title: 'Usuario registrado con éxito',
            showConfirmButton: false,
            timer: 1500
          });
          setTimeout(() => window.location.href = '/', 1500); // Redirige después de 1.5 segundos
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: errorData.message || 'Ocurrió un error'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al registrar el usuario'
        });
        console.error('Error al registrar el usuario:', error);
      }
    };

    return {
      user,
      registerUser
    };
  }
};
const registerUser = async () => {
  // Validar campos antes de enviar
  if (!user.value.username || !user.value.email || !user.value.password) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor completa todos los campos obligatorios.'
    });
    return;
  }

  // Validar el formato del correo electrónico
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(user.value.email)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor ingresa un correo electrónico válido.'
    });
    return;
  }

  // Continuar con el registro si las validaciones pasan
  try {
    const response = await fetch('https://pro-block.vercel.app/api/v1/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user.value)
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado con éxito',
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => window.location.href = '/', 1500);
    } else {
      const errorData = await response.json();
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: errorData.message || 'Ocurrió un error'
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al registrar el usuario'
    });
    console.error('Error al registrar el usuario:', error);
  }
};

</script>

<style scoped>
/* Estilo general para ambos formularios */
html, body {
  height: 100%;
  font-family: 'Roboto', sans-serif;
}

.cont-gen {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f4f8;
}



.heading {
  text-align: center;
  font-weight: bold;
  font-size: 30px;
  color: rgb(5, 128, 204);
  margin-bottom: 20px;
}

input.input, .form-control {
  width: 100%;
  background: white;
  border: none;
  padding: 15px 20px;
  border-radius: 20px;
  margin-top: 15px;
  box-shadow: #cff0ff 0px 10px 10px -5px;
  border-inline: 2px solid transparent;
}

input.input::placeholder, .form-control::placeholder {
  color: rgb(170, 170, 170);
}

input.input:focus, .form-control:focus {
  outline: none;
  border-inline: 2px solid #12B1D1;
}

button.btn, input.login-button {
  width: 100%;
  font-weight: bold;
  background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
  color: white;
  padding-block: 15px;
  margin: 20px auto;
  border-radius: 20px;
  border: none;
  box-shadow: rgba(133, 189, 215, 0.878) 0px 20px 10px -15px;
  transition: all 0.2s ease-in-out;
}

button.btn:hover, input.login-button:hover {
  transform: scale(1.03);
  box-shadow: rgba(133, 189, 215, 0.878) 0px 23px 10px -20px;
}

.agreement, .forgot-password a {
  font-size: 12px;
  text-decoration: none;
  color: #0099ff;
  text-align: center;
  display: block;
}

a:hover {
  text-decoration: underline;
}

/* Estilo específico para el formulario de Registro */
.form-label {
  font-weight: 600;
  color: #333;
}

.card {
  border-radius: 20px;
}

.card-body {
  padding: 2rem;
  background-color: #fff;
}

.row {
  margin-bottom: 15px;
}

select.form-select {
  padding: 15px;
  border-radius: 20px;
  box-shadow: #cff0ff 0px 10px 10px -5px;
  border-inline: 2px solid transparent;
}

select.form-select:focus {
  outline: none;
  border-inline: 2px solid #12B1D1;
}

/* Estilo específico para el formulario de Iniciar Sesión */
.form {
  text-align: center;
}

input[type="submit"], .login-button {
  background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
  color: #fff;
  padding-block: 15px;
  border-radius: 20px;
  border: none;
  box-shadow: rgba(133, 189, 215, 0.878) 0px 20px 10px -15px;
  transition: all 0.2s ease-in-out;
}

input[type="submit"]:hover, .login-button:hover {
  transform: scale(1.03);
  box-shadow: rgba(133, 189, 215, 0.878) 0px 23px 10px -20px;
}

</style>
