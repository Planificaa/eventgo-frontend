import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// Importar CSS
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// Importar componentes
import { Avatar, Dropdown, Menubar, Sidebar } from 'primevue'
import Button from 'primevue/button'
import i18n from '@/locales/index.js'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false
    }
  }
})
  .use(router)
  .use(i18n)
  .component('Menubar', Menubar)
  .component('Button', Button)
  .component('Avatar', Avatar)
  .component('Sidebar',Sidebar)
  .component('Dropdown',Dropdown)
  .mount('#app')
