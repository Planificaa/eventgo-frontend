// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import QuotePage from '/src/quote-management/presentation/pages/QuotePage.vue'

import EventPage from '../../src/social-event-management/doman/presentation/pages/event-page.component.vue'
import CreateAndEditEvent from '/src/social-event-management/doman/presentation/components/create-and-edit-event.component.vue'
// Task Management Pages
import TaskPage from '@/task-management/presentation/pages/TaskPage.vue'
import TaskCreatePage from '@/task-management/presentation/pages/TaskCreatePage.vue'
import TaskEditPage from '@/task-management/presentation/pages/TaskEditPage.vue'
import TaskDetailPage from '@/task-management/presentation/pages/TaskDetailPage.vue'

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
    component: EventPage,
    meta: {
      title: 'Events Management',
      requiresAuth: true
    }
  },
  {
    path: '/events/create',
    name: 'Create Event',
    component: CreateAndEditEvent,
    meta: {
      title: 'Create Event',
      requiresAuth: true
    }


  },

  // ==========================================
  // TASK MANAGEMENT
  // ==========================================
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskPage,
    meta: {
      title: 'Gestión de Tareas',
    }
  },
  {
    path: '/tasks/create',
    name: 'task-create',
    component: TaskCreatePage,
    meta: {
      title: 'Crear Tarea',
    }
  },
  {
    path: '/tasks/:id/edit',
    name: 'task-edit',
    component: TaskEditPage,
    props: true,
    meta: {
      title: 'Editar Tarea',
    }
  },
  {
    path: '/tasks/:id',
    name: 'task-detail',
    component: TaskDetailPage,
    props: true,
    meta: {
      title: 'Detalle de Tarea',
    }
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
    component: () => import('/src/direct-communication/presentation/views/MessagesView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: ':conversationId',
        name: 'MessagesConversation',
        component: () => import('/src/direct-communication/presentation/views/MessagesView.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/chat/:userId',
    name: 'DirectChat',
    component: () => import('/src/direct-communication/presentation/views/ChatView.vue'),
    props: true,
    meta: { requiresAuth: true },
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

// Actualizar título de la página
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - EventGO`
  } else {
    document.title = 'EventGO - Event Management Platform'
  }
  next()
})

// Scroll al inicio al cambiar de ruta
router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
