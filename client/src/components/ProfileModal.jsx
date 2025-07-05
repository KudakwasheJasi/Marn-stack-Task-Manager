/**
 * @description      : Modern Profile Modal with enhanced UI design
 * @author           : kudakwashe Ellijah
 * @group            : 
 * @created          : 05/07/2025 - 15:55:38
 * 
 * MODIFICATION LOG
 * - Version         : 2.0.0
 * - Date            : 05/07/2025
 * - Author          : kudakwashe Ellijah
 * - Modification    : Complete UI redesign with modern design system
**/
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  FaUserEdit, 
  FaCamera, 
  FaSave, 
  FaTimes, 
  FaEnvelope, 
  FaPhone, 
  FaUser,
  FaEdit,
  FaCheck
} from 'react-icons/fa';
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
  const [imagePreview, setImagePreview] = useState(null);

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
      setImagePreview(URL.createObjectURL(file));
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
    setImagePreview(null);
    onClose();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                    <FaUserEdit className="text-white text-xl" />
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900"
                    >
                      Edit Profile
                    </Dialog.Title>
                    <p className="text-gray-500 text-sm">Update your personal information</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                      {imagePreview || user?.imageUrl ? (
                        <img
                          src={imagePreview || user.imageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-3xl font-bold">
                            {getInitials(user?.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Camera Icon Overlay */}
                    <label
                      htmlFor="profileImage"
                      className="absolute bottom-2 right-2 bg-white text-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-110"
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
                  <p className="text-gray-500 text-sm mt-3">Click the camera icon to change your photo</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FaUser className="text-blue-500" />
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FaEnvelope className="text-blue-500" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FaPhone className="text-blue-500" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FaEdit className="text-blue-500" />
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileModal;
