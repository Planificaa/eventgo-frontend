import { createRouter, createWebHistory } from 'vue-router'

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

export default router
