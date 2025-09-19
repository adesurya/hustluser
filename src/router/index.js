import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup', 
    component: () => import('../views/SignupView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login-success',
    name: 'LoginSuccess',
    component: () => import('../views/LoginSuccessView.vue')
  },
  {
    path: '/signup-success',
    name: 'SignupSuccess',
    component: () => import('../views/SignupSuccessView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/CategoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaign',
    name: 'Campaign',
    component: () => import('../views/CampaignView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/campaign/:id',
    name: 'CampaignDetail',
    component: () => import('../views/CampaignDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/LeaderboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  // Wishlist Routes
  {
    path: '/profile/wishlist',
    name: 'Wishlist',
    component: () => import('../views/WishlistView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'My Wishlist'
    }
  },
  // Affiliate Links Routes
  {
    path: '/profile/affiliate-links',
    name: 'AffiliateLinks',
    component: () => import('../views/AffiliateLinksView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Affiliate Links History'
    }
  },
  // Bank Account Routes - NEW
  {
    path: '/profile/bank-accounts',
    name: 'BankAccounts',
    component: () => import('../views/BankAccountView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Bank Account Management'
    }
  },
  // Redemption Routes
  {
    path: '/profile/redeem',
    name: 'Redeem',
    component: () => import('../views/RedeemView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/transactions',
    name: 'Transactions',
    component: () => import('../views/TransactionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/redemptions',
    name: 'Redemptions',
    component: () => import('../views/RedemptionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  authStore.initializeFromStorage()
  
  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router