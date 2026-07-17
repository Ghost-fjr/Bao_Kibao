import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuthStore } from './store/authStore'
import { validateEnv } from './utils/env'

// Validate environment variables on startup
validateEnv()

// Initialize auth state before first render.
// This reads the stored JWT and fetches the user profile if a token exists.
// The store sets isLoading=false when done, which unblocks ProtectedRoute rendering.
useAuthStore.getState().initialize()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
