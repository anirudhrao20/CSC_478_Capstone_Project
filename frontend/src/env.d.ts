/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Backend API URL
  readonly VITE_API_URL: string
  
  // Authentication
  readonly VITE_AUTH_TOKEN_KEY?: string
  readonly VITE_AUTH_REFRESH_TOKEN_KEY?: string
  
  // API Keys
  readonly VITE_FINNHUB_API_KEY: string
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_ENABLE_DARK_MODE?: string
  
  // Deployment Environment
  readonly VITE_ENV: 'development' | 'staging' | 'production'
  
  // Optional: Analytics and Monitoring
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA_TRACKING_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
