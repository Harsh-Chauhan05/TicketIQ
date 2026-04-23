import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { SocketProvider } from './context/SocketContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
);
