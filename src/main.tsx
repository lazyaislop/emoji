import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { readUiLanguage } from './features/github-emojis/model/localization'

const initialLanguage = readUiLanguage()
document.documentElement.lang = initialLanguage
document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.error('Service worker registration failed:', error)
    })
  })
}
