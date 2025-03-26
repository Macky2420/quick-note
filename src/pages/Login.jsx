import React, { useState} from 'react'
import background from '../assets/background.jpg';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

export const Login = () => {
    const [loginModalVisible, setLoginModalVisible] = useState(false);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);

    const handleShowLoginModal = () => {
      setLoginModalVisible(true);
    }

    const handleShowRegisterModal = () => {
      setRegisterModalVisible(true);
    }

  return (
    <>
     <div style={{ height: '100vh', backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${background})`, backgroundSize: "cover", backgroundPosition: "center"}}>
        <div className="bg-gradient-to-b from-violet-600/[.15] via-transparent">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">
            <div className="flex justify-center">
              <button onClick={handleShowLoginModal} className="cursor-pointer group inline-block bg-white/[.05] hover:bg-white/[.1] border border-white/[.05] p-1 ps-4 rounded-full shadow-md">
                <p className="me-2 inline-block text-white text-sm">
                  Sign in your account.
                </p>
                <span className="group-hover:bg-white/[.1] py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-white/[.075] font-semibold text-white text-sm">
                  <svg className="flex-shrink-0 size-4" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
            </div>
            <div className="max-w-3xl text-center mx-auto">
            <h1 className="block font-medium text-gray-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to 
                <br/>
                <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    QuickNotes
                </span>
                <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></span>
                </span>
            </h1>
            </div>

            <div className="max-w-3xl text-center mx-auto">
              <p className="text-lg text-gray-400">Capture Your Thoughts Anytime, Anywhere!</p>
            </div>
            <div className="text-center">
              <button onClick={handleShowRegisterModal} className="cursor-pointer inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-violet-600 to-blue-600 shadow-lg shadow-transparent hover:shadow-violet-700/50 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white py-3 px-6">
                Get started
                <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        loginModalVisible = {loginModalVisible}
        setLoginModalVisible = {setLoginModalVisible}
      />
      <RegisterModal
        registerModalVisible = {registerModalVisible}
        setRegisterModalVisible = {setRegisterModalVisible}
      />
    </>
  )
}

export default Login;
