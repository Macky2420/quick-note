import React, { useState, useEffect } from 'react';
import { UserOutlined, CameraOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Avatar, message } from 'antd';
import { auth, db } from '../database/firebaseConfig';
import { ref as databaseRef, update, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import profile from '../assets/profile.svg';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }
        const userRef = databaseRef(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        snapshot.exists() ? setUserData(snapshot.val()) : messageApi.warning('User data not found');
      } catch (error) {
        messageApi.error(`Error loading profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      user ? fetchUserData() : navigate('/');
    });

    return () => unsubscribe();
  }, [navigate, messageApi]);

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const user = auth.currentUser;
      
      if (!user) throw new Error('User not authenticated');

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!data.secure_url) throw new Error('Image upload failed.');

      // Update both auth and database
      await updateProfile(user, { photoURL: data.secure_url });
      await update(databaseRef(db, `users/${user.uid}`), { 
        photoURL: data.secure_url 
      });

      setUserData(prev => ({ ...prev, photoURL: data.secure_url }));
      messageApi.success('Profile picture updated!');
    } catch (error) {
      messageApi.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      messageApi.error(`Logout failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {contextHolder}
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          {/* Profile Picture Section */}
          <div className="relative group flex justify-center mb-6">
            <div className="relative">
              <Avatar
                size={128}
                icon={<UserOutlined />}
                src={userData?.photoURL || profile}
                className="border-4 border-transparent rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer transition-all hover:bg-gray-100"
              >
                {uploading ? (
                  <span className="loading loading-spinner text-gray-600"></span>
                ) : (
                  <CameraOutlined className="text-xl text-gray-600" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* User Info Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <div className="mt-1 flex items-center p-3 bg-gray-50 rounded-lg">
                <UserOutlined className="text-gray-400 mr-3" />
                <span className="text-gray-700">{userData?.fullName || 'Not set'}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="mt-1 flex items-center p-3 bg-gray-50 rounded-lg">
                <MailOutlined className="text-gray-400 mr-3" />
                <span className="text-gray-700">{auth.currentUser?.email}</span>
              </div>
            </div>

            <Button
              type="primary"
              danger
              block
              className="mt-6 h-10 font-medium"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
