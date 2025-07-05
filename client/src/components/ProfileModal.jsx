import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaUserEdit, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import { useAudio } from '../services/audioService';
import { updateUser, uploadProfileImage } from '../services/api';

const audio = useAudio();

const ProfileModal = ({ open, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Upload profile image if selected
      let imageUrl = user?.imageUrl;
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        const imageResponse = await uploadProfileImage(formData);
        imageUrl = imageResponse.data.imageUrl;
        audio.playSuccess();
      }

      // Update user profile
      const userData = {
        ...formData,
        imageUrl
      };
      await updateUser(user._id, userData);
      
      // Update local storage
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
      audio.playSuccess();
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
      audio.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setProfileImage(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 mb-4"
          >
            Edit Profile
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={profileImage ? URL.createObjectURL(profileImage) : user?.imageUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  <FaCamera className="w-4 h-4" />
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaTimes className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <FaSave className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default ProfileModal;
