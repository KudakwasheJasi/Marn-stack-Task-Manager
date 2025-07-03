import { useState } from 'react';
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from '../services/api';
import { toast } from 'sonner';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      dispatch({ type: 'auth/logout' });
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.response?.data?.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Profile</h3>
              <p className="text-gray-600">Manage your profile settings here</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <p className="text-gray-600">Manage your security settings here</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Notifications</h3>
              <p className="text-gray-600">Manage your notification preferences here</p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium mb-2">Preferences</h3>
              <p className="text-gray-600">Manage your preferences here</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-red-600 hover:text-red-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <IoLogOutOutline className="inline mr-2" />
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
