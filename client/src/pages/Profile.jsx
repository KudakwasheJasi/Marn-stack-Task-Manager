/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 02/07/2025 - 22:55:06
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 02/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';
import { FaUserEdit, FaSave } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { updateProfile } from '../services/api';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [preview, setPreview] = useState(user?.profilePic || null);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  // Handle file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (profilePic && typeof profilePic !== 'string') {
        formData.append('profilePic', profilePic);
      }
      // Add user ID to the form data
      formData.append('_id', user._id);
      const response = await updateProfile(formData);
      if (response?.status) {
        toast.success('Profile updated successfully');
        setEditMode(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  };

  return (
    <div className='bg-gray-50'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-6'>
            <div className='text-center mb-8'>
              <div className='w-32 h-32 mx-auto rounded-full bg-violet-700 flex items-center justify-center mb-4 overflow-hidden'>
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full"
                  />
                ) : (
                  <IoPersonOutline className='text-4xl text-white' />
                )}
              </div>
              {editMode && (
                <div className="flex justify-center mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block text-sm text-gray-500"
                  />
                </div>
              )}
              <h1 className='text-2xl font-bold text-gray-900'>{form.name}</h1>
              <p className='text-gray-600 mt-1'>{form.email}</p>
            </div>

            <div className='border-t border-gray-200 pt-6'>
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900'>Profile Information</h3>
                  <p className='mt-1 text-sm text-gray-500'>Update your profile information.</p>
                </div>

                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Name</label>
                    <div className='mt-1 flex rounded-md shadow-sm'>
                      <input
                        type='text'
                        className='flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Email</label>
                    <div className='mt-1 flex rounded-md shadow-sm'>
                      <input
                        type='email'
                        className='flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Role</label>
                    <div className='mt-1 flex rounded-md shadow-sm'>
                      <input
                        type='text'
                        className='flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        value={user?.role}
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Joined</label>
                    <div className='mt-1 flex rounded-md shadow-sm'>
                      <input
                        type='text'
                        className='flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        value={new Date(user?.createdAt).toLocaleDateString()}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='border-t border-gray-200 pt-6'>
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900'>Account Settings</h3>
                  <p className='mt-1 text-sm text-gray-500'>Manage your account preferences.</p>
                </div>

                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  {!editMode ? (
                    <button
                      onClick={handleEditProfile}
                      className='flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                      <FaUserEdit className='mr-2' />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveProfile}
                      className='flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    >
                      <FaSave className='mr-2' />
                      Save
                    </button>
                  )}

                  <Link
                    to='/settings'
                    className='flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    <IoSettingsOutline className='mr-2' />
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
