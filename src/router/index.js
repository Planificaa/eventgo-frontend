import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ========================================
  // REDIRECCIÓN INICIAL
  // ========================================
  {
    path: '/',
    redirect: '/dashboard',
  },

  // ========================================
  // RUTAS BASE (dashboard, etc)
  // ========================================
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Dashboard</h1><p>Página en construcción</p></div>',
      }),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/events',
    name: 'Events',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Eventos</h1><p>Página en construcción</p></div>',
      }),
    meta: { title: 'Eventos' }
  },
  {
    path: '/task',
    name: 'Task',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Tareas</h1><p>Página en construcción</p></div>',
      }),
    meta: { title: 'Tareas' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Mensajes</h1><p>Página en construcción</p></div>',
      }),
    meta: { title: 'Mensajes' }
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
    component: () => import('@/profile-management/presentation/pages/OrganizerAlbumPage.vue'),
    meta: { title: 'Álbumes', requiresAuth: true }
  },
  {
    path: '/profile/albums/create',
    name: 'OrganizerAlbumCreatePage',
    component: () => import('@/profile-management/presentation/pages/OrganizerAlbumCreatePage.vue'),
    meta: { title: 'Crear Álbum', requiresAuth: true }
  },
  {
    path: '/profile/albums/:id/edit',
    name: 'OrganizerAlbumEditPage',
    component: () => import('@/profile-management/presentation/pages/OrganizerAlbumEditPage.vue'),
    props: true,
    meta: { title: 'Editar Álbum', requiresAuth: true }
  },

  // ========================================
  // RUTA 404
  // ========================================
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('@/shared/infrastructure/components/common/PageNotFound.vue'),
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
