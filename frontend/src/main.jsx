import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker } from './utils/registerServiceWorker.js'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

// Enregistrer le Service Worker pour les notifications push
if (import.meta.env.PROD || import.meta.env.DEV) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log('✅ Service Worker enregistré avec succès')
    }
  }).catch((error) => {
    console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConvexProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
