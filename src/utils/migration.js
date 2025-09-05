// src/utils/migration.js - Migration utility for existing applications
export class CacheMigration {
  static async migrateToEnhancedAPI() {
    console.log('Starting cache migration...')
    
    try {
      // Step 1: Backup existing data
      const existingData = await this.backupExistingData()
      
      // Step 2: Initialize new cache service
      const { default: cacheService } = await import('../services/cacheService')
      const { default: apiCacheService } = await import('../services/apiCacheService')
      
      // Step 3: Migrate existing cached data if any
      await this.migrateExistingCache(existingData)
      
      // Step 4: Pre-warm critical data
      await apiCacheService.preWarmCache()
      
      console.log('Cache migration completed successfully')
      return true
    } catch (error) {
      console.error('Cache migration failed:', error)
      return false
    }
  }

  static async backupExistingData() {
    const backup = {
      localStorage: {},
      sessionStorage: {}
    }

    // Backup localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !key.startsWith('cache:')) {
        backup.localStorage[key] = localStorage.getItem(key)
      }
    }

    // Backup sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        backup.sessionStorage[key] = sessionStorage.getItem(key)
      }
    }

    return backup
  }

  static async migrateExistingCache(backup) {
    const { default: cacheService } = await import('../services/cacheService')
    
    // Migrate wishlist data
    if (backup.localStorage.favoriteProducts) {
      try {
        const wishlistData = JSON.parse(backup.localStorage.favoriteProducts)
        await cacheService.set('userdata', 'wishlist', wishlistData, {
          ttl: CACHE_CONFIG.TTL.VERY_LONG,
          level: 'all'
        })
      } catch (error) {
        console.warn('Failed to migrate wishlist data:', error)
      }
    }

    // Migrate user settings
    if (backup.localStorage.userSettings) {
      try {
        const settingsData = JSON.parse(backup.localStorage.userSettings)
        await cacheService.set('userdata', 'settings', settingsData, {
          ttl: CACHE_CONFIG.TTL.VERY_LONG,
          level: 'all'
        })
      } catch (error) {
        console.warn('Failed to migrate settings data:', error)
      }
    }
  }
}