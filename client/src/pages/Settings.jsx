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

const Settings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
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
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Dashboard Overview</h2>
        <Chart />
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-blue-500" />
            <span className="font-semibold text-lg">Change Password</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Update your account password for better security.</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
          <PasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
        </div>

        {/* Theme Toggle */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            {theme === 'dark' ? <FaMoon className="text-yellow-500" /> : <FaSun className="text-yellow-400" />}
            <span className="font-semibold text-lg">Theme</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Switch between light and dark mode.</p>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => {
              const newTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
              localStorage.setItem('theme', newTheme);
              document.documentElement.classList.toggle('dark', newTheme === 'dark');
            }}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaBell className="text-green-500" />
            <span className="font-semibold text-lg">Notification Preferences</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Manage your notification settings.</p>
          <div className="flex flex-col gap-2 w-full">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifPrefs.email} disabled={notifLoading}
                onChange={() => handleNotifToggle('email')} />
              <span>Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifPrefs.push} disabled={notifLoading}
                onChange={() => handleNotifToggle('push')} />
              <span>Push Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifPrefs.taskAssignment} disabled={notifLoading}
                onChange={() => handleNotifToggle('taskAssignment')} />
              <span>Task Assignment</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifPrefs.comments} disabled={notifLoading}
                onChange={() => handleNotifToggle('comments')} />
              <span>Comments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifPrefs.deadlineReminders} disabled={notifLoading}
                onChange={() => handleNotifToggle('deadlineReminders')} />
              <span>Deadline Reminders</span>
            </label>
          </div>
        </div>

        {/* Manage Team Members */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start w-full">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-purple-500" />
            <span className="font-semibold text-lg">Manage Team Members</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Add or remove team members.</p>
          <form onSubmit={handleAddMember} className="flex gap-2 mb-4 w-full">
            <input
              type="email"
              placeholder="Invite by email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
              disabled={inviteLoading}
            >
              {inviteLoading ? 'Adding...' : 'Add'}
            </button>
          </form>
          {teamLoading ? (
            <div className="text-gray-400">Loading team...</div>
          ) : (
            <ul className="w-full space-y-1">
              {team.map(member => (
                <li key={member._id || member.email} className="flex justify-between items-center border-b py-1">
                  <span>{member.name} <span className="text-xs text-gray-400">({member.email})</span></span>
                  <span className="text-xs text-gray-500">{member.role}</span>
                  {member._id !== userId && (
                    <button
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removeLoading === member._id}
                    >
                      {removeLoading === member._id ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Account Deletion */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaTrash className="text-red-500" />
            <span className="font-semibold text-lg">Account Deletion</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Permanently delete your account.</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold disabled:opacity-50"
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