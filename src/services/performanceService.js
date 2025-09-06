// src/services/performanceService.js - Enhanced performance monitoring
class PerformanceService {
  constructor() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      slowQueries: [],
      endpointMetrics: new Map(),
      sessionStart: Date.now()
    }
    
    this.config = {
      slowQueryThreshold: 1000, // 1 second
      reportInterval: 60000, // 1 minute
      maxSlowQueries: 20
    }
    
    this.initialized = false
    this.reportInterval = null
    this.startMonitoring()
  }

  startMonitoring() {
    if (this.initialized) return
    
    console.log('Performance monitoring initialized')
    this.initialized = true
    
    // Monitor API calls
    this.interceptApiCalls()
    
    // Report metrics periodically
    this.reportInterval = setInterval(() => {
      this.reportMetrics()
    }, this.config.reportInterval)
    
    // Monitor page visibility for accurate metrics
    this.setupVisibilityMonitoring()
  }

  setupVisibilityMonitoring() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('Performance monitoring paused (page hidden)')
        } else {
          console.log('Performance monitoring resumed (page visible)')
        }
      })
    }
  }

  recordCacheHit(endpoint, responseTime, source = 'unknown') {
    this.metrics.cacheHits++
    this.recordResponseTime(responseTime)
    this.recordEndpointMetric(endpoint, responseTime, 'cache_hit')
    
    console.debug(`Cache hit: ${endpoint} (${responseTime}ms, ${source})`)
  }

  recordCacheMiss(endpoint, responseTime, reason = 'not_cached') {
    this.metrics.cacheMisses++
    this.metrics.apiCalls++
    this.recordResponseTime(responseTime)
    this.recordEndpointMetric(endpoint, responseTime, 'api_call')
    
    if (responseTime > this.config.slowQueryThreshold) {
      this.recordSlowQuery(endpoint, responseTime, 'api_call')
    }
    
    console.debug(`API call: ${endpoint} (${responseTime}ms, ${reason})`)
  }

  recordApiCall(endpoint, responseTime, status = 'success') {
    this.metrics.apiCalls++
    this.recordResponseTime(responseTime)
    this.recordEndpointMetric(endpoint, responseTime, status)
    
    if (responseTime > this.config.slowQueryThreshold) {
      this.recordSlowQuery(endpoint, responseTime, status)
    }
    
    if (status === 'error') {
      console.warn(`API error: ${endpoint} (${responseTime}ms)`)
    } else {
      console.debug(`API success: ${endpoint} (${responseTime}ms)`)
    }
  }

  recordResponseTime(responseTime) {
    this.metrics.totalResponseTime += responseTime
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    this.metrics.averageResponseTime = totalRequests > 0 
      ? this.metrics.totalResponseTime / totalRequests 
      : 0
  }

  recordEndpointMetric(endpoint, responseTime, type) {
    if (!this.metrics.endpointMetrics.has(endpoint)) {
      this.metrics.endpointMetrics.set(endpoint, {
        totalCalls: 0,
        cacheHits: 0,
        apiCalls: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        fastestCall: Infinity,
        slowestCall: 0,
        lastCalled: null,
        errors: 0
      })
    }
    
    const metric = this.metrics.endpointMetrics.get(endpoint)
    metric.totalCalls++
    metric.totalResponseTime += responseTime
    metric.averageResponseTime = metric.totalResponseTime / metric.totalCalls
    metric.fastestCall = Math.min(metric.fastestCall, responseTime)
    metric.slowestCall = Math.max(metric.slowestCall, responseTime)
    metric.lastCalled = Date.now()
    
    if (type === 'cache_hit') {
      metric.cacheHits++
    } else if (type === 'api_call') {
      metric.apiCalls++
    } else if (type === 'error') {
      metric.errors++
    }
  }

  recordSlowQuery(endpoint, responseTime, type) {
    const slowQuery = {
      endpoint,
      responseTime,
      type,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }
    
    this.metrics.slowQueries.push(slowQuery)
    
    // Keep only recent slow queries
    if (this.metrics.slowQueries.length > this.config.maxSlowQueries) {
      this.metrics.slowQueries = this.metrics.slowQueries.slice(-this.config.maxSlowQueries)
    }
    
    console.warn(`Slow query detected: ${endpoint} took ${responseTime}ms`)
  }

  interceptApiCalls() {
    // Intercept fetch calls
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const startTime = Date.now()
        const url = args[0]
        
        try {
          const response = await originalFetch(...args)
          const responseTime = Date.now() - startTime
          const endpoint = this.extractEndpointFromUrl(url)
          
          if (response.ok) {
            this.recordApiCall(endpoint, responseTime, 'success')
          } else {
            this.recordApiCall(endpoint, responseTime, 'error')
          }
          
          return response
        } catch (error) {
          const responseTime = Date.now() - startTime
          const endpoint = this.extractEndpointFromUrl(url)
          this.recordApiCall(endpoint, responseTime, 'error')
          throw error
        }
      }
    }
  }

  extractEndpointFromUrl(url) {
    try {
      if (typeof url === 'string') {
        const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
        const pathname = urlObj.pathname
        // Extract meaningful endpoint parts
        const parts = pathname.split('/').filter(part => part && !part.match(/^\d+$/))
        return parts.slice(-2).join('/') || pathname
      }
      return 'unknown'
    } catch {
      return 'invalid_url'
    }
  }

  getMetrics() {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    const cacheHitRate = totalRequests > 0 
      ? (this.metrics.cacheHits / totalRequests * 100) 
      : 0
    
    const sessionDuration = Date.now() - this.metrics.sessionStart
    
    // Convert endpoint metrics Map to object
    const endpointBreakdown = {}
    for (const [endpoint, metrics] of this.metrics.endpointMetrics) {
      const endpointCacheRate = metrics.totalCalls > 0 
        ? (metrics.cacheHits / metrics.totalCalls * 100) 
        : 0
      
      endpointBreakdown[endpoint] = {
        ...metrics,
        cacheHitRate: endpointCacheRate.toFixed(2),
        errorRate: metrics.totalCalls > 0 
          ? (metrics.errors / metrics.totalCalls * 100).toFixed(2) 
          : 0
      }
    }
    
    return {
      ...this.metrics,
      cacheHitRate: cacheHitRate.toFixed(2),
      sessionDuration,
      totalRequests,
      endpointBreakdown,
      performance: {
        averageResponseTime: this.metrics.averageResponseTime.toFixed(2),
        slowQueries: this.metrics.slowQueries.length,
        apiCallsPerMinute: sessionDuration > 0 
          ? (this.metrics.apiCalls / (sessionDuration / 60000)).toFixed(2) 
          : 0
      }
    }
  }

  reportMetrics() {
    if (typeof document !== 'undefined' && document.hidden) {
      return // Don't report when page is hidden
    }
    
    const metrics = this.getMetrics()
    
    console.group('Performance Metrics Report')
    console.log(`Cache Hit Rate: ${metrics.cacheHitRate}%`)
    console.log(`Average Response Time: ${metrics.performance.averageResponseTime}ms`)
    console.log(`Total API Calls: ${metrics.apiCalls}`)
    console.log(`Total Requests: ${metrics.totalRequests}`)
    console.log(`Slow Queries: ${metrics.performance.slowQueries}`)
    console.log(`API Calls/min: ${metrics.performance.apiCallsPerMinute}`)
    
    if (metrics.slowQueries.length > 0) {
      console.group('Recent Slow Queries')
      metrics.slowQueries.slice(-3).forEach(query => {
        console.log(`${query.endpoint}: ${query.responseTime}ms (${query.type})`)
      })
      console.groupEnd()
    }
    
    // Log top 3 most used endpoints
    const sortedEndpoints = Object.entries(metrics.endpointBreakdown)
      .sort(([,a], [,b]) => b.totalCalls - a.totalCalls)
      .slice(0, 3)
    
    if (sortedEndpoints.length > 0) {
      console.group('Top Endpoints')
      sortedEndpoints.forEach(([endpoint, stats]) => {
        console.log(`${endpoint}: ${stats.totalCalls} calls, ${stats.cacheHitRate}% cache rate`)
      })
      console.groupEnd()
    }
    
    console.groupEnd()
  }

  generateReport() {
    const metrics = this.getMetrics()
    const report = {
      timestamp: new Date().toISOString(),
      session: {
        duration: metrics.sessionDuration,
        start: new Date(this.metrics.sessionStart).toISOString()
      },
      performance: {
        cacheHitRate: parseFloat(metrics.cacheHitRate),
        averageResponseTime: parseFloat(metrics.performance.averageResponseTime),
        totalRequests: metrics.totalRequests,
        apiCalls: metrics.apiCalls,
        slowQueries: metrics.slowQueries
      },
      endpoints: metrics.endpointBreakdown
    }
    
    return report
  }

  exportMetrics() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('Export not available in this environment')
      return
    }

    const report = this.generateReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('Performance metrics exported')
  }

  reset() {
    const oldSessionStart = this.metrics.sessionStart
    
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      slowQueries: [],
      endpointMetrics: new Map(),
      sessionStart: Date.now()
    }
    
    console.log('Performance metrics reset', {
      previousSession: Date.now() - oldSessionStart
    })
  }

  destroy() {
    if (this.reportInterval) {
      clearInterval(this.reportInterval)
      this.reportInterval = null
    }
    
    this.initialized = false
    console.log('Performance monitoring stopped')
  }

  // Integration helpers for cache services
  notifyCacheOperation(operation, endpoint, responseTime, source = 'unknown') {
    switch (operation) {
      case 'hit':
        this.recordCacheHit(endpoint, responseTime, source)
        break
      case 'miss':
        this.recordCacheMiss(endpoint, responseTime, 'cache_miss')
        break
      case 'api':
        this.recordApiCall(endpoint, responseTime)
        break
      default:
        console.warn(`Unknown cache operation: ${operation}`)
        break
    }
  }
}

export default new PerformanceService()