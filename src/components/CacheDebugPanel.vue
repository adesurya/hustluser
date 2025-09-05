// Cache Debug Component
// src/components/CacheDebugPanel.vue - Debug panel for development
<template>
  <div v-if="showPanel" class="cache-debug-panel">
    <div class="debug-header">
      <h3>Cache Debug Panel</h3>
      <button @click="showPanel = false" class="close-btn">×</button>
    </div>
    
    <div class="debug-content">
      <!-- Health Status -->
      <div class="health-section">
        <div class="health-indicator" :class="healthStatus.color">
          {{ healthStatus.status.toUpperCase() }}
        </div>
        <div class="health-metrics">
          <span>Hit Rate: {{ stats.hitRate.toFixed(1) }}%</span>
          <span>Avg Response: {{ stats.averageResponseTime.toFixed(0) }}ms</span>
        </div>
      </div>

      <!-- Cache Statistics -->
      <div class="stats-section">
        <h4>Cache Statistics</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <label>Memory Cache:</label>
            <span>{{ stats.memory.size }} items ({{ formatSize(stats.memory.totalSize) }})</span>
          </div>
          <div class="stat-item">
            <label>LocalStorage:</label>
            <span>{{ stats.localStorage.size }} items ({{ formatSize(stats.localStorage.totalSize) }})</span>
          </div>
          <div class="stat-item">
            <label>IndexedDB:</label>
            <span>{{ stats.indexedDB.size }} items ({{ formatSize(stats.indexedDB.totalSize) }})</span>
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="performance-section">
        <h4>Performance</h4>
        <div v-if="performance.slowQueries.length" class="slow-queries">
          <label>Slow Queries:</label>
          <ul>
            <li v-for="query in performance.slowQueries.slice(0, 5)" :key="query.timestamp">
              {{ query.endpoint }}: {{ query.responseTime }}ms
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button @click="updateStats" class="refresh-btn">Refresh Stats</button>
        <button @click="clearCache" class="clear-btn">Clear All Cache</button>
        <button @click="exportStats" class="export-btn">Export Stats</button>
      </div>
    </div>
  </div>

  <!-- Toggle Button -->
  <button v-else @click="showPanel = true" class="debug-toggle">
    Cache Debug
  </button>
</template>

<script>
import { ref, computed } from 'vue'
import { useCacheMonitoring } from '../composables/useCacheMonitoring'

export default {
  name: 'CacheDebugPanel',
  setup() {
    const showPanel = ref(false)
    const { stats, performance, healthStatus, updateStats, clearCache } = useCacheMonitoring()

    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const exportStats = () => {
      const data = {
        timestamp: new Date().toISOString(),
        stats: stats.value,
        performance: performance.value,
        health: healthStatus.value
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cache-stats-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    return {
      showPanel,
      stats,
      performance,
      healthStatus,
      updateStats,
      clearCache,
      formatSize,
      exportStats
    }
  }
}
</script>

<style scoped>
.cache-debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  font-size: 12px;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.debug-content {
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.health-indicator {
  padding: 5px 10px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.health-indicator.green { background: #d4edda; color: #155724; }
.health-indicator.blue { background: #cce7ff; color: #004085; }
.health-indicator.orange { background: #fff3cd; color: #856404; }
.health-indicator.red { background: #f8d7da; color: #721c24; }

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.actions-section {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.actions-section button {
  flex: 1;
  padding: 5px;
  font-size: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 9998;
}
</style>