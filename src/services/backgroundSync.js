// Background sync service for offline capability
// src/services/backgroundSync.js
class BackgroundSyncService {
  constructor() {
    this.syncQueue = []
    this.isOnline = navigator.onLine
    this.syncInterval = null
    
    this.setupEventListeners()
    this.startPeriodicSync()
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  startPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 5 * 60 * 1000)
  }

  addToSyncQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
      retries: 0
    })
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const operations = [...this.syncQueue]
    this.syncQueue = []

    for (const operation of operations) {
      try {
        await this.executeOperation(operation)
        console.log('Background sync completed:', operation.type)
      } catch (error) {
        console.error('Background sync failed:', error)
        
        // Retry up to 3 times
        if (operation.retries < 3) {
          operation.retries++
          this.syncQueue.push(operation)
        }
      }
    }
  }

  async executeOperation(operation) {
    const { default: api } = await import('./enhancedApi')
    
    switch (operation.type) {
      case 'refreshCache':
        await api.refreshCache(operation.endpoint, operation.params)
        break
      
      case 'invalidateCache':
        await api.invalidateCache(operation.endpoint, operation.params)
        break
      
      case 'preWarmCache':
        await api.preWarmCache()
        break
      
      default:
        console.warn('Unknown sync operation:', operation.type)
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export default new BackgroundSyncService()