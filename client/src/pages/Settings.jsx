/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 22:00:40
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React, { useState, useEffect } from 'react';
import { Chart } from '../components/Chart';
import PasswordModal from '../components/PasswordModal';
import { FaMoon, FaSun, FaBell, FaUsers, FaTrash } from 'react-icons/fa';
import { getNotificationPreferences, updateNotificationPreferences, getTeamMembers, deleteAccount, addTeamMember, removeTeamMember } from '../services/api';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true });
  const [notifLoading, setNotifLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState('');
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  // Load notification preferences
  useEffect(() => {
    setNotifLoading(true);
    getNotificationPreferences()
      .then(prefs => setNotifPrefs(prefs))
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => setNotifLoading(false));
  }, []);

  // Save notification preferences
  const handleNotifToggle = (type) => {
    const updated = { ...notifPrefs, [type]: !notifPrefs[type] };
    setNotifPrefs(updated);
    setNotifLoading(true);
    updateNotificationPreferences(updated)
      .then(() => toast.success('Preferences updated'))
      .catch(() => toast.error('Failed to update preferences'))
      .finally(() => setNotifLoading(false));
  };

  // Load team members
  useEffect(() => {
    setTeamLoading(true);
    getTeamMembers()
      .then(setTeam)
      .catch(() => toast.error('Failed to load team members'))
      .finally(() => setTeamLoading(false));
  }, []);

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      await deleteAccount();
      toast.success('Account deleted. Logging out...');
      setTimeout(() => window.location.href = '/login', 1500);
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add team member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const updatedTeam = await addTeamMember(inviteEmail);
      setTeam(updatedTeam);
      setInviteEmail('');
      toast.success('Team member added');
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  // Remove team member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from your team?')) return;
    setRemoveLoading(memberId);
    try {
      const updatedTeam = await removeTeamMember(memberId);
      setTeam(updatedTeam);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    } finally {
      setRemoveLoading('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      {/* Dashboard Bar Graph */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Dashboard Overview</h2>
        <Chart />
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-blue-500" />
            <span className="font-semibold text-lg dark:text-white">Change Password</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Update your account password for better security.</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
          <PasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            {theme === 'dark' ? <FaMoon className="text-yellow-500" /> : <FaSun className="text-yellow-400" />}
            <span className="font-semibold text-lg dark:text-white">Theme</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Switch between light and dark mode.</p>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaBell className="text-green-500" />
            <span className="font-semibold text-lg dark:text-white">Notification Preferences</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Manage your notification settings.</p>
          <div className="flex flex-col gap-2 w-full">
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input type="checkbox" checked={notifPrefs.email} disabled={notifLoading}
                onChange={() => handleNotifToggle('email')} />
              <span>Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input type="checkbox" checked={notifPrefs.push} disabled={notifLoading}
                onChange={() => handleNotifToggle('push')} />
              <span>Push Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input type="checkbox" checked={notifPrefs.taskAssignment} disabled={notifLoading}
                onChange={() => handleNotifToggle('taskAssignment')} />
              <span>Task Assignment</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input type="checkbox" checked={notifPrefs.comments} disabled={notifLoading}
                onChange={() => handleNotifToggle('comments')} />
              <span>Comments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer dark:text-white">
              <input type="checkbox" checked={notifPrefs.deadlineReminders} disabled={notifLoading}
                onChange={() => handleNotifToggle('deadlineReminders')} />
              <span>Deadline Reminders</span>
            </label>
          </div>
        </div>

        {/* Manage Team Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start w-full">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-purple-500" />
            <span className="font-semibold text-lg dark:text-white">Manage Team Members</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Add or remove team members.</p>
          <form onSubmit={handleAddMember} className="flex gap-2 mb-4 w-full">
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={inviteLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
              disabled={inviteLoading}
            >
              {inviteLoading ? 'Adding...' : 'Add'}
            </button>
          </form>
          <div className="w-full">
            {teamLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading team...</p>
            ) : team.length > 0 ? (
              <div className="space-y-2">
                {team.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="dark:text-white">{member.email}</span>
                    {member._id !== userId && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={removeLoading === member._id}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {removeLoading === member._id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No team members yet.</p>
            )}
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaTrash className="text-red-500" />
            <span className="font-semibold text-lg dark:text-white">Delete Account</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Permanently delete your account and all data.</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 