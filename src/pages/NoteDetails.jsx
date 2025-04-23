import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, message, Skeleton } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { auth, db } from '../database/firebaseConfig';
import { ref, get, update, serverTimestamp } from 'firebase/database';

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

        const snapshot = await get(ref(db, `users/${user.uid}/notes/${noteId}`));
        if (snapshot.exists()) {
          const firebaseNote = { id: noteId, ...snapshot.val() };
          setNote(firebaseNote);
          setTitle(firebaseNote.title);
          setContent(firebaseNote.content);
        } else {
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
  }, [noteId, messageApi, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      await update(ref(db, `users/${user.uid}/notes/${noteId}`), {
        title,
        content,
        updatedAt: serverTimestamp()
      });

      messageApi.success('Changes saved successfully');
      setNote(prev => ({ ...prev, title, content }));
    } catch (error) {
      messageApi.error(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      {contextHolder}
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/home/${userId}`)}
          className="flex items-center border-gray-300 hover:border-blue-500 text-gray-700"
        >
          Back
        </Button>
        
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
          className="h-10 px-6 font-semibold bg-gradient-to-tr from-blue-700 to-green-600 border-transparent hover:shadow-lg hover:shadow-blue-700/30 transition-all"
        >
          Save Changes
        </Button>
      </div>

      {/* Note Content Section */}
      <div className="space-y-8">
        {/* Title Input */}
        <div className="relative">
          <Input
            placeholder=" "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block px-4 pb-2 pt-6 w-full bg-white text-2xl font-bold text-gray-800 rounded-lg border border-gray-300 hover:border-blue-500 focus:border-blue-500 peer"
            id="note-title"
          />
        </div>
        
        {/* Content Textarea */}
        <div className="relative">
          <TextArea
            placeholder=" "
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="block px-4 pb-2 pt-6 w-full bg-white text-base text-gray-700 rounded-lg border border-gray-300 hover:border-blue-500 focus:border-blue-500 peer"
            autoSize={{ minRows: 15, maxRows: 25 }}
            id="note-content"
          />
        </div>
      </div>

      {/* Mobile Save Button */}
      <div className="sm:hidden fixed bottom-6 right-6">
        <Button
          type="primary"
          shape="circle"
          icon={<SaveOutlined className="text-lg" />}
          onClick={handleSave}
          loading={saving}
          className="h-14 w-14 font-semibold bg-gradient-to-tr from-blue-700 to-green-600 border-transparent shadow-lg hover:shadow-blue-700/30"
        />
      </div>
    </div>
  );
};

export default NoteDetail;