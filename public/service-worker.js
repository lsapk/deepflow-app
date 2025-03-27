
const CACHE_NAME = 'deepflow-cache-v2';
const DYNAMIC_CACHE = 'deepflow-dynamic-v1';
const OFFLINE_DB_NAME = 'deepflow-offline-db';
const OFFLINE_STORE_NAME = 'offlineActions';

const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/signin',
  '/signup',
  '/dashboard',
  '/tasks',
  '/habits',
  '/focus',
  '/journal',
  '/planning',
  '/assets/'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request is an API call
const isApiRequest = (url) => {
  return url.includes('/rest/v1/') || 
         url.includes('/auth/v1/') || 
         url.includes('/storage/v1/');
};

// Helper to open IndexedDB
const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject('IndexedDB error: ' + event.target.errorCode);
  });
};

// Save failed API request for later sync
const saveOfflineAction = async (request, requestClone) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(OFFLINE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OFFLINE_STORE_NAME);
    
    // Clone the request and extract its data
    const url = requestClone.url;
    const method = requestClone.method;
    let body = null;
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await requestClone.json();
      } catch (err) {
        console.error('Error extracting request body:', err);
      }
    }
    
    // Store the request for later
    store.add({
      url,
      method,
      body,
      timestamp: Date.now()
    });
    
    return transaction.complete;
  } catch (err) {
    console.error('Error saving offline action:', err);
  }
};

// Sync offline requests when back online
const syncOfflineActions = async () => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(OFFLINE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OFFLINE_STORE_NAME);
    const actions = await store.getAll();
    
    console.log(`Found ${actions.length} offline actions to sync`);
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: action.body ? JSON.stringify(action.body) : undefined
        });
        
        if (response.ok) {
          // If successful, remove from offline store
          store.delete(action.id);
          console.log(`Successfully synced offline action: ${action.id}`);
        }
      } catch (err) {
        console.error(`Failed to sync offline action ${action.id}:`, err);
      }
    }
    
    return transaction.complete;
  } catch (err) {
    console.error('Error syncing offline actions:', err);
  }
};

// Listen for online event to sync
self.addEventListener('online', () => {
  console.log('Back online, syncing offline actions...');
  syncOfflineActions();
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('supabase.co')) {
    return;
  }
  
  // Handle API requests differently
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          // Cache successful GET responses
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(err => {
          console.log('Fetch failed for API request:', err);
          
          // For GET requests, try to return from cache
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          } 
          // For mutation requests, save for later sync
          else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method)) {
            saveOfflineAction(event.request, event.request.clone());
            
            // Return a mock successful response
            return new Response(JSON.stringify({ 
              success: true, 
              offlineQueued: true,
              message: 'Action enregistrée et sera synchronisée quand vous serez en ligne'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        })
    );
  } 
  // Handle non-API requests with cache-first strategy
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // Clone the request
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest)
            .then(response => {
              // Check if valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              // Add response to cache
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(err => {
              console.log('Fetch failed; returning offline page instead.', err);
              
              // If HTML request failed, return the offline page
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/');
              }
            });
        })
    );
  }
});

// Periodically attempt to sync offline actions (every 5 minutes when the app is active)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'APP_ACTIVE') {
    // App is active, check if we need to sync
    syncOfflineActions();
  }
});
