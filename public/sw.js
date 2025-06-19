
const CACHE_NAME = 'filial96-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/220efd77-c866-404d-97db-eb83999f4e52.png'
];

// Instalar o service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('Service Worker: Cache aberto');
      await cache.addAll(STATIC_CACHE_URLS);
    })()
  );
  self.skipWaiting();
});

// Ativar o service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })()
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // Tentar atualizar em background
          fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
          }).catch(() => {});
          
          return cachedResponse;
        }
        
        const response = await fetch(event.request);
        
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        console.error('Service Worker: Erro no fetch:', error);
        
        // Fallback para página offline básica
        if (event.request.destination === 'document') {
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Filial 96 - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    text-align: center; 
                    padding: 2rem; 
                    background: #f8fafc;
                    color: #1e293b;
                  }
                  .logo { width: 120px; height: 120px; margin: 2rem auto; }
                  h1 { color: #22c55e; margin: 1rem 0; }
                  p { color: #64748b; margin: 0.5rem 0; }
                </style>
              </head>
              <body>
                <img src="/lovable-uploads/220efd77-c866-404d-97db-eb83999f4e52.png" alt="Filial 96" class="logo">
                <h1>Filial 96</h1>
                <p>Você está offline</p>
                <p>Verifique sua conexão com a internet</p>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        throw error;
      }
    })()
  );
});
