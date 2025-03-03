<template>
  <div class="verify-wrapper">
    <div class="verify-container">
      <h2>Verify Your Email</h2>
      
      <p>We've sent a verification code to <strong>{{ email }}</strong>.</p>
      <p>Please enter the code below to verify your account.</p>

      <form @submit.prevent="handleVerify">
        <div class="input-group">
          <label for="code">Verification Code</label>
          <input v-model="code" type="text" id="code" required />
        </div>

        <button type="submit" class="verify-btn">Verify</button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { api } from "../Services/api";

export default {
  name: "VerifyEmail",
  data() {
    return {
      email: this.$route.query.email || "",
      code: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleVerify() {
      try {
        console.log("Verifying code...");
        const response = await api.post("/auth/verify-code", {
          email: this.email,
          code: this.code,
        });
        const data = response.data;
        if (data.error) {
          throw new Error(data.error || "Verification failed.");
        }
        console.log("Email verified:", data);
        this.$router.push("/login");
      } catch (error) {
        console.error("Error verifying code:", error);
        this.errorMessage = error.message;
      }
    },
  },
};
</script>
  
  <style scoped>
.verify-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #343541;
}

.verify-container {
  background: #444654;
  padding: 2rem;
  border-radius: 10px;
  width: 350px;
  text-align: center;
}

h2 {
  color: white;
  margin-bottom: 1rem;
}

p {
  color: white;
  font-size: 0.9rem;
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

.input-group input {
  width: 100%; 
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #565869;
  color: white;
  font-size: 1rem;
  box-sizing: border-box; 
}

.input-group input:focus {
  outline: none;
  background: #6b6d75;
}

.verify-btn {
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

.verify-btn:hover {
  background: #d88a08;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>