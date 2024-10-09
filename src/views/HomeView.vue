<template>
  <div class="cont-gen">
    <div class="container">
      <div class="heading">Iniciar Sesión</div>
      <form @submit.prevent="login" class="form">
        <input required="" class="input" type="email" v-model="email" id="email" placeholder="Introduce tu correo" />
        <input required="" class="input" type="password" v-model="password" id="password" placeholder="Introduce tu contraseña" />
        
        
        
        <input class="login-button" type="submit" value="Iniciar Sesión" />
      </form>
      
      
  
      <span class="agreement"><a href="#"> <p> <a href="/register">¿No tienes una cuenta? Regístrate aquí</a></p></a></span>
  
      <!-- Nuevo enlace para registro -->
      <div class="register-link">
       
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
      const tokenExpiration = this.rememberMe ? 7 * 24 * 60 * 60 : 5 * 60 * 60; // 7 días o 5 horas en segundos

      try {
        const response = await fetch('https://pro-block.vercel.app/api/v1/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        const data = await response.json();

        if (response.ok) {
          // SweetAlert2 para mostrar un mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            showConfirmButton: false,
            timer: 1500
          });

          this.setCookie('token', data.token, tokenExpiration);
          this.setCookie('userId', data.user.id, tokenExpiration);

          const userResponse = await fetch(`https://pro-block.vercel.app/api/v1/user/${data.user.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json'
            }
          });

          const userData = await userResponse.json();

          if (userResponse.ok) {
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
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Rol de usuario no reconocido',
                });
                break;
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: userData.message || 'Error al obtener detalles del usuario',
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Error en el inicio de sesión',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema con el inicio de sesión',
        });
        console.error('Error:', error);
      }
    }
  }
};
</script>


<style scoped>
.cont-gen{
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.heading {
  text-align: center;
  font-weight: 900;
  font-size: 30px;
  color: rgb(5, 128, 204);
}

.form .input {
  width: 100%;
  background: white;
  border: none;
  padding: 15px 20px;
  border-radius: 20px;
  margin-top: 15px;
  box-shadow: #cff0ff 0px 10px 10px -5px;
  border-inline: 2px solid transparent;
}

.form .input::placeholder {
  color: rgb(170, 170, 170);
}

.form .input:focus {
  outline: none;
  border-inline: 2px solid #12B1D1;
}

.forgot-password a {
  font-size: 11px;
  color: #0099ff;
  text-decoration: none;
}

.login-button {
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

.login-button:hover {
  transform: scale(1.03);
  box-shadow: rgba(133, 189, 215, 0.878) 0px 23px 10px -20px;
}

.social-account-container {
  margin-top: 25px;
}

.social-accounts {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-button {
  background: linear-gradient(45deg, rgb(0, 0, 0) 0%, rgb(112, 112, 112) 100%);
  border: none;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
}

.agreement a {
  font-size: 12px;
  text-decoration: none;
  color: #0099ff;
}
html, body {
  height: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00000044; /* Fondo negro */
}

.container {
  max-width: 350px;
  background: rgb(248, 249, 253); /* Fondo más oscuro o transparente */
  background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
  border-radius: 40px;
  padding: 25px 35px;
  border: 5px solid rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.878) 0px 30px 30px -20px;
  margin: 20px;
  
}

</style>