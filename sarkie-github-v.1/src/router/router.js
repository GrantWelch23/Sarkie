import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/loginview.vue";
import RegisterView from "../views/registerview.vue";
import ChatView from "../views/chatview.vue";
import HealthPortal from "../views/healthportal.vue"; // ✅ Use relative path
import VerifyEmail from "../views/verifyemail.vue";


const routes = [
  { path: "/", component: ChatView }, 
  { path: "/login", component: LoginView, meta: { requiresGuest: true } }, 
  { path: "/register", component: RegisterView, meta: { requiresGuest: true } }, 
  { path: "/health-portal", component: HealthPortal }, // ✅ Corrected to match the import
  { path: "/verify-email", component: VerifyEmail }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.meta.requiresGuest && isAuthenticated) {
    next("/"); // Redirect logged-in users to home
  } else {
    next();
  }
});

export default router;
