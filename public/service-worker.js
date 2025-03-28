
// Name our cache
const CACHE_NAME = 'deepflow-cache-v1';

// Add list of files to cache here.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg'
];

// OpenDB function to handle IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('deepflowDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores for different data types if they don't exist
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('journal')) {
        db.createObjectStore('journal', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('planning')) {
        db.createObjectStore('planning', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Save data to IndexedDB
async function saveToIndexedDB(storeName, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    if (Array.isArray(data)) {
      // If it's an array, add each item
      const promises = data.map(item => {
        return new Promise((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
      await Promise.all(promises);
    } else {
      // If it's a single item
      await new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    return false;
  }
}

// Get data from IndexedDB
async function getFromIndexedDB(storeName) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting from IndexedDB:', error);
    return [];
  }
}

// Queue items for syncing when online
async function addToSyncQueue(operation) {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    
    await new Promise((resolve, reject) => {
      const request = store.add({
        ...operation,
        timestamp: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    return true;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    return false;
  }
}

// Process the sync queue
async function processSyncQueue() {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    
    const items = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (items.length === 0) return;
    
    console.log(`Processing ${items.length} items in sync queue`);
    
    // Process items (in a real app, this would send to your server)
    // For now, we'll just clear the queue
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    return true;
  } catch (error) {
    console.error('Error processing sync queue:', error);
    return false;
  }
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event 
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Supabase API requests
  if (event.request.url.includes('supabase.co')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, return a custom offline page
        // or fallback content
        return new Response('You are offline. Please check your connection.');
      })
  );
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'APP_ACTIVE') {
    // App is active, try to process the sync queue
    if (navigator.onLine) {
      processSyncQueue();
    }
  }
  
  if (event.data.type === 'SAVE_DATA') {
    // Save data to IndexedDB
    const { storeName, data } = event.data;
    saveToIndexedDB(storeName, data).then(success => {
      if (success) {
        // Queue for sync when online
        if (navigator.onLine) {
          processSyncQueue();
        } else {
          addToSyncQueue({ 
            type: 'SAVE', 
            storeName, 
            data 
          });
        }
      }
    });
  }
  
  if (event.data.type === 'GET_DATA') {
    // Retrieve data from IndexedDB
    const { storeName, clientId } = event.data;
    getFromIndexedDB(storeName).then(data => {
      // Send the data back to the client
      self.clients.get(clientId).then(client => {
        client.postMessage({
          type: 'DATA_RESPONSE',
          storeName,
          data
        });
      });
    });
  }
});

// Sync event - triggered when the browser regains connectivity
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(processSyncQueue());
  }
});
