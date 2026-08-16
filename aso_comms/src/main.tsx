import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // ← This line is now valid because index.css exists

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)