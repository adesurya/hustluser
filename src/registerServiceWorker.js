import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered() {
      console.log('Service worker has been registered.')
    },
    cached() {
      console.log('Content has been cached for offline use.')
    },
    updatefound() {
      console.log('New content is downloading.')
    },
    updated() {
      console.log('New content is available; please refresh.')
      // Show update notification to user
      if (confirm('New version available! Refresh to update?')) {
        window.location.reload()
      }
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error(error) {
      console.error('Error during service worker registration:', error)
    }
  })
}

// Install prompt for PWA
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  
  // Show install button/banner
  showInstallPromotion()
})

function showInstallPromotion() {
  // Create install button if doesn't exist
  const installBtn = document.getElementById('install-btn')
  if (installBtn) {
    installBtn.style.display = 'block'
    installBtn.addEventListener('click', () => {
      // Hide the install promotion
      installBtn.style.display = 'none'
      // Show the install prompt
      deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
        deferredPrompt = null
      })
    })
  }
}

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed')
})