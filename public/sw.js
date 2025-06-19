
const CACHE_NAME = 'filial96-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/c1732df3-8011-4da6-b0e5-c89f9ebf9bf1.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Arquivos estáticos em cache');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erro na instalação', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado e controlando todas as páginas');
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Apenas processar requisições HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }

        // Clona a requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Verifica se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              // Cache apenas recursos específicos
              if (event.request.url.includes('/lovable-uploads/') ||
                  event.request.url.includes('.css') ||
                  event.request.url.includes('.js') ||
                  event.request.url.includes('.png') ||
                  event.request.url.includes('.jpg') ||
                  event.request.url.includes('.jpeg') ||
                  event.request.url.includes('.svg')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Fallback para páginas offline
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync em background
self.addEventListener('sync', event => {
  console.log('Service Worker: Sync em background', event.tag);
});

// Notificações push (preparado para futuro uso)
self.addEventListener('push', event => {
  console.log('Service Worker: Push recebido', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/lovable-uploads/c1732df3-8011-4da6-b0e5-c89f9ebf9bf1.png',
    badge: '/lovable-uploads/c1732df3-8011-4da6-b0e5-c89f9ebf9bf1.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/lovable-uploads/c1732df3-8011-4da6-b0e5-c89f9ebf9bf1.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Filial 96', options)
  );
});

// Click nas notificações
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notificação clicada', event);
  
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
