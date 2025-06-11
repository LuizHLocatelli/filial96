import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importar funções de teste para debug no console
import './utils/testDeleteAccount'

createRoot(document.getElementById("root")!).render(
  <App />
);
