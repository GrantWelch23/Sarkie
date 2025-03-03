<template>
  <div class="login-wrapper">
    <div class="login-container">
      <h2>Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Email</label>
          <input v-model="email" type="email" id="email" required />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input v-model="password" type="password" id="password" required />
        </div>

        <button type="submit" class="login-btn">Login</button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>

      <p class="register-text">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { api } from "../Services/api";

export default {
  name: "LoginView",
  emits: ["user-logged-in"],
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleLogin() {
      try {
        console.log("🔹 Attempting login with:", this.email, this.password);

        const response = await api.post("/auth/login", {
          email: this.email,
          password: this.password,
        });

        console.log(" Login response:", response.data);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        this.$emit("user-logged-in", response.data.user);
        this.$router.push("/");
      } catch (error) {
        console.error(
          " Login error:",
          error.response?.data?.error || error.message
        );
        this.errorMessage = error.response?.data?.error || "Login failed";
      }
    },
  },
};
</script>


<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #343541;
}

.login-container {
  background: #444654;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 320px;
  text-align: center;
}

h2 {
  color: white;
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  color: white;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #565869;
  color: white;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  background: #6b6d75;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #c97b06;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  background: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 0.9rem;
}

/* Register */
.register-text {
  margin-top: 15px;
  color: white;
  font-size: 0.9rem;
}

.register-text a {
  color: #c97b06;
  text-decoration: none;
  font-weight: bold;
}

.register-text a:hover {
  text-decoration: underline;
}
</style>

  