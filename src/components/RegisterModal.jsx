import { Modal, message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { auth, db } from "../database/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { openDB } from "idb";
import { useNavigate } from "react-router-dom";

const InputField = ({ type, label, autoComplete, value, setValue, isPassword, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative border-gray">
      <input
        type={isPassword && !showPassword ? "password" : "text"}
        className={`block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border ${error ? "border-red-500" : "border-gray-200"} appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer`}
        placeholder=" "
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
        {label}
      </label>
      {isPassword && (
        <span
          className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </span>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

const RegisterModal = ({ registerModalVisible, setRegisterModalVisible }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [privacyTextClass, setPrivacyTextClass] = useState("text-gray");
  const navigate = useNavigate();

  useEffect(() => {
    setPrivacyTextClass(errors.privacy ? "text-red-500" : "text-gray");
  }, [errors.privacy]);

  const validateInputs = async () => {
    let newErrors = {};

    if (fullName.length < 5) newErrors.fullName = "Full name must be at least 5 characters long.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) newErrors.email = "Invalid email format.";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters long.";
    if (!acceptedPrivacy) newErrors.privacy = true;

    const emailRef = ref(db, `users`);
    const snapshot = await get(emailRef);
    if (snapshot.exists() && Object.values(snapshot.val()).some(user => user.email === email)) {
      newErrors.email = "Email already exists.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerUser = async () => {
    if (!(await validateInputs())) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await set(ref(db, `users/${user.uid}`), { fullName, email });
      
      messageApi.open({
        type: "success",
        content: "Registration successful!",
      });
      
      setFullName("");
      setEmail("");
      setPassword("");
      setAcceptedPrivacy(false);
      setErrors({});
      
      setRegisterModalVisible(false);
      navigate(`/home/${user.uid}`);
    } catch (error) {
      if (!navigator.onLine) {
        const offlineDB = await openDB("offline-registrations", 1, {
          upgrade(db) {
            db.createObjectStore("users", { keyPath: "email" });
          },
        });
        await offlineDB.put("users", { fullName, email, password, acceptedPrivacy });
        messageApi.open({
          type: "warning",
          content: "No internet. Registration saved and will be retried when online.",
        });
      } else {
        messageApi.open({
          type: "error",
          content: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={registerModalVisible} onCancel={() => setRegisterModalVisible(false)} centered footer={null} className="backdrop-blur-md">
      {contextHolder}
      {loading && <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50"><span className="loading loading-dots loading-lg"></span></div>}
      <div className="flex flex-col items-center mb-4">
        <h1 className="block text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Register
        </h1>
      </div>
      <div className="flex flex-col space-y-4">
        <InputField type="text" label="Full Name" autoComplete="name" value={fullName} setValue={setFullName} error={errors.fullName} />
        <InputField type="text" label="Email" autoComplete="email" value={email} setValue={setEmail} error={errors.email} />
        <InputField type="password" label="Password" autoComplete="new-password" value={password} setValue={setPassword} isPassword error={errors.password} />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 bg-white border border-gray-200 rounded focus:ring-3 focus:ring-green-900"
            checked={acceptedPrivacy}
            onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
          />
          <label className={`ml-3 text-sm ${privacyTextClass}`}>
            I accept the <a href="#" className="text-green-900 hover:underline">Privacy Policy</a>
          </label>
        </div>

        <button
          type="button"
          className="cursor-pointer w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-tl from-violet-600 to-blue-600 shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          onClick={registerUser}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-dots loading-lg text-white"></span>
          ) : (
            "Register"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default RegisterModal;
