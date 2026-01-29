import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// CAMBIO: Importar HashRouter en lugar de BrowserRouter
import { HashRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Usamos HashRouter para que GitHub Pages no se rompa */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
