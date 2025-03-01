<template>
  <div id="app" class="app-wrapper">
    <!-- Supplement Sidebar (always visible) -->
    <SupplementSidebar />

    <!-- Health Portal Button (disabled for logged-out users) -->
    <router-link
      :to="isInHealthPortal ? '/' : '/health-portal'"
      class="health-portal-btn"
      :class="{ 'disabled-link': !user }"
      :tabindex="user ? '0' : '-1'"
      @click.native="handlePortalClick"
    >
      {{ isInHealthPortal ? "Exit Health Portal" : "Visit Health Portal" }}
      <!-- Tooltip for logged-out users -->
      <span v-if="!user" class="tooltip">
        Login or register to visit the health portal!
      </span>
    </router-link>

    <!-- Always shifted right to accommodate sidebar -->
    <div class="main-content shift-right">
      <!-- Top Bar (User Info, Login/Logout) -->
      <div class="top-right">
        <div v-if="user" class="user-info">
          <span>{{ user.name }}</span>
        </div>
        <router-link v-if="!user" to="/login" class="login-button">Login</router-link>
        <button v-if="user" @click="logout" class="logout-button">Logout</button>
      </div>

      <!-- Loads current route (chat, login, register, etc.) -->
      <router-view @user-logged-in="updateUser"></router-view>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useRoute } from "vue-router";
import SupplementSidebar from "./components/supplement-sidebar.vue";
import router from "./router/router.js"; 

console.log("✅ Registered Routes:", router.getRoutes());

export default {
  name: "App",
  components: { SupplementSidebar },
  setup() {
    const route = useRoute();
    // Detect if user is on the health portal route
    const isInHealthPortal = computed(() => route.path === "/health-portal");
    return { isInHealthPortal };
  },
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
    };
  },
  methods: {
    // Block navigation if user is not logged in
    handlePortalClick(e) {
      if (!this.user) {
        e.preventDefault();
        console.log("Please log in to visit the health portal!");
      }
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = null;
      this.$router.push("/login");
    },
    updateUser(newUser) {
      this.user = newUser;
    },
  },
  mounted() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      this.user = JSON.parse(userData);
    }
  },
};
</script>



<style scoped>
/* 🔹 Layout Fix for Sidebar */
#app {
  display: flex;
}

/* Visit/Exit Health Portal Button (Beside Sidebar) */
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

.disabled-link {
  opacity: 0.5;  /* Makes it invisible */
  cursor: not-allowed;
  filter: grayscale(80%);
}

/* Tooltip (Initially Hidden) */
.tooltip {
  visibility: hidden;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9rem;
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
}

/* Show Tooltip on Hover */
.disabled-link:hover .tooltip {
  visibility: visible;
  opacity: 1;
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
