import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { CurrencyProvider } from './providers/CurrencyProvider'
import { AuthProvider } from './providers/AuthProvider'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </AuthProvider>
  </React.StrictMode>
)
