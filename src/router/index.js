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
    component: () => import('/src/dashboard/infrastructure/components/DashboardView.vue'),
    meta: { requiresAuth: true }
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
  // ========================================
  // RUTAS DE PERFIL DE ORGANIZADOR
  // ========================================
  {
    path: '/profile',
    name: 'OrganizerProfilePage',
    component: () => import('@/profile-management/presentation/pages/OrganizerProfilePage.vue'),
    meta: { title: 'Perfil del Organizador', requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'OrganizerProfileEditPage',
    component: () => import('/src/profile-management/presentation/pages/OrganizerProfileEditPage.vue'),
    meta: { title: 'Editar Perfil', requiresAuth: true }
  },
  {
    path: '/profile/chat',
    name: 'OrganizerChatPage',
    component: () => import('@/profile-management/presentation/pages/OrganizerChatPage.vue'),
    meta: { title: 'Chat con Clientes', requiresAuth: true }
  },
  // ========================================
  // RUTAS DE ÁLBUMES
  // ========================================
  {
    path: '/profile/albums',
    name: 'OrganizerAlbumPage',
    component: () => import('/src/profile-management/presentation/pages/OrganizerAlbumPage.vue'),
    meta: { title: 'Álbumes', requiresAuth: true }
  },
  {
    path: '/profile/albums/create',
    name: 'OrganizerAlbumCreatePage',
    component: () => import('/src/profile-management/presentation/pages/OrganizerAlbumCreatePage.vue'),
    meta: { title: 'Crear Álbum', requiresAuth: true }
  },
  {
    path: '/profile/albums/:id/edit',
    name: 'OrganizerAlbumEditPage',
    component: () => import('/src/profile-management/presentation/pages/OrganizerAlbumEditPage.vue'),
    props: true,
    meta: { title: 'Editar Álbum', requiresAuth: true }
  },

  // Ruta 404
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('/src/shared/infrastructure/components/common/PageNotFound.vue'),
    meta: { title: 'Página no encontrada' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Cambiar el título dinámicamente
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - EventGo` : 'EventGo'
  next()
})

export default router
