import { Modal } from "antd";

const LoginModal = ({ loginModalVisible, setLoginModalVisible }) => {

  const handleCloseLoginModal = () => {
    setLoginModalVisible(false);
  }

  return (
    <Modal 
      open={loginModalVisible} 
      onCancel={handleCloseLoginModal} 
      centered 
      footer={null}
      >
      <div className="flex flex-col items-center mb-4">
        <h1 className="block text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Sign in</h1>
      </div>
      <div>
        <div className="flex flex-col space-y-4">
          {/* Email Input */}
          <div className="relative border-gray">
            <input
              type="text"
              className="block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer"
              placeholder=" "
              autoComplete="current-email"
            />
            <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
              Email
            </label>
          </div>

          {/* Password Input */}
          <div className="relative border-gray">
            <input
              type="password"
              className="block px-2.5 pb-2.5 pt-4 w-full bg-white text-sm text-black rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-green-900 peer"
              placeholder=" "
              autoComplete="current-password"
            />
            <label className="absolute text-sm text-black duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
              Password
            </label>
            {/* <button type="button" className="absolute right-3 top-3">
              <EyeIcon className="h-5 w-5 text-gray-400" />
            </button> */}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 bg-white border border-gray-200 rounded focus:ring-3 focus:ring-green-900"
              />
              <label className="ml-3 text-sm text-gray">Remember me</label>
            </div>
            <a href="#" className="text-sm text-green-900 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Sign-in Button */}
          <button
            type="button"
            className="cursor-pointer w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-tl from-violet-600 to-blue-600 shadow-lg shadow-transparent hover:shadow-violet-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Sign in
          </button>

          {/* OR Separator */}
          <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6">
            Or
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
          >
            <svg className="w-4 h-auto" xmlns="http://www.w3.org/2000/svg" width="46" height="47" viewBox="0 0 46 47" fill="none">
              <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
              <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
              <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
              <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
