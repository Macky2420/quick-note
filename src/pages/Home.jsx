// Import the React 19 patch for Ant Design (this must be the first import)
import '@ant-design/v5-patch-for-react-19';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Popconfirm, FloatButton, Button, message } from 'antd';
import { DeleteOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { auth, db } from '../database/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, off, remove, set, get, push, serverTimestamp } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { openDB } from 'idb';
import NewNote from '../components/NewNote';
import noteIcon from '../assets/note.svg';

const Home = () => {
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const initIndexedDB = async () => {
    return openDB('offline-notes', 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pendingDeletions')) {
          db.createObjectStore('pendingDeletions', { keyPath: 'id' });
        }
      },
    });
  };

  const syncOfflineData = async (userId) => {
    const idb = await initIndexedDB();
    const tx = idb.transaction(['notes', 'pendingDeletions'], 'readwrite');
    
    // Sync local notes needing sync
    const notesToSync = await tx.objectStore('notes').getAll();
    for (const note of notesToSync.filter(n => n.needsSync)) {
      try {
        const newNoteRef = push(ref(db, `users/${userId}/notes`));
        await set(newNoteRef, {
          ...note,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await tx.objectStore('notes').delete(note.id);
      } catch (error) {
        messageApi.error(`Sync failed: ${error.message}`);
      }
    }

    // Sync pending deletions
    const pendingDeletions = await tx.objectStore('pendingDeletions').getAll();
    for (const { id } of pendingDeletions) {
      try {
        await remove(ref(db, `users/${userId}/notes/${id}`));
        await tx.objectStore('pendingDeletions').delete(id);
      } catch (error) {
        messageApi.error(`Sync failed: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const notesRef = ref(db, `users/${user.uid}/notes`);
      
      const unsubscribe = onValue(notesRef, async (snapshot) => {
        try {
          const idb = await initIndexedDB();
          const [firebaseNotes, localNotes] = await Promise.all([
            new Promise(resolve => {
              const notesData = snapshot.val();
              resolve(notesData ? Object.entries(notesData).map(([id, note]) => ({ id, ...note })) : []);
            }),
            idb.getAll('notes')
          ]);

          // Merge notes with local ones taking priority
          const mergedNotes = [
            ...firebaseNotes,
            ...localNotes.filter(n => n.id.startsWith('local_'))
          ].reduce((acc, note) => {
            if (!acc.find(n => n.id === note.id)) acc.push(note);
            return acc;
          }, []);

          // Update IndexedDB with latest Firebase notes
          const tx = idb.transaction('notes', 'readwrite');
          await Promise.all([
            ...firebaseNotes.map(note => tx.store.put(note)),
            tx.done
          ]);

          setNotes(mergedNotes);
        } catch (error) {
          messageApi.error(`Error loading notes: ${error.message}`);
        } finally {
          setLoading(false);
        }
      });

      // Initial load for offline case
      if (!navigator.onLine) {
        const idb = await initIndexedDB();
        const localNotes = await idb.getAll('notes');
        setNotes(localNotes);
        setLoading(false);
      }

      const handleOnline = async () => {
        await syncOfflineData(user.uid);
        messageApi.success('Changes synced!');
      };

      window.addEventListener('online', handleOnline);
      return () => {
        off(notesRef, unsubscribe);
        window.removeEventListener('online', handleOnline);
      };
    });

    return () => authUnsubscribe();
  }, [messageApi]);

  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      if (navigator.onLine) {
        await remove(ref(db, `users/${user.uid}/notes/${id}`));
        messageApi.success('Note deleted successfully!');
      } else {
        const idb = await initIndexedDB();
        await idb.put('pendingDeletions', { id });
        messageApi.warning('Deletion queued. Will sync when online.');
      }
    } catch (error) {
      messageApi.error(`Error: ${error.message}`);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        <Card 
          title={
            <Space className="flex items-center">
              <FileTextOutlined className="text-blue-500" />
              <span className="text-lg font-semibold">My Notes</span>
            </Space>
          }
          variant={false}
          className="shadow-lg rounded-xl flex-1"
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {notes.length === 0 ? (
                <div className="w-full text-center py-8 text-gray-500">
                  No notes found. Click the + button to create a new note.
                </div>
              ) : (
                notes.map((note) => (
                  <Col key={note.id} xs={24} sm={12} md={12} lg={8}>
                    <Card
                      className="hover:shadow-xl transition-shadow duration-300 h-full group relative"
                      hoverable
                    >
                      {/* Click overlay for navigation */}
                      <div 
                        className="absolute inset-0 z-10 cursor-pointer" 
                        onClick={() => navigate(`/notes/${note.id}`)}
                      />
                      
                      <div className="flex justify-between items-center relative">
                        <div className="flex items-center gap-4 flex-1">
                          <img 
                            src={noteIcon} 
                            alt="note" 
                            className="w-12 h-12 p-2 bg-blue-50 rounded-lg" 
                          />
                          <span className="font-medium text-gray-800 break-words">
                            {note.title}
                          </span>
                        </div>
                        
                        <Popconfirm
                          title="Delete this note?"
                          onConfirm={(e) => {
                            e.preventDefault();
                            handleDelete(note.id);
                          }}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button 
                            type="text"
                            icon={<DeleteOutlined className="text-red-500 hover:text-red-700" />}
                            className="hover:bg-gray-100 rounded-lg ml-4 z-20 relative"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          />
                        </Popconfirm>
                      </div>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}

          <FloatButton
            icon={<PlusOutlined />}
            type="primary"
            tooltip="Add new note"
            onClick={() => setNoteModalVisible(true)}
            style={{ right: 24, bottom: 80 }}
            className="fixed sm:bottom-24"
          />
        </Card>
      </div>
      
      <NewNote
        noteModalVisible={noteModalVisible}
        setNoteModalVisible={setNoteModalVisible}
      />
    </>
  );
};

export default Home;
