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
    const request = indexedDB.open(OFFLINE_DB_NAME, 2);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      
      const dataStores = ['journal', 'tasks', 'habits', 'analytics', 'focus'];
      dataStores.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject('IndexedDB error: ' + event.target.errorCode);
  });
};

// Save data to local IndexedDB
const saveLocalData = async (storeName, data) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        store.put(item);
      });
    } else {
      store.put(data);
    }
    
    return transaction.complete;
  } catch (err) {
    console.error(`Error saving ${storeName} data locally:`, err);
  }
};

// Retrieve data from local IndexedDB
const getLocalData = async (storeName, id = null) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    
    if (id) {
      return store.get(id);
    } else {
      return store.getAll();
    }
  } catch (err) {
    console.error(`Error retrieving ${storeName} data locally:`, err);
    return id ? null : [];
  }
};

// Save failed API request for later sync
const saveOfflineAction = async (request, requestClone) => {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(OFFLINE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OFFLINE_STORE_NAME);
    
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

// Improved response caching function to store responses in IndexedDB
const cacheResponse = async (request, response, dynamicCache) => {
  try {
    const responseClone = response.clone();
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    const cache = await caches.open(dynamicCache);
    await cache.put(request, responseClone.clone());
    
    if (request.method === 'GET' && isApiRequest(request.url)) {
      try {
        const data = await responseClone.json();
        
        if (path.includes('/habits')) {
          await saveLocalData('habits', data);
        } else if (path.includes('/journal')) {
          await saveLocalData('journal', data);
        } else if (path.includes('/tasks')) {
          await saveLocalData('tasks', data);
        } else if (path.includes('/analytics')) {
          await saveLocalData('analytics', data);
        } else if (path.includes('/focus')) {
          await saveLocalData('focus', data);
        }
      } catch (err) {
        console.error('Error processing response data for local storage:', err);
      }
    }
  } catch (err) {
    console.error('Error caching response:', err);
  }
};

// Intercept fetch requests with improved data persistence
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('supabase.co')) {
    return;
  }
  
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          if (response.status === 200) {
            cacheResponse(event.request, response, DYNAMIC_CACHE);
          }
          return response;
        })
        .catch(err => {
          console.log('Fetch failed for API request:', err);
          
          if (event.request.method === 'GET') {
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                } else {
                  const url = new URL(event.request.url);
                  const path = url.pathname;
                  
                  let storeName = null;
                  if (path.includes('/habits')) {
                    storeName = 'habits';
                  } else if (path.includes('/journal')) {
                    storeName = 'journal';
                  } else if (path.includes('/tasks')) {
                    storeName = 'tasks';
                  } else if (path.includes('/analytics')) {
                    storeName = 'analytics';
                  } else if (path.includes('/focus')) {
                    storeName = 'focus';
                  }
                  
                  if (storeName) {
                    return getLocalData(storeName)
                      .then(data => {
                        if (data && data.length > 0) {
                          return new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                          });
                        }
                        throw new Error('No local data available');
                      });
                  }
                  throw new Error('No cached response available');
                }
              });
          } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method)) {
            saveOfflineAction(event.request, event.request.clone());
            
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
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(err => {
              console.log('Fetch failed; returning offline page instead.', err);
              
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
    syncOfflineActions();
  }
});
