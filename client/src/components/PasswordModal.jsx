/**
    * @description      : Modern Password Modal with enhanced UI design
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 15:41:06
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
  FaLock, 
  FaKey, 
  FaSave, 
  FaTimes, 
  FaEye, 
  FaEyeSlash,
  FaCheck,
  FaShieldAlt
} from 'react-icons/fa';
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

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: 'gray', text: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      1: { color: 'red', text: 'Very Weak' },
      2: { color: 'orange', text: 'Weak' },
      3: { color: 'yellow', text: 'Fair' },
      4: { color: 'blue', text: 'Good' },
      5: { color: 'green', text: 'Strong' }
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

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
            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
                    <FaShieldAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900"
                    >
                      Change Password
                    </Dialog.Title>
                    <p className="text-gray-500 text-sm">Update your account security</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FaLock className="text-blue-500" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FaKey className="text-green-500" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.strength
                                ? `bg-${passwordStrength.color}-500`
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                        {passwordStrength.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FaKey className="text-green-500" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm ${
                      formData.newPassword === formData.confirmPassword 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formData.newPassword === formData.confirmPassword ? (
                        <FaCheck className="w-4 h-4" />
                      ) : (
                        <FaTimes className="w-4 h-4" />
                      )}
                      {formData.newPassword === formData.confirmPassword 
                        ? 'Passwords match' 
                        : 'Passwords do not match'
                      }
                    </div>
                  )}
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
                    disabled={loading || formData.newPassword !== formData.confirmPassword}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-4 h-4" />
                        Update Password
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

export default PasswordModal;
