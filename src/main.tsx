import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 Nova versão disponível!')
    
    // Criar toast de update
    const toastContainer = document.getElementById('pwa-toast')
    if (toastContainer) {
      toastContainer.style.display = 'block'
      toastContainer.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: #22c55e;
          color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div>
            <strong>Nova versão disponível!</strong><br>
            <small>Clique em "Atualizar" para obter a versão mais recente.</small>
          </div>
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="document.getElementById('pwa-toast').style.display='none'"
              style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              "
            >
              Depois
            </button>
            <button 
              id="pwa-update-btn"
              style="
                background: white;
                border: none;
                color: #22c55e;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
              "
            >
              Atualizar
            </button>
          </div>
        </div>
      `
      
      // Adicionar evento de click para atualizar
      const updateBtn = document.getElementById('pwa-update-btn')
      if (updateBtn) {
        updateBtn.addEventListener('click', () => {
          updateSW(true)
        })
      }
    }
  },
  onOfflineReady() {
    console.log('🔄 App pronto para funcionar offline!')
    
    // Opcional: Mostrar notificação de offline ready
    const toastContainer = document.getElementById('pwa-toast')
    if (toastContainer) {
      toastContainer.style.display = 'block'
      toastContainer.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: #16a34a;
          color: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div>
            <strong>App instalado com sucesso!</strong><br>
            <small>Agora você pode usar o Filial 96 mesmo offline.</small>
          </div>
          <button 
            onclick="document.getElementById('pwa-toast').style.display='none'"
            style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            "
          >
            OK
          </button>
        </div>
      `
      
      // Auto-hide após 5 segundos
      setTimeout(() => {
        if (toastContainer) {
          toastContainer.style.display = 'none'
        }
      }, 5000)
    }
  },
  onRegisterError(error) {
    console.error('❌ Erro ao registrar Service Worker:', error)
  }
})

createRoot(document.getElementById("root")!).render(
  <App />
);
