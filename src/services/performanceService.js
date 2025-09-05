// Performance monitoring service
// src/services/performanceService.js
class PerformanceService {
  constructor() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      slowQueries: []
    }
    
    this.startMonitoring()
  }

  startMonitoring() {
    // Monitor API calls
    this.interceptApiCalls()
    
    // Report metrics periodically
    setInterval(() => this.reportMetrics(), 60000) // Every minute
  }

  recordCacheHit(endpoint, responseTime) {
    this.metrics.cacheHits++
    this.recordResponseTime(responseTime)
    console.log(`Cache hit: ${endpoint} (${responseTime}ms)`)
  }

  recordCacheMiss(endpoint, responseTime) {
    this.metrics.cacheMisses++
    this.metrics.apiCalls++
    this.recordResponseTime(responseTime)
    
    if (responseTime > 1000) {
      this.metrics.slowQueries.push({
        endpoint,
        responseTime,
        timestamp: Date.now()
      })
    }
    
    console.log(`API call: ${endpoint} (${responseTime}ms)`)
  }

  recordResponseTime(responseTime) {
    this.metrics.totalResponseTime += responseTime
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / totalRequests
  }

  interceptApiCalls() {
    // This would be implemented based on your specific API structure
    // You could use fetch interceptors or axios interceptors
  }

  getMetrics() {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100
    
    return {
      ...this.metrics,
      cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate.toFixed(2)
    }
  }

  reportMetrics() {
    const metrics = this.getMetrics()
    console.group('Performance Metrics')
    console.log('Cache Hit Rate:', metrics.cacheHitRate + '%')
    console.log('Average Response Time:', metrics.averageResponseTime.toFixed(2) + 'ms')
    console.log('Total API Calls:', metrics.apiCalls)
    console.log('Slow Queries:', metrics.slowQueries.length)
    console.groupEnd()
  }

  reset() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      slowQueries: []
    }
  }
}

export default new PerformanceService()