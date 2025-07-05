import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaLock, FaKey, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import { useAudio } from '../services/audioService';
import { updatePassword } from '../services/api';

const audio = useAudio();

const PasswordModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirmation do not match');
      audio.playError();
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      audio.playError();
      return;
    }

    try {
      setLoading(true);
      const response = await updatePassword(formData);
      
      if (response.success) {
        toast.success('Password updated successfully');
        audio.playSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update password');
        audio.playError();
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
      audio.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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

        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 mb-4"
          >
            Change Password
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showCurrentPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
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

export default PasswordModal;
