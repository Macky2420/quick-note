import { Modal, Form, Input, Button, Checkbox, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ loginModalVisible, setLoginModalVisible }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      message.success('Login successful!');
      setLoginModalVisible(false);
      form.resetFields();
      navigate(`/home/${user.uid}`);
      
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      switch(error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Try again later';
          break;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLogin = () => {
    setLoginModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Modal
      open={loginModalVisible}
      onCancel={handleCloseLogin}
      centered
      footer={null}
      className="backdrop-blur-md"
      destroyOnClose
    >
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-500 mt-2">Continue to QuickNote</p>
      </div>

      <Form
        form={form}
        name="login"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email format' }
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

        <Form.Item>
          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600">Remember me</Checkbox>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="h-12 font-semibold text-lg bg-gradient-to-tr from-blue-700 to-green-600 border-transparent hover:shadow-lg hover:shadow-blue-700/30 transition-all"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    </>
    
  );
};

export default LoginModal;