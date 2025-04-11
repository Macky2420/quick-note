import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { auth, db } from '../database/firebaseConfig';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { openDB } from 'idb';

const { TextArea } = Input;

const NewNote = ({ noteModalVisible, setNoteModalVisible }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const initIndexedDB = () => openDB('offline-notes', 2);

  const validateInputs = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNote = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const user = auth.currentUser;

    try {
      if (!user) throw new Error('User not authenticated');

      if (navigator.onLine) {
        const newNoteRef = push(ref(db, `users/${user.uid}/notes`));
        await set(newNoteRef, {
          title,
          content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        messageApi.success('Note created successfully!');
      } else {
        const db = await initIndexedDB();
        await db.put('notes', {
          id: `local_${Date.now()}`,
          title,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        messageApi.warning('Saved locally');
      }
      resetForm();
    } catch (error) {
      messageApi.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setErrors({});
    setNoteModalVisible(false);
  };

  return (
    <Modal
      title="Create New Note"
      open={noteModalVisible}
      onCancel={resetForm}
      centered
      footer={null}
      className="rounded-lg backdrop-blur-md"
    >
      {contextHolder}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      )}

      <div className="flex flex-col space-y-6 mt-4">
        <div className="relative border-gray">
          <input
            type="text"
            className={`block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border ${
              errors.title ? "border-red-500" : "border-gray-200"
            } appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer`}
            placeholder=" "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
            Note Title
          </label>
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="relative border-gray">
          <TextArea
            rows={6}
            className={`block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer`}
            placeholder=" "
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
            Note Content
          </label>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={resetForm}
            className="h-10 px-6 font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleAddNote}
            className="h-10 px-6 font-semibold text-white bg-gradient-to-tl from-violet-600 to-blue-600 shadow-lg rounded-lg hover:from-violet-700 hover:to-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Note'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewNote;