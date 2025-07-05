import { Menu, Transition, Dialog } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils";
import ProfileModal from "./ProfileModal";
import PasswordModal from "./PasswordModal";

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
      
      // Make API call to logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Send cookies
      });

      // Clear user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navigate to login page
      navigate('/login');
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
            <Menu.Button className='w-10 h-10 2xl:w-12 2xl:h-12 items-center justify-center rounded-full'>
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <div className='w-full h-full bg-blue-600 rounded-full flex items-center justify-center'>
                  <span className='text-white font-semibold'>
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-gray-100 rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none'>
              <div className='p-4'>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setProfileOpen(true)}
                      className='text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base'
                    >
                      <FaUser className='mr-2' aria-hidden='true' />
                      Profile
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setPasswordOpen(true)}
                      className='text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base'
                    >
                      <FaUserLock className='mr-2' aria-hidden='true' />
                      Change Password
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler}
                      className={`text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-base`}
                      disabled={loading}
                    >
                      <IoLogOutOutline className='mr-2' aria-hidden='true' />
                      {loading ? 'Logging out...' : 'Logout'}
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
