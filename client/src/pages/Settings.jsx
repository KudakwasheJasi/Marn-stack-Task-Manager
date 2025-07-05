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
import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Task Manager Settings</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Change Password</li>
        <li>Notification Preferences</li>
        <li>Theme (Light/Dark)</li>
        <li>Manage Team Members</li>
        <li>Account Deletion</li>
      </ul>
    </div>
  );
};

export default Settings; 