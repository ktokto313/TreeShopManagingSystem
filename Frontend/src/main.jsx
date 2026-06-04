import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './assets/settings.css'
import { MemoryRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
        <MemoryRouter>
            <App />
        </MemoryRouter>
    </StrictMode>
)