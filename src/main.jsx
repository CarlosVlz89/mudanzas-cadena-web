import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // <--- CAMBIO AQUÍ
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter> {/* <--- CAMBIO AQUÍ */}
      <App />
    </HashRouter>
  </React.StrictMode>,
)
