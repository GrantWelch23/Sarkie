<template>
    <div class="login-wrapper">
      <div class="login-container">
        <h2>Register</h2>
  
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label for="name">Name</label>
            <input v-model="name" type="text" id="name" required />
          </div>
  
          <div class="input-group">
            <label for="email">Email</label>
            <input v-model="email" type="email" id="email" required />
          </div>
  
          <div class="input-group">
            <label for="password">Password</label>
            <input v-model="password" type="password" id="password" required />
          </div>
  
          <button type="submit" class="register-btn">Register</button>
        </form>
  
        <!-- 🔹 Login Option -->
        <p class="login-text">
          Already have an account? <router-link to="/login">Login</router-link>
        </p>
  
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
export default {
  name: "RegisterView",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleRegister() {
      try {
        console.log("🔹 Attempting registration...");

        const response = await fetch("http://localhost:5000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        console.log("✅ Registration successful:", data);

        // Send verification email
        await this.sendVerificationCode(this.email);

        // Redirect to email verification page
        this.$router.push(`/verify-email?email=${encodeURIComponent(this.email)}`);

      } catch (error) {
        console.error("❌ Error registering:", error);
        this.errorMessage = error.message;
      }
    },

    async sendVerificationCode(email) {
      try {
        console.log(`🟡 Sending verification code to ${email}...`);

        const response = await fetch("http://localhost:5000/auth/send-verification-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send verification code.");
        }

        console.log("✅ Verification email sent:", data);

      } catch (error) {
        console.error("❌ Error sending verification code:", error);
        this.errorMessage = "Error sending verification code. Please try again.";
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
  }
  
  input:focus {
    outline: none;
    background: #6b6d75;
  }
  
  .register-btn {
    width: 100%;
    padding: 10px;
    background: #c97b06;
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .register-btn:hover {
    background: #d88a08;
  }
  
  .login-text {
    margin-top: 15px;
    color: white;
    font-size: 0.9rem;
  }
  
  .login-text a {
    color: #c97b06;
    text-decoration: none;
    font-weight: bold;
  }
  
  .login-text a:hover {
    text-decoration: underline;
  }
  
  .error-message {
    color: red;
    margin-top: 10px;
  }
  </style>
  