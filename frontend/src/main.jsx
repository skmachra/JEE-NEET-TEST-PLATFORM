import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './components/Auth.jsx'
import { MessageProvider } from './components/Message.jsx'

createRoot(document.getElementById('root')).render(
  <MessageProvider>
  <AuthProvider>
  <StrictMode>
    <App />
  </StrictMode>
  </AuthProvider>
  </MessageProvider>
)
