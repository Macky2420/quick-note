import React from 'react';
import { useOutlet } from 'react-router-dom';
import profile from '../assets/profile.svg';

const Layout = () => {
    const outlet = useOutlet();
    return (
        <div className="min-h-screen flex flex-col">
            {/* Fixed Navbar */}
            <div className="navbar fixed top-0 left-0 w-full bg-violet-200 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100 shadow-sm z-50">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> 
                            </svg>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-violet-200 rounded-box z-50 mt-3 w-30 p-2 shadow">
                            <li><a>Home</a></li>
                            <li><a>Profile</a></li>
                            <li><a>Logout</a></li>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <a className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-2xl lg:text-3xl">
                        QuickNote
                    </a>
                </div>
                <div className="navbar-end">
                    <button className='h-10 w-10'>
                        <img src={profile} />
                    </button>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 pt-16">{/* pt-16 (padding-top) to avoid content being hidden behind navbar */}
                {outlet}
            </div>

            {/* Footer */}
            <footer className="footer footer-center p-4 bg-gray-300 text-base-content">
                <aside>
                    <p className='text-sm text-gray-800'>Copyright © 2025 - All right reserved by KERVIN</p>
                </aside>
            </footer>
        </div>
    );
}

export default Layout;
