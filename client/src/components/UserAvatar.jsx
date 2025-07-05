/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 16:04:47
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserLock, FaCog, FaSignOutAlt } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils";
import ProfileModal from "./ProfileModal";
import PasswordModal from "./PasswordModal";
import { toast } from "sonner";
import { logout as logoutAction } from "../redux/slices/authSlice";
import { logout as logoutAPI } from "../services/api";

const UserAvatar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      setLoading(true);
      
      // Call the centralized logout API function
      await logoutAPI();
      
      // Dispatch Redux logout action to clear state
      dispatch(logoutAction());
      
      // Navigate to login page
      navigate('/login');
      
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <Menu as='div' className='relative inline-block text-left'>
          <div>
            <Menu.Button className='group relative w-10 h-10 2xl:w-12 2xl:h-12 items-center justify-center rounded-full transition-all duration-200 hover:ring-4 hover:ring-blue-100 focus:ring-4 focus:ring-blue-200'>
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className='w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-200'
                />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200'>
                  <span className='text-white font-semibold text-sm 2xl:text-base'>
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
              
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-150'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-3 w-80 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden'>
              {/* User Info Header */}
              <div className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className='w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg'
                      />
                    ) : (
                      <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg'>
                        <span className='text-white font-bold text-xl'>
                          {getInitials(user?.name)}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-bold text-gray-900 truncate'>{user?.name}</h3>
                    <p className='text-sm text-gray-600 truncate'>{user?.email}</p>
                    <div className='flex items-center gap-1 mt-1'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-xs text-green-600 font-medium'>Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className='p-2'>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setProfileOpen(true)}
                      className={`${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      } group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FaUser className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className='text-left'>
                        <div>Profile</div>
                        <div className='text-xs text-gray-500'>Manage your account</div>
                      </div>
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setPasswordOpen(true)}
                      className={`${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      } group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FaUserLock className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className='text-left'>
                        <div>Change Password</div>
                        <div className='text-xs text-gray-500'>Update your security</div>
                      </div>
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      } group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FaCog className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className='text-left'>
                        <div>Settings</div>
                        <div className='text-xs text-gray-500'>App preferences</div>
                      </div>
                    </button>
                  )}
                </Menu.Item>

                <div className='border-t border-gray-100 my-2'></div>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler}
                      disabled={loading}
                      className={`${
                        active ? 'bg-red-50 text-red-700' : 'text-red-600'
                      } group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${active ? 'bg-red-100' : 'bg-red-50'}`}>
                        {loading ? (
                          <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
                        ) : (
                          <FaSignOutAlt className={`w-4 h-4 ${active ? 'text-red-600' : 'text-red-500'}`} />
                        )}
                      </div>
                      <div className='text-left'>
                        <div>{loading ? 'Signing out...' : 'Sign out'}</div>
                        <div className='text-xs text-red-400'>Logout from your account</div>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
      <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default UserAvatar;
