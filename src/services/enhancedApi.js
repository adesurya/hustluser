// src/services/enhancedApi.js - Enhanced API service with caching
import apiCacheService from './apiCacheService'

class EnhancedApiService {
  constructor() {
    this.originalApi = null // Will be set when initialized
  }

  // Initialize with original API service
  initialize(originalApiService) {
    this.originalApi = originalApiService
    // Pre-warm cache on initialization
    this.preWarmCache()
  }

  async preWarmCache() {
    await apiCacheService.preWarmCache()
  }

  // Categories
  async getCategories(options = {}) {
    return await apiCacheService.cachedRequest('categories', {}, options)
  }

  async getCategoryById(categoryId, options = {}) {
    return await apiCacheService.cachedRequest('categoryDetail', { id: categoryId }, options)
  }

  // Products
  async getProducts(params = {}, options = {}) {
    return await apiCacheService.cachedRequest('products', params, options)
  }

  async getProductById(productId, options = {}) {
    return await apiCacheService.cachedRequest('productDetail', { id: productId }, options)
  }

  async getFeaturedProducts(options = {}) {
    return await apiCacheService.cachedRequest('featuredProducts', {}, options)
  }

  // Campaigns
  async getActiveCampaigns(options = {}) {
    return await apiCacheService.cachedRequest('campaigns', {}, options)
  }

  async getCampaignById(campaignId, options = {}) {
    return await apiCacheService.cachedRequest('campaignDetail', { id: campaignId }, options)
  }

  // Leaderboard
  async getLeaderboardDaily(date, options = {}) {
    return await apiCacheService.cachedRequest('leaderboard', { 
      type: 'daily', 
      date 
    }, options)
  }

  async getLeaderboardMonthly(year, month, options = {}) {
    return await apiCacheService.cachedRequest('leaderboard', { 
      type: 'monthly', 
      year, 
      month 
    }, options)
  }

  // User & Profile
  async getUserProfile(options = {}) {
    return await apiCacheService.cachedRequest('userProfile', {}, options)
  }

  async getMyPoints(options = {}) {
    return await apiCacheService.cachedRequest('myPoints', {}, options)
  }

  async getMyTransactions(params = {}, options = {}) {
    return await apiCacheService.cachedRequest('transactions', params, options)
  }

  async getMyRedemptions(params = {}, options = {}) {
    return await apiCacheService.cachedRequest('redemptions', params, options)
  }

  // Write operations (invalidate cache after success)
  async login(credentials) {
    const response = await this.originalApi.login(credentials)
    if (response.success) {
      // Pre-warm cache after login
      setTimeout(() => this.preWarmCache(), 1000)
    }
    return response
  }

  async register(userData) {
    const response = await this.originalApi.register(userData)
    return response
  }

  async updateProfile(userData) {
    const response = await this.originalApi.updateProfile(userData)
    if (response.success) {
      await apiCacheService.invalidateRelated('profileUpdate')
    }
    return response
  }

  async createRedemption(redemptionData) {
    const response = await this.originalApi.createRedemption(redemptionData)
    if (response.success) {
      await apiCacheService.invalidateRelated('redemption')
    }
    return response
  }

  async generateAffiliateLink(productData) {
    const response = await this.originalApi.generateAffiliateLink(productData)
    if (response.success) {
      await apiCacheService.invalidateRelated('productPurchase')
    }
    return response
  }

  // Utility methods
  async refreshCache(endpoint, params = {}) {
    return await apiCacheService.cachedRequest(endpoint, params, { forceRefresh: true })
  }

  async invalidateCache(endpoint, params = {}) {
    await apiCacheService.invalidateCache(endpoint, params)
  }

  // Delegate other methods to original API
  async refreshToken() {
    return await this.originalApi.refreshToken()
  }

  async shareAffiliateLink(shareData) {
    return await this.originalApi.shareAffiliateLink(shareData)
  }

  // Static methods
  static extractMaterialId(productUrl) {
    return this.originalApi.constructor.extractMaterialId(productUrl)
  }

  static getCurrentWeekDates() {
    return this.originalApi.constructor.getCurrentWeekDates()
  }

  static formatPrice(price) {
    return this.originalApi.constructor.formatPrice(price)
  }

  static getImageUrl(imagePath, type = 'products') {
    return this.originalApi.constructor.getImageUrl(imagePath, type)
  }

  checkAuthStatus() {
    return this.originalApi.checkAuthStatus()
  }
}

export default new EnhancedApiService()

