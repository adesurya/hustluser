// src/main.js - Updated main file with cache plugin
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import cachePlugin from './plugins/cachePlugin'
import './registerServiceWorker'
import './assets/styles/main.css'
import ToastNotification from './components/ToastNotification.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(cachePlugin, { preWarm: true })
app.component('ToastNotification', ToastNotification)

// Add network status monitoring
let isOnline = navigator.onLine
const updateOnlineStatus = () => {
  const wasOffline = !isOnline
  isOnline = navigator.onLine
  
  if (isOnline && wasOffline) {
    // Refresh cache when coming back online
    setTimeout(() => {
      import('./services/enhancedApi').then(({ default: api }) => {
        api.preWarmCache()
      })
    }, 1000)
  }
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

app.mount('#app')