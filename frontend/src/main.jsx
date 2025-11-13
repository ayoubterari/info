import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import App from './App.jsx'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
