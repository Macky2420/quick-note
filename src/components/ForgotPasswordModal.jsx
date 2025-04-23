import { Modal, Input, Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { auth } from "../database/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";

const ForgotPasswordModal = ({ forgotPasswordVisible, setForgotPasswordVisible }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      message.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      message.success("Password reset email sent! Check your inbox");
      setForgotPasswordVisible(false);
    } catch (error) {
      let errorMessage = "Error sending reset email";
      switch(error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email format";
          break;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={forgotPasswordVisible}
      onCancel={() => setForgotPasswordVisible(false)}
      centered
      footer={null}
      className="backdrop-blur-md"
      destroyOnClose
    >
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Reset Password
        </h1>
        <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
      </div>

      <div className="flex flex-col space-y-6">
        <Input
          placeholder="Email address"
          prefix={<MailOutlined className="text-gray-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-lg border-gray-300 hover:border-blue-500 focus:border-blue-500"
        />

        <Button
          type="primary"
          loading={loading}
          onClick={handleResetPassword}
          className="h-12 font-semibold text-lg bg-gradient-to-tr from-blue-700 to-green-600 border-transparent hover:shadow-lg hover:shadow-blue-700/30 transition-all"
        >
          Send Reset Link
        </Button>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;