// ========================================
// IMPORTS PRINCIPALES
// ========================================
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import i18n from '@/locales/index.js'
import pinia from '@/shared/stores/pinia.js'
// ========================================
// PRIMEVUE CONFIGURACIÓN
// ========================================
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

// ========================================
// ESTILOS GLOBALES
// ========================================
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import '@/profile-management/presentation/styles/global.css'

// ========================================
// COMPONENTES PRIMEVUE USADOS GLOBALMENTE
// ========================================
// ========================================
// COMPONENTES PRIMEVUE USADOS GLOBALMENTE
// ========================================
import Menubar from 'primevue/menubar'
// Importar componentes
import {DataTable, Dialog, InputText, TabView, TabPanel, Card, Rating, Divider, ToggleButton, Password, Message, Checkbox, Paginator } from 'primevue'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Sidebar from 'primevue/sidebar'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'


// ========================================
// CREACIÓN DE LA APP
// ========================================
const app = createApp(App)

// ========================================
// CONFIGURACIÓN DE PRIMEVUE Y PLUGINS
// ========================================
app.use(pinia)
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
  .component('InputText', InputText)
  .component('Dialog', Dialog)
  .component('Table',DataTable)
  .use(ToastService)

// ========================================
// REGISTRO GLOBAL DE COMPONENTES
// ========================================
app.component('AppMenubar', Menubar)
app.component('AppButton', Button)
app.component('AppAvatar', Avatar)
app.component('AppSidebar', Sidebar)
app.component('AppDropdown', Dropdown)
app.component('AppToast', Toast)
app.component('Toast', Toast)
app.component('Checkbox', Checkbox)
app.component('Password', Password)
app.component('ToggleButton', ToggleButton)
app.component('Divider', Divider)
app.component('Rating', Rating)
app.component('Card', Card)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Message', Message)
app.component('Paginator', Paginator)

// ========================================
// MONTAJE DE LA APP
// ========================================
app.mount('#app')
