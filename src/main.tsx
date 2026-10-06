import { motion } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// motion v14 has motion.config for reducedMotion but TS types don't expose it
const motionWithConfig = motion as any
motionWithConfig.config.reducedMotion = 'user'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
