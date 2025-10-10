import { createRouter, createWebHistory } from 'vue-router'

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
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Eventos</h1><p>Página en construcción</p></div>',
      }),
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

  {
    path: '/quotes',
    name: 'Quotes',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Cotizaciones</h1><p>Página en construcción</p></div>',
      }),
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () =>
      Promise.resolve({
        template: '<div class="p-4"><h1>Mensajes</h1><p>Página en construcción</p></div>',
      }),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    component: () => import('@/shared/infrastructure/components/common/PageNotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

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
