import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("Main.jsx is loading...");

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.style.minHeight = '100vh';
  console.log("Root element found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
