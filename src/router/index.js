// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import QuotePage from '/src/quote-management/presentation/pages/QuotePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Dashboard</h1><p>Página en construcción</p></div>',
      }),
  },
  {
    path: '/events',
    name: 'Events',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Eventos</h1><p>Página en construcción</p></div>',
      }),
  },
  {
    path: '/task',
    name: 'Task',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Tareas</h1><p>Página en construcción</p></div>',
      }),
  },
  // ========================================
  // RUTAS DE QUOTE MANAGEMENT
  // ========================================
  {
    path: '/quotes',
    name: 'quotes',
    component: QuotePage,
    meta: {
      title: 'Quotes',
      requiresAuth: true
    }
  },
  {
    path: '/quotes/create',
    name: 'quote-create',
    component: () => import('/src/quote-management/presentation/pages/QuoteCreatePage.vue'),
    meta: {
      title: 'Create Quote',
      requiresAuth: true
    }
  },
  {
    path: '/quotes/edit/:id',
    name: 'quote-edit',
    component: () => import('/src/quote-management/presentation/pages/QuoteEditPage.vue'),
    props: true,
    meta: {
      title: 'Edit Quote',
      requiresAuth: true
    }
  },
  {
    path: '/quotes/detail/:id',
    name: 'quote-detail',
    component: () => import('/src/quote-management/presentation/pages/QuoteDetailPage.vue'),
    props: true,
    meta: {
      title: 'Quote Detail',
      requiresAuth: true
    }
  },
  // ========================================
  // FIN RUTAS QUOTE MANAGEMENT
  // ========================================
  {
    path: '/messages',
    name: 'Messages',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Mensajes</h1><p>Página en construcción</p></div>',
      }),
  },
  // Ruta 404 - SIEMPRE AL FINAL
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('/src/shared/infrastructure/components/common/PageNotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll al inicio en cada navegación o mantener posición
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
})

// Navigation Guard - Actualizar título de página
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - EventGo` : 'EventGo';

  // TODO: Agregar lógica de autenticación si es necesario
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next({ name: 'login' });
  // } else {
  //   next();
  // }

  next();
});

export default router
