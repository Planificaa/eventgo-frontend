// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import pinia from "@/shared/stores/pinia.js";
import { useAuthStore } from "@/auth-management/application/services/auth.store.js";

// IMPORTS DE PÁGINAS
import EventPage from "@/social-event-management/doman/presentation/pages/event-page.component.vue";
import CreateAndEditEvent from "@/social-event-management/doman/presentation/components/create-and-edit-event.component.vue";
import TaskPage from "@/task-management/presentation/pages/TaskPage.vue";
import TaskCreatePage from "@/task-management/presentation/pages/TaskCreatePage.vue";
import TaskEditPage from "@/task-management/presentation/pages/TaskEditPage.vue";
import TaskDetailPage from "@/task-management/presentation/pages/TaskDetailPage.vue";
import QuotePage from "@/quote-management/presentation/pages/QuotePage.vue";

const routes = [
  // ========================================
  // LOGIN / REGISTRO
  // ========================================
  {
    path: "/login",
    name: "Login",
    component: () =>
      import("@/auth-management/presentation/pages/LoginPage.vue"),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () =>
      import("@/auth-management/presentation/pages/RegisterPage.vue"),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },

  // ========================================
  // REDIRECCIÓN RAÍZ
  // ========================================
  {
    path: "/",
    redirect: () => {
      const auth = useAuthStore(pinia);
      if (auth.user?.role === "host") return "/host/dashboard";
      if (auth.user?.role === "organizer") return "/organizer/dashboard";
      return "/login";
    },
  },

  // ========================================
  // DASHBOARDS POR ROL
  // ========================================
  {
    path: "/host/dashboard",
    name: "host-dashboard",
    component: () =>
      import("@/dashboard/infrastructure/components/host/HostDashboard.vue"),
    meta: {
      requiresAuth: true,
      requiresRole: "host",
      title: "Panel Anfitrión",
    },
  },
  {
    path: "/organizer/dashboard",
    name: "organizer-dashboard",
    component: () =>
      import("@/dashboard/infrastructure/components/organizer/OrganizerDashboard.vue"),
    meta: {
      requiresAuth: true,
      requiresRole: "organizer",
      title: "Panel Organizador",
    },
  },

  // ========================================
  // EVENTOS
  // ========================================
  {
    path: "/events",
    name: "events",
    component: EventPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/events/create",
    name: "events-create",
    component: CreateAndEditEvent,
    meta: { requiresAuth: true },
  },
  {
    path: "/events/:id/edit",
    name: "events-edit",
    component: CreateAndEditEvent,
    props: true,
    meta: { requiresAuth: true },
  },

  // ========================================
  // TAREAS (solo organizador)
  // ========================================
  {
    path: "/tasks",
    name: "tasks",
    component: TaskPage,
    meta: { requiresAuth: true, requiresRole: "organizer" },
  },
  {
    path: "/tasks/create",
    name: "task-create",
    component: TaskCreatePage,
    meta: { requiresAuth: true, requiresRole: "organizer" },
  },
  {
    path: "/tasks/:id",
    name: "task-detail",
    component: TaskDetailPage,
    props: true,
    meta: { requiresAuth: true, requiresRole: "organizer" },
  },
  {
    path: "/tasks/:id/edit",
    name: "task-edit",
    component: TaskEditPage,
    props: true,
    meta: { requiresAuth: true, requiresRole: "organizer" },
  },

  // ========================================
  // NOT FOUND
  // ========================================
  {
    path: "/:pathMatch(.*)*",
    component: () =>
      import("@/shared/infrastructure/components/common/PageNotFound.vue"),
  },
];

// ========================================
// CONFIGURACIÓN DEL ROUTER
// ========================================
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ========================================
// GUARD DE NAVEGACIÓN
// ========================================
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore(pinia);

  const requiresAuth = to.meta.requiresAuth ?? true;
  const requiresRole = to.meta.requiresRole;

  // Intentar restaurar sesión si hay token
  if (!auth.isAuthenticated) {
    const persisted =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    if (persisted) {
      await auth.restoreSession();
    }
  }

  // Rutas que no requieren auth
  if (!requiresAuth) {
    if (to.meta.redirectIfAuth && auth.isAuthenticated) {
      if (auth.user.role === "host") return next("/host/dashboard");
      if (auth.user.role === "organizer") return next("/organizer/dashboard");
    }
    return next();
  }

  // Si requiere auth y no está logueado
  if (!auth.isAuthenticated) return next("/login");

  // Si requiere rol
  if (requiresRole && auth.user.role !== requiresRole) {
    if (auth.user.role === "host") return next("/host/dashboard");
    return next("/organizer/dashboard");
  }

  next();
});

export default router;
