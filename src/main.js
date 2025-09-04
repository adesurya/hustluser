import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import './assets/styles/main.css'
import ToastNotification from './components/ToastNotification.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('ToastNotification', ToastNotification)

app.mount('#app')