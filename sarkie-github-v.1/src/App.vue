<template>
  <div id="app" class="app-wrapper">
    <!-- ✅ Supplement Sidebar (only for logged-in users) -->
    <SupplementSidebar />

    <!-- ✅ Dynamic Health Portal Button (Changes to "Exit Health Portal" if inside health portal) -->
    <router-link 
      v-if="user" 
      :to="isInHealthPortal ? '/' : '/health-portal'" 
      class="health-portal-btn">
      {{ isInHealthPortal ? "Exit Health Portal" : "Visit Health Portal" }}
    </router-link>

    <div class="main-content" :class="{ 'shift-right': user }">
      <!-- 🔹 Top Bar (User Info + Logout Button) -->
      <div class="top-right">
        <!-- 🔹 Show User Info if Logged In -->
        <div v-if="user" class="user-info">
          <span>{{ user.name }}</span>
        </div>

        <!-- 🔹 Login / Logout Button -->
        <router-link v-if="!user" to="/login" class="login-button">Login</router-link>
        <button v-if="user" @click="logout" class="logout-button">Logout</button>
      </div>

      <!-- 🔹 Loads the Correct Page -->
      <router-view @user-logged-in="updateUser"></router-view>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SupplementSidebar from "./components/supplement-sidebar.vue";
import router from "./router/router.js"; 

// ✅ Debugging: Log all registered routes
console.log("✅ Registered Routes:", router.getRoutes());

export default {
  name: "App",
  components: { SupplementSidebar },
  setup() {
    const route = useRoute();
    const isInHealthPortal = computed(() => route.path === "/health-portal"); // Detects if user is in health portal
    return { isInHealthPortal };
  },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null, // Stores logged-in user data
    };
  },
  computed: {
    isLoggedIn() {
      return !!this.user;
    }
  },
  mounted() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      this.user = JSON.parse(userData);
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = null;
      this.$router.push("/login");
    },
    updateUser(newUser) {
      this.user = newUser; // Dynamically updates user state on login
    },
  },
};
</script>


<style scoped>
/* 🔹 Layout Fix for Sidebar */
#app {
  display: flex;
}

/* ✅ Visit/Exit Health Portal Button (Beside Sidebar) */
.health-portal-btn {
  position: absolute;
  left: 310px; 
  top: 15px;
  padding: 8px 16px;
  background: #444654;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
}

.health-portal-btn:hover {
  background: #0056b3;
}

.main-content {
  flex-grow: 1;
  transition: padding-left 0.3s ease-in-out;
}
.main-content.shift-right {
  padding-left: 250px; 
}

.top-right {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  background: #444654;
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
}

.login-button,
.logout-button {
  padding: 8px 15px;
  background: #444654;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;
  transition: background 0.3s;
  border: none;
  cursor: pointer;
}

.login-button:hover,
.logout-button:hover {
  background: #565869;
}

.app-wrapper {
  background: #343541;
  color: white;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
