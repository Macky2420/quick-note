import { openDB } from 'idb';

export const initIndexedDB = () => openDB('offline-notes', 3, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('notes')) {
      db.createObjectStore('notes', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('pendingDeletions')) {
      db.createObjectStore('pendingDeletions', { keyPath: 'id' });
    }
  },
});