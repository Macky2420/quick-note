import { Modal } from "antd";
import React, { useState } from "react";

const InputField = ({ type, label, autoComplete }) => (
  <div className="relative border-gray">
    <input
      type={type}
      className="block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer"
      placeholder=" "
      autoComplete={autoComplete}
    />
    <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
      {label}
    </label>
  </div>
);

const RegisterModal = ({ registerModalVisible, setRegisterModalVisible }) => {
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
 
  return (
    <Modal open={registerModalVisible} onCancel={() => setRegisterModalVisible(false)} centered footer={null}>
      <div className="flex flex-col items-center mb-4">
        <h1 className="block text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Register
        </h1>
      </div>
      <div className="flex flex-col space-y-4">
        <InputField type="text" label="Full Name" autoComplete="name" />
        <InputField type="text" label="Email" autoComplete="email" />
        <InputField type="password" label="Password" autoComplete="new-password" />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 bg-white border border-gray-200 rounded focus:ring-3 focus:ring-green-900"
            checked={acceptedPrivacy}
            onChange={() => setAcceptedPrivacy(!acceptedPrivacy)}
          />
          <label className="ml-3 text-sm text-gray">
            I accept the <a href="#" className="text-green-900 hover:underline">Privacy Policy</a>
          </label>
        </div>

        <button
          type="button"
          className="cursor-pointer w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-tl from-violet-600 to-blue-600 shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          disabled={!acceptedPrivacy}
        >
          Register
        </button>
      </div>
    </Modal>
  );
};


export default RegisterModal;
