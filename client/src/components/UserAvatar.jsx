/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 02/07/2025 - 22:19:29
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 02/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : Fixed UserAvatar component to properly link to profile
**/
import React, { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { FaUser, FaUserEdit, FaUserLock, FaSave, FaUserCircle } from "react-icons/fa";
import { IoLogOutOutline, IoListOutline, IoSettingsOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { getInitials } from "../utils";
import { logout } from '../services/api';
import { BiUserCircle } from 'react-icons/bi';
import { IoLockClosedOutline } from 'react-icons/io5';
import { setOpenSidebar } from '../redux/slices/authSlice';
import { MdOutlineDashboard } from "react-icons/md";

const UserAvatar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const logoutHandler = async (e) => {
    e.stopPropagation(); // Prevent menu from closing prematurely
    try {
      await logout(dispatch);
      navigate('/log-in');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.response?.data?.message || 'Failed to logout');
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Task Manager Icon */}
      <Link to="/dashboard" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
        <MdOutlineDashboard size={26} className="text-gray-600" />
      </Link>
      {/* Notification Icon */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z"/>
        </svg>
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">2</span>
      </div>
      {/* Profile/Avatar Icon */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-8 h-8 text-indigo-500" /> // Colorful icon
              )}
            </div>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            static={true}
          >
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <BiUserCircle className="w-8 h-8 text-gray-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className="w-full px-4 py-2 text-left text-red-600 hover:text-red-700 transition-colors"
                  >
                    <IoListOutline className="inline-block w-4 h-4 mr-2" />
                    Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/change-password"
                    className={`block px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    <IoLockClosedOutline className="inline-block w-4 h-4 mr-2" />
                    Change Password
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logoutHandler}
                    className="w-full px-4 py-2 text-left text-red-600 hover:text-red-700 transition-colors"
                  >
                    <IoLogOutOutline className="inline-block w-4 h-4 mr-2" />
                    Logout
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default UserAvatar;
