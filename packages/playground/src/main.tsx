import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { PlaygroundProvider } from './context/PlaygroundContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PlaygroundProvider>
      <App />
    </PlaygroundProvider>
  </React.StrictMode>,
)

