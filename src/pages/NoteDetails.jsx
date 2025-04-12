import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { auth, db } from '../database/firebaseConfig';
import { ref, get, update, serverTimestamp } from 'firebase/database';
import { initIndexedDB } from '../utils/db'; // Assume shared DB util

const { TextArea } = Input;

const NoteDetail = () => {
  const { noteId, userId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadNote = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          messageApi.error('Authentication required');
          return navigate('/login');
        }

        const dbInstance = await initIndexedDB();
        const isLocalNote = noteId.startsWith('local_');
        
        // Try to load from local DB first
        const localNote = await dbInstance.get('notes', noteId);
        if (localNote) {
          setNoteState(localNote);
        }

        // Fetch from Firebase if online and not local note
        if (!isLocalNote && navigator.onLine) {
          const snapshot = await get(ref(db, `users/${user.uid}/notes/${noteId}`));
          if (snapshot.exists()) {
            const firebaseNote = { id: noteId, ...snapshot.val() };
            await dbInstance.put('notes', firebaseNote);
            setNoteState(firebaseNote);
          }
        }

        if (!localNote && !(isLocalNote || snapshot?.exists())) {
          messageApi.error('Note not found');
          navigate('/');
        }
      } catch (error) {
        messageApi.error(`Failed to load note: ${error.message}`);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const authUnsubscribe = auth.onAuthStateChanged(user => {
      if (user) loadNote();
      else navigate('/login');
    });

    return () => authUnsubscribe();
  }, [noteId]);

  const setNoteState = (noteData) => {
    setNote(noteData);
    setTitle(noteData.title);
    setContent(noteData.content);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      const dbInstance = await initIndexedDB();
      const isLocalNote = noteId.startsWith('local_');
      const now = navigator.onLine ? serverTimestamp() : Date.now();

      const updatedNote = {
        ...note,
        id: noteId,
        title,
        content,
        updatedAt: now,
        needsSync: isLocalNote || !navigator.onLine
      };

      // Update local DB
      await dbInstance.put('notes', updatedNote);
      
      // Sync with Firebase if online
      if (navigator.onLine) {
        if (isLocalNote) {
          const newNoteRef = push(ref(db, `users/${user.uid}/notes`));
          await set(newNoteRef, { ...updatedNote, id: newNoteRef.key });
          await dbInstance.delete('notes', noteId);
          navigate(`/notes/${newNoteRef.key}`);
        } else {
          await update(ref(db, `users/${user.uid}/notes/${noteId}`), {
            title,
            content,
            updatedAt: serverTimestamp()
          });
        }
        messageApi.success('Changes saved successfully');
      } else {
        messageApi.warning('Changes saved locally - will sync when online');
      }

      setNote(updatedNote);
    } catch (error) {
      messageApi.error(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {contextHolder}
      <div className="flex justify-between items-center mb-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/home/${userId}`)}
          className="flex items-center"
        >
          Back
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
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