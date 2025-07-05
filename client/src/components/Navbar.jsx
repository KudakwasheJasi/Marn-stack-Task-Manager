/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 19:07:22
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import UserAvatar from "./UserAvatar";
import NotificationPanel from "./NotificationPanel";
import { createTestNotification, clearTestNotifications } from "../services/api";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const testNotification = async () => {
    try {
      console.log('Creating test notification from Navbar...');
      const result = await createTestNotification();
      console.log('Test notification result:', result);
      alert('Test notification created! Check the notification panel.');
    } catch (error) {
      console.error('Error creating test notification:', error);
      alert('Error creating test notification: ' + error.message);
    }
  };

  const clearTestNotificationsHandler = async () => {
    try {
      console.log('Clearing test notifications...');
      const result = await clearTestNotifications();
      console.log('Clear result:', result);
      alert('Test notifications cleared!');
    } catch (error) {
      console.error('Error clearing test notifications:', error);
      alert('Error clearing test notifications: ' + error.message);
    }
  };

  return (
    <div className='flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0'>
      <div className='flex gap-4'>
        <button
          onClick={() => dispatch(setOpenSidebar(true))}
          className='text-2xl text-gray-500 block md:hidden'
        >
          ☰
        </button>

        <div className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6]'>
          <MdOutlineSearch className='text-gray-500 text-xl' />

          <input
            type='text'
            placeholder='Search....'
            className='flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800'
          />
        </div>
      </div>

      <div className='flex gap-2 items-center'>
        <button
          onClick={testNotification}
          className='px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600'
          title='Test Notification'
        >
          Test
        </button>
        <button
          onClick={clearTestNotificationsHandler}
          className='px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600'
          title='Clear Test Notifications'
        >
          Clear
        </button>
        <NotificationPanel />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
