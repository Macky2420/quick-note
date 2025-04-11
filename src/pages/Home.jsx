import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Popconfirm, FloatButton, Button, message } from 'antd';
import { DeleteOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { auth, db } from '../database/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, off, remove, set, get, push, serverTimestamp } from 'firebase/database';
import { Link } from 'react-router-dom';
import { openDB } from 'idb';
import NewNote from '../components/NewNote';
import noteIcon from '../assets/note.svg';

const Home = () => {
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // Initialize IndexedDB
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

  // Sync offline data with Firebase
  const syncOfflineData = async (userId) => {
    const db = await initIndexedDB();
    const tx = db.transaction(['pendingNotes', 'pendingDeletions'], 'readwrite');
    
    // Sync pending notes
    const pendingNotes = await tx.objectStore('pendingNotes').getAll();
    for (const note of pendingNotes) {
      try {
        const newNoteRef = push(ref(db, `users/${userId}/notes`));
        await set(newNoteRef, {
          ...note,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await tx.objectStore('pendingNotes').delete(note.id);
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
      
      // Hybrid data loader
      const loadData = async (snapshot) => {
        try {
          let notesData = snapshot?.val();
          
          // 1. Get online data if available
          const onlineNotes = notesData ? Object.entries(notesData) : [];
  
          // 2. Get offline notes from IndexedDB
          const offlineDB = await initIndexedDB();
          const localNotes = await offlineDB.getAll('notes');
          
          // 3. Merge both sources
          const mergedNotes = [
            ...onlineNotes.map(([id, note]) => ({ id, ...note })),
            ...localNotes
          ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  
          setNotes(mergedNotes);
          setLoading(false);
  
        } catch (error) {
          messageApi.error(`Error loading notes: ${error.message}`);
          setLoading(false);
        }
      };
  
      const unsubscribe = onValue(notesRef, loadData);
      
      // Initial load for offline case
      if (!navigator.onLine) {
        get(notesRef).then(loadData).catch(() => loadData(null));
      }
  
      // Online sync handler
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
  }, []);

  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      if (navigator.onLine) {
        await remove(ref(db, `users/${user.uid}/notes/${id}`));
        messageApi.success('Note deleted successfully!');
      } else {
        const db = await initIndexedDB();
        await db.put('pendingDeletions', { id });
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
                    <Link to={`/notes/${note.id}`}>
                      <Card className="hover:shadow-xl transition-shadow duration-300 h-full group" hoverable>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 flex-1">
                            <img src={noteIcon} alt="note" className="w-12 h-12 p-2 bg-blue-50 rounded-lg" />
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800 break-words">
                                {note.title}
                              </span>
                            </div>
                          </div>
                          <Popconfirm
                            title="Delete this note?"
                            onConfirm={() => handleDelete(note.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <Button 
                              type="text"
                              icon={<DeleteOutlined className="text-red-500 hover:text-red-700" />}
                              className="hover:bg-gray-100 rounded-lg ml-4"
                            />
                          </Popconfirm>
                        </div>
                      </Card>
                    </Link>
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