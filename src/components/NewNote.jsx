import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { auth, db } from '../database/firebaseConfig';
import { ref, push, set, serverTimestamp } from 'firebase/database';

const { TextArea } = Input;

const NewNote = ({ noteModalVisible, setNoteModalVisible }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (values) => {
    setLoading(true);
    const user = auth.currentUser;

    try {
      if (!user) throw new Error('User not authenticated');

      const newNoteRef = push(ref(db, `users/${user.uid}/notes`));
      await set(newNoteRef, {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      message.success('Note created successfully!');
      form.resetFields();
      setNoteModalVisible(false);
      
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={noteModalVisible}
      onCancel={() => {
        form.resetFields();
        setNoteModalVisible(false);
      }}
      centered
      footer={null}
      className="rounded-lg backdrop-blur-md"
      width="90%"
      styles={{ body: { padding: '24px' } }}
      destroyOnClose
    >
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          New Note
        </h1>
        <p className="text-gray-500 mt-2">Capture your thoughts instantly</p>
      </div>

      <Form
        form={form}
        name="new-note"
        onFinish={handleAddNote}
        layout="vertical"
        className="w-full"
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { max: 100, message: 'Title too long (max 100 characters)' }
          ]}
          // Add label alignment and colon customization
          labelCol={{ span: 24 }}
          labelAlign="left"
          colon={false}
        >
          <Input
            placeholder="Enter note title"
            className="rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 h-12"
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[
            { required: true, message: 'Please enter some content' },
            { max: 2000, message: 'Content too long (max 2000 characters)' }
          ]}
          labelCol={{ span: 24 }}
          labelAlign="left"
          colon={false}
        >
          <TextArea
            rows={4}
            placeholder="Start typing your note..."
            className="rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500"
            autoSize={{ minRows: 4, maxRows: 8 }}
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            onClick={() => {
              form.resetFields();
              setNoteModalVisible(false);
            }}
            className="h-12 px-6 font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-12 px-6 font-semibold text-lg bg-gradient-to-tr from-blue-700 to-green-600 border-transparent hover:shadow-lg hover:shadow-blue-700/30 transition-all w-full sm:w-auto"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default NewNote;