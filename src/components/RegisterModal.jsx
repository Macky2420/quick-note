import { Modal, message, Form, Input, Button, Checkbox } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { auth, db } from "../database/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

const RegisterModal = ({ registerModalVisible, setRegisterModalVisible }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const validateEmailUnique = async (_, value) => {
    if (!value) return Promise.resolve();
    
    const emailRef = ref(db, `users`);
    const snapshot = await get(emailRef);
    if (snapshot.exists() && Object.values(snapshot.val()).some(user => user.email === value)) {
      return Promise.reject(new Error('Email already exists'));
    }
    
    return Promise.resolve();
  };

  const handleRegistration = async (values) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await set(ref(db, `users/${user.uid}`), { 
        fullName: values.fullName, 
        email: values.email 
      });
  
      // Show success message first
      message.success('Registration successful!');
  
      // Then close modal and navigate
      setRegisterModalVisible(false);
      form.resetFields();
      navigate(`/home/${user.uid}`);
  
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Check your connection';
          break;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={registerModalVisible}
      onCancel={() => setRegisterModalVisible(false)}
      centered
      footer={null}
      className="backdrop-blur-md"
      destroyOnClose
    >
      {contextHolder}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-gray-500 mt-2">Get started with QuickNote</p>
      </div>

      <Form
        form={form}
        name="register"
        onFinish={handleRegistration}
        initialValues={{ privacy: false }}
        scrollToFirstError
        layout="vertical"
      >
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, message: 'Please enter your full name' },
            { min: 5, message: 'Minimum 5 characters required' }
          ]}
        >
          <Input
            placeholder="John Doe"
            className="rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 h-12"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email format' },
            { validator: validateEmailUnique }
          ]}
        >
          <Input
            placeholder="john@example.com"
            className="rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 h-12"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 8, message: 'Minimum 8 characters required' }
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            iconRender={(visible) => visible ? 
              <EyeOutlined className="text-gray-400" /> : 
              <EyeInvisibleOutlined className="text-gray-400" />}
            className="rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500 h-12"
          />
        </Form.Item>

        <Form.Item
          name="privacy"
          valuePropName="checked"
          rules={[
            { 
              validator: (_, value) => value ? 
                Promise.resolve() : 
                Promise.reject(new Error('You must accept the privacy policy')) 
            }
          ]}
        >
          <Checkbox className="text-gray-600">
            I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a> and {' '}
            <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="h-12 font-semibold text-lg bg-gradient-to-tr from-blue-700 to-green-600 border-transparent hover:shadow-lg hover:shadow-blue-700/30 transition-all"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegisterModal;