// Low-level storage helpers: localStorage keys and IndexedDB persistence
function getStorageKey(baseKey) {
    return testMode ? `test_${baseKey}` : baseKey;
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PTTrackerDB', 1);
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('appData')) {
                db.createObjectStore('appData');
            }
        };
        request.onsuccess = function(e) {
            resolve(e.target.result);
        };
        request.onerror = function(e) {
            reject(e.target.error || e.target);
        };
    });
}

async function loadFromIndexedDB() {
    if (!('indexedDB' in window)) return null;
    const storageKey = testMode ? 'testData' : 'current';
    try {
        const db = await openDatabase();
        const tx = db.transaction('appData', 'readonly');
        const store = tx.objectStore('appData');
        const data = await new Promise((resolve, reject) => {
            const request = store.get(storageKey);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return data || null;
    } catch (err) {
        console.log('IndexedDB load failed', err);
        return null;
    }
}

async function persistToIndexedDB() {
    if (!('indexedDB' in window)) return;
    const storageKey = testMode ? 'testData' : 'current';
    try {
        const db = await openDatabase();
        const tx = db.transaction('appData', 'readwrite');
        const store = tx.objectStore('appData');
        const data = {
            exercises,
            dailyLogs,
            swellingLogs,
            milestones,
            unlockedBadges,
            savedAt: new Date().toISOString()
        };
        store.put(data, storageKey);
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (err) {
        console.log('IndexedDB persist failed', err);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getStorageKey, openDatabase, loadFromIndexedDB, persistToIndexedDB };
}
