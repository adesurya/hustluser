const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: 'Hazel',
    themeColor: '#4F46E5',
    msTileColor: '#4F46E5',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',

    
    // Disable automatic icon generation to prevent 404 errors
    iconPaths: {
      favicon32: null,
      favicon16: null,
      appleTouchIcon: null,
      maskIcon: null,
      msTileImage: null
    },
    
    manifestOptions: {
      name: 'Hazel - Official Linkshare Partner Tiktok',
      short_name: 'Hazel',
      description: 'Hazel Official Linkshare Partner Tiktok',
      background_color: '#FFFFFF',
      theme_color: '#4F46E5',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      // Empty icons array to prevent 404 errors during development
      icons: []
    },
    
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      // Don't cache the manifest to avoid icon errors
      exclude: [/\.map$/, /manifest\.json$/],
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://apihustl\\.sijago\\.ai/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300 // 5 minutes
            }
          }
        },
        {
          urlPattern: new RegExp('^https://fonts\\.(googleapis|gstatic)\\.com/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            }
          }
        }
      ]
    }
  },
  devServer: {
    port: 8080,
    open: true,
    https: false,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },
  productionSourceMap: false,
  css: {
    extract: true
  },
  configureWebpack: {
    // Ignore missing icon files during development
    ignoreWarnings: [
      {
        module: /img\/icons/,
        message: /Can't resolve/
      }
    ]
  }
})