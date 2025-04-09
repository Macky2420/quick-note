import { Modal } from "antd";
import React, { useState } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const InputField = ({ type, label, autoComplete, value, onChange, errorMessage, isPassword = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative border-gray">
      <input
        type={isPassword && !showPassword ? "password" : "text"}
        className={`block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border ${errorMessage ? "border-red-500" : "border-gray-200"} appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer`}
        placeholder=" "
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />
      <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
        {label}
      </label>

      {isPassword && (
        <div className="absolute right-3 top-3 cursor-pointer" onClick={togglePasswordVisibility}>
          {showPassword ? (
            <EyeInvisibleOutlined className="text-gray-500" />
          ) : (
            <EyeOutlined className="text-gray-500" />
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

const LoginModal = ({ loginModalVisible, setLoginModalVisible }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      if (!email) setEmailError("Email is required");
      if (!password) setPasswordError("Password is required");
      setLoading(false);
      return;
    }

    try {
      // Firebase Authentication - sign in with email and password
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);

      // Get the current user from Firebase
      const user = auth.currentUser;

      // After successful login, navigate to the home page with user UID
      setLoginModalVisible(false);
      setLoading(false);
      navigate(`/home/${user.uid}`); // Navigate to the home page with the user's UID
    } catch (error) {
      setLoading(false);
      if (error.code === "auth/wrong-password") {
        setPasswordError("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setEmailError("No account found with this email.");
      } else {
        setEmailError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Modal open={loginModalVisible} onCancel={() => setLoginModalVisible(false)} centered footer={null}>
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Sign in</h1>
      </div>
      <div className="flex flex-col space-y-4">
        <InputField
          type="text"
          label="Email"
          autoComplete="current-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          errorMessage={emailError}
        />
        <InputField
          type="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errorMessage={passwordError}
          isPassword={true}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm">
            <input type="checkbox" className="w-4 h-4 border-gray-200 rounded focus:ring-green-900" />
            <span className="ml-2 text-gray">Remember me</span>
          </label>
          <a href="#" className="text-sm text-green-900 hover:underline">Forgot password?</a>
        </div>
        <button
          onClick={handleLogin}
          className={`w-full py-3 text-sm font-semibold rounded-lg bg-gradient-to-tl from-violet-600 to-blue-600 text-white shadow-lg hover:shadow-violet-700/50 focus:ring-2 focus:ring-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-dots loading-lg text-white"></span>
          ) : (
            "Sign in"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default LoginModal;
