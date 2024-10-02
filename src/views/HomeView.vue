<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="col-md-5">
      <div class="card shadow-lg border-0 rounded-4">
        <div class="card-body p-5">
          <h3 class="card-title text-center mb-4 fw-bold">Iniciar Sesión</h3>
          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="email" class="form-label fw-semibold">Correo Electrónico</label>
              <input type="email" class="form-control form-control-lg" id="email" v-model="email"
                placeholder="Introduce tu correo" required />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label fw-semibold">Contraseña</label>
              <input type="password" class="form-control form-control-lg" id="password" v-model="password"
                placeholder="Introduce tu contraseña" required />
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe" />
              <label class="form-check-label" for="rememberMe">Recordarme</label>
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-100 mt-3 fw-semibold">Iniciar Sesión</button>
          </form>
          <div class="text-center mt-4">
            <RouterLink to="/register">
              <a class="text-decoration-none text-primary">¿No tienes cuenta? Regístrate</a>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false
    };
  },
  methods: {
    // Función para establecer una cookie
    setCookie(name, value, maxAge) {
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge};`;
    },
    async login() {
      // Calculamos el tiempo de expiración de la cookie (1 hora o 7 días si se selecciona "Recordarme")
      const tokenExpiration = this.rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 días o 1 hora en segundos

      try {
        // Hacemos la petición POST a la API
        const response = await fetch('https://pro-block.vercel.app/api/v1/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        // Parseamos la respuesta de la API
        const data = await response.json();

        if (response.ok) {
          // Si la respuesta es exitosa (status 200), muestra un mensaje
          alert('Inicio de sesión exitoso');

          // Almacena el token y el ID del usuario en cookies
          this.setCookie('token', data.token, tokenExpiration);
          this.setCookie('userId', data.user.id, tokenExpiration);

          // Hacer una segunda petición para obtener los detalles del usuario
          const userResponse = await fetch(`https://pro-block.vercel.app/api/v1/user/${data.user.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`, // Suponiendo que el token se necesita para autenticar la petición
              'Content-Type': 'application/json'
            }
          });

          const userData = await userResponse.json();

          if (userResponse.ok) {
            // Redirigir según el rol del usuario
            switch (userData.role) {
              case 'buyer':
                this.$router.push('/buyer');
                break;
              case 'seller':
                this.$router.push('/seller');
                break;
              case 'admin':
                this.$router.push('/admin');
                break;
              default:
                alert('Rol de usuario no reconocido');
                break;
            }
          } else {
            alert(userData.message || 'Error al obtener detalles del usuario');
          }
        } else {
          // Si hay un error en el inicio de sesión, muestra el mensaje
          alert(data.message || 'Error en el inicio de sesión');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema con el inicio de sesión');
      }
    }

  }
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales si lo deseas */
</style>