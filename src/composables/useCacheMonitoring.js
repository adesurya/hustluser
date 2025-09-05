// src/composables/useCacheMonitoring.js - Cache monitoring composable
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useCacheMonitoring() {
  const stats = ref({
    memory: { size: 0, hits: 0, totalSize: 0 },
    localStorage: { size: 0, totalSize: 0 },
    indexedDB: { size: 0, totalSize: 0 },
    hitRate: 0,
    averageResponseTime: 0
  })

  const performance = ref({
    slowQueries: [],
    recentRequests: []
  })

  const healthStatus = computed(() => {
    const hitRate = stats.value.hitRate
    const avgResponseTime = stats.value.averageResponseTime
    const memoryUsage = stats.value.memory.totalSize / (1024 * 1024) // MB
    
    if (hitRate > 80 && avgResponseTime < 100 && memoryUsage < 10) {
      return { status: 'excellent', color: 'green' }
    } else if (hitRate > 60 && avgResponseTime < 300 && memoryUsage < 20) {
      return { status: 'good', color: 'blue' }
    } else if (hitRate > 40 && avgResponseTime < 500 && memoryUsage < 30) {
      return { status: 'fair', color: 'orange' }
    } else {
      return { status: 'poor', color: 'red' }
    }
  })

  let updateInterval = null

  const updateStats = async () => {
    try {
      const { default: cacheService } = await import('../services/cacheService')
      const { default: performanceService } = await import('../services/performanceService')
      
      const cacheStats = await cacheService.getStats()
      const performanceStats = performanceService.getMetrics()
      
      stats.value = {
        ...cacheStats,
        hitRate: parseFloat(performanceStats.cacheHitRate),
        averageResponseTime: performanceStats.averageResponseTime
      }
      
      performance.value = {
        slowQueries: performanceStats.slowQueries.slice(-10), // Last 10
        recentRequests: performanceStats.recentRequests?.slice(-20) || [] // Last 20
      }
    } catch (error) {
      console.error('Failed to update cache stats:', error)
    }
  }

  const startMonitoring = () => {
    updateStats() // Initial update
    updateInterval = setInterval(updateStats, 5000) // Update every 5 seconds
  }

  const stopMonitoring = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  const clearCache = async () => {
    try {
      const { default: cacheService } = await import('../services/cacheService')
      await cacheService.clearAll()
      updateStats()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    stats,
    performance,
    healthStatus,
    updateStats,
    clearCache,
    startMonitoring,
    stopMonitoring
  }
}