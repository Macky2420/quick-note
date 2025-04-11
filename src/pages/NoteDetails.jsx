import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { auth, db } from '../database/firebaseConfig';
import { ref, get, update, serverTimestamp } from 'firebase/database';
import { openDB } from 'idb';

const { TextArea } = Input;

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // Initialize IndexedDB with notes store
  const initIndexedDB = async () => {
    return openDB('offline-notes', 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
      },
    });
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        const db = await initIndexedDB();
        let noteFound = false;

        // Check IndexedDB first
        const localNote = await db.get('notes', noteId);
        if (localNote) {
          setNote(localNote);
          setTitle(localNote.title);
          setContent(localNote.content);
          noteFound = true;
        }

        // Check Firebase if online
        if (navigator.onLine) {
          const snapshot = await get(ref(db, `users/${user.uid}/notes/${noteId}`));
          if (snapshot.exists()) {
            const firebaseNote = {
              id: noteId,
              ...snapshot.val(),
              updatedAt: snapshot.val().updatedAt || Date.now()
            };
            
            // Update local cache with Firebase data
            await db.put('notes', firebaseNote);
            
            // Only update state if Firebase data is newer
            if (!noteFound || firebaseNote.updatedAt > (localNote?.updatedAt || 0)) {
              setNote(firebaseNote);
              setTitle(firebaseNote.title);
              setContent(firebaseNote.content);
            }
            noteFound = true;
          }
        }

        if (!noteFound) {
          throw new Error('Note not found');
        }
      } catch (error) {
        messageApi.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, messageApi]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const db = await initIndexedDB();
      const updatedNote = {
        id: noteId,
        title,
        content,
        updatedAt: navigator.onLine ? serverTimestamp() : Date.now(),
        needsSync: !navigator.onLine
      };

      // Update local cache immediately
      await db.put('notes', updatedNote);
      setNote(updatedNote);

      if (navigator.onLine) {
        await update(ref(db, `users/${user.uid}/notes/${noteId}`), {
          title,
          content,
          updatedAt: serverTimestamp()
        });
        messageApi.success('Note updated successfully!');
      } else {
        messageApi.warning('Changes saved locally');
      }
    } catch (error) {
      messageApi.error(`Error saving note: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-8 text-gray-500">
        Note not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {contextHolder}
      <div className="flex justify-between items-center mb-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/home')}
          className="flex items-center"
        >
          Back
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Save
        </Button>
      </div>
      
      <div className="space-y-6">
        <Input
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-semibold"
        />
        
        <TextArea
          rows={15}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="text-base"
        />
      </div>
    </div>
  );
};

export default NoteDetail;