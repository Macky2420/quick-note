import React, { useEffect } from 'react';
import { useOutlet, useNavigate, Link } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';
import profile from '../assets/profile.svg';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // Assuming your AuthContext provides setUser

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Replace navigation to prevent back button access
        navigate('/', { replace: true });
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      // Use replace navigation and clear state
      navigate('/', { 
        replace: true,
        state: { from: 'logout' }  // Optional: Add state to track logout
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get profile image source
  const getProfileImage = () => {
    if (user?.photoURL) {
      return `${user.photoURL}?${Date.now()}`;
    }
    return profile;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="navbar fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full h-16">
          {/* Left Section - Menu */}
          <div className="flex items-center">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-white border border-gray-200 rounded-lg z-50 mt-2 w-48 shadow-xl">
                <li>
                  <Link 
                    to={`/home/${user?.uid}`}
                    className="text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to={`/profile/${user?.uid}`}
                    className="text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Center Section - Logo */}
          <div className="flex items-center">
            <Link
              to={`/home/${user?.uid}`}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent"
            >
              QuickNote
            </Link>
          </div>

          {/* Right Section - Profile */}
          <div className="flex items-center gap-4">
            <Link to={`/profile/${user?.uid}`} className="h-10 w-10">
              <img
                src={getProfileImage()}
                alt="Profile"
                className="rounded-full object-cover h-full w-full shadow-sm border-2 border-blue-100"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = profile;
                }}
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        {outlet}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} QuickNote. All rights reserved by KERVIN.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;