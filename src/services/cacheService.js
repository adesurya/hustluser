// src/services/cacheService.js - Advanced Caching Service
class CacheService {
  constructor() {
    this.memoryCache = new Map()
    this.localStorage = window.localStorage
    this.sessionStorage = window.sessionStorage
    this.indexedDB = null
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxMemoryItems: 100,
      maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
      enableIndexedDB: true
    }
    
    this.initIndexedDB()
    this.cleanupExpiredEntries()
    
    // Cleanup expired entries every 10 minutes
    setInterval(() => this.cleanupExpiredEntries(), 10 * 60 * 1000)
  }

  // Initialize IndexedDB for large data caching
  async initIndexedDB() {
    if (!this.config.enableIndexedDB || !window.indexedDB) return

    try {
      this.indexedDB = await this.openIndexedDB()
    } catch (error) {
      console.warn('IndexedDB initialization failed:', error)
    }
  }

  openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HazelCache', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }
    })
  }

  // Generate cache key with namespace support
  generateKey(namespace, key, params = {}) {
    const paramString = Object.keys(params).length > 0 
      ? JSON.stringify(params, Object.keys(params).sort())
      : ''
    return `${namespace}:${key}:${this.hashCode(paramString)}`
  }

  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Create cache entry with metadata
  createCacheEntry(data, ttl = this.config.defaultTTL) {
    return {
      data,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + ttl,
      size: this.estimateSize(data),
      hits: 0
    }
  }

  // Estimate data size in bytes
  estimateSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 0
    }
  }

  // Check if cache entry is valid
  isValid(entry) {
    return entry && entry.expiresAt > Date.now()
  }

  // Memory Cache Operations
  setMemory(key, data, ttl) {
    const entry = this.createCacheEntry(data, ttl)
    
    // Evict oldest entries if cache is full
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }
    
    this.memoryCache.set(key, entry)
  }

  getMemory(key) {
    const entry = this.memoryCache.get(key)
    if (this.isValid(entry)) {
      entry.hits++
      return entry.data
    }
    
    if (entry) this.memoryCache.delete(key)
    return null
  }

  // LocalStorage Cache Operations (for smaller data)
  setLocalStorage(key, data, ttl) {
    try {
      const entry = this.createCacheEntry(data, ttl)
      const entryString = JSON.stringify(entry)
      
      // Check storage size limit
      if (entryString.length > this.config.maxLocalStorageSize / 10) {
        console.warn('Data too large for localStorage:', key)
        return false
      }
      
      this.localStorage.setItem(`cache:${key}`, entryString)
      return true
    } catch (error) {
      console.warn('localStorage cache error:', error)
      return false
    }
  }

  getLocalStorage(key) {
    try {
      const entryString = this.localStorage.getItem(`cache:${key}`)
      if (!entryString) return null
      
      const entry = JSON.parse(entryString)
      if (this.isValid(entry)) {
        entry.hits++
        // Update hit count
        this.localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
        return entry.data
      }
      
      this.localStorage.removeItem(`cache:${key}`)
      return null
    } catch (error) {
      console.warn('localStorage get error:', error)
      return null
    }
  }

  // IndexedDB Cache Operations (for large data)
  async setIndexedDB(key, data, ttl) {
    if (!this.indexedDB) return false

    try {
      const entry = this.createCacheEntry(data, ttl)
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      
      await new Promise((resolve, reject) => {
        const request = store.put({ key: `idb:${key}`, ...entry })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      return true
    } catch (error) {
      console.warn('IndexedDB set error:', error)
      return false
    }
  }

  async getIndexedDB(key) {
    if (!this.indexedDB) return null

    try {
      const transaction = this.indexedDB.transaction(['cache'], 'readonly')
      const store = transaction.objectStore('cache')
      
      const entry = await new Promise((resolve, reject) => {
        const request = store.get(`idb:${key}`)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      
      if (entry && this.isValid(entry)) {
        entry.hits++
        // Update hit count asynchronously
        this.setIndexedDB(key, entry.data, entry.ttl - (Date.now() - entry.timestamp))
        return entry.data
      }
      
      if (entry) {
        // Remove expired entry
        const deleteTransaction = this.indexedDB.transaction(['cache'], 'readwrite')
        deleteTransaction.objectStore('cache').delete(`idb:${key}`)
      }
      
      return null
    } catch (error) {
      console.warn('IndexedDB get error:', error)
      return null
    }
  }

  // Multi-level cache get/set
  async get(namespace, key, params = {}) {
    const cacheKey = this.generateKey(namespace, key, params)
    
    // Try memory cache first (fastest)
    let data = this.getMemory(cacheKey)
    if (data) return { data, source: 'memory' }
    
    // Try localStorage (medium speed)
    data = this.getLocalStorage(cacheKey)
    if (data) {
      // Promote to memory cache
      this.setMemory(cacheKey, data, this.config.defaultTTL)
      return { data, source: 'localStorage' }
    }
    
    // Try IndexedDB (slower but more capacity)
    data = await this.getIndexedDB(cacheKey)
    if (data) {
      // Promote to memory and localStorage
      this.setMemory(cacheKey, data, this.config.defaultTTL)
      this.setLocalStorage(cacheKey, data, this.config.defaultTTL)
      return { data, source: 'indexedDB' }
    }
    
    return null
  }

  async set(namespace, key, data, options = {}) {
    const {
      ttl = this.config.defaultTTL,
      level = 'auto', // auto, memory, localStorage, indexedDB, all
      params = {}
    } = options
    
    const cacheKey = this.generateKey(namespace, key, params)
    const dataSize = this.estimateSize(data)
    
    if (level === 'auto') {
      // Automatically choose storage based on data size
      this.setMemory(cacheKey, data, ttl)
      
      if (dataSize < 50000) { // Less than 50KB
        this.setLocalStorage(cacheKey, data, ttl)
      } else {
        await this.setIndexedDB(cacheKey, data, ttl)
      }
    } else if (level === 'all') {
      this.setMemory(cacheKey, data, ttl)
      this.setLocalStorage(cacheKey, data, ttl)
      await this.setIndexedDB(cacheKey, data, ttl)
    } else if (level === 'memory') {
      this.setMemory(cacheKey, data, ttl)
    } else if (level === 'localStorage') {
      this.setLocalStorage(cacheKey, data, ttl)
    } else if (level === 'indexedDB') {
      await this.setIndexedDB(cacheKey, data, ttl)
    }
  }

  // Invalidate cache entries
  async invalidate(namespace, key = null, params = {}) {
    if (key) {
      const cacheKey = this.generateKey(namespace, key, params)
      this.memoryCache.delete(cacheKey)
      this.localStorage.removeItem(`cache:${cacheKey}`)
      
      if (this.indexedDB) {
        const transaction = this.indexedDB.transaction(['cache'], 'readwrite')
        transaction.objectStore('cache').delete(`idb:${cacheKey}`)
      }
    } else {
      // Invalidate all entries in namespace
      const pattern = `${namespace}:`
      
      // Clear memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(pattern)) {
          this.memoryCache.delete(key)
        }
      }
      
      // Clear localStorage
      const keysToRemove = []
      for (let i = 0; i < this.localStorage.length; i++) {
        const key = this.localStorage.key(i)
        if (key && key.startsWith(`cache:${pattern}`)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => this.localStorage.removeItem(key))
      
      // Clear IndexedDB
      if (this.indexedDB) {
        const transaction = this.indexedDB.transaction(['cache'], 'readwrite')
        const store = transaction.objectStore('cache')
        const request = store.openCursor()
        
        request.onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            if (cursor.key.startsWith(`idb:${pattern}`)) {
              cursor.delete()
            }
            cursor.continue()
          }
        }
      }
    }
  }

  // Cleanup expired entries
  cleanupExpiredEntries() {
    const now = Date.now()
    
    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key)
      }
    }
    
    // Cleanup localStorage
    const keysToRemove = []
    for (let i = 0; i < this.localStorage.length; i++) {
      const key = this.localStorage.key(i)
      if (key && key.startsWith('cache:')) {
        try {
          const entry = JSON.parse(this.localStorage.getItem(key))
          if (entry.expiresAt <= now) {
            keysToRemove.push(key)
          }
        } catch (error) {
          keysToRemove.push(key) // Remove invalid entries
        }
      }
    }
    keysToRemove.forEach(key => this.localStorage.removeItem(key))
  }

  // Get cache statistics
  async getStats() {
    const stats = {
      memory: {
        size: this.memoryCache.size,
        totalHits: 0,
        totalSize: 0
      },
      localStorage: {
        size: 0,
        totalSize: 0
      },
      indexedDB: {
        size: 0,
        totalSize: 0
      }
    }
    
    // Memory cache stats
    for (const entry of this.memoryCache.values()) {
      stats.memory.totalHits += entry.hits
      stats.memory.totalSize += entry.size
    }
    
    // LocalStorage stats
    for (let i = 0; i < this.localStorage.length; i++) {
      const key = this.localStorage.key(i)
      if (key && key.startsWith('cache:')) {
        try {
          const entry = JSON.parse(this.localStorage.getItem(key))
          stats.localStorage.size++
          stats.localStorage.totalSize += entry.size
        } catch (error) {
          // Ignore invalid entries
        }
      }
    }
    
    return stats
  }

  // Clear all caches
  async clearAll() {
    this.memoryCache.clear()
    
    // Clear localStorage cache entries
    const keysToRemove = []
    for (let i = 0; i < this.localStorage.length; i++) {
      const key = this.localStorage.key(i)
      if (key && key.startsWith('cache:')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => this.localStorage.removeItem(key))
    
    // Clear IndexedDB
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['cache'], 'readwrite')
      const store = transaction.objectStore('cache')
      store.clear()
    }
  }
}

export default new CacheService()

