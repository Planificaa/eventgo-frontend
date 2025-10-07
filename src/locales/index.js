import { createI18n } from 'vue-i18n'
import es from './es.json'
import en from './en.json'

const messages = { en, es }

const i18n = createI18n({
  locale: 'en', // idioma por defecto
  fallbackLocale: 'es',
  messages
})

export default i18n
