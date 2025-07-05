/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 16:14:13
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setOpenSidebar, logout as logoutAction } from "../redux/slices/authSlice";
import clsx from "clsx";
import { toast } from 'sonner';
import { logout as logoutAPI } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isSidebarOpen: boolean;
}

interface SidebarLink {
  label: string;
  link: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const linkData: SidebarLink[] = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Tasks",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completed",
    link: "tasks/status/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "In Progress",
    link: "tasks/status/in progress",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "To Do",
    link: "tasks/status/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Team",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Trash",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useSelector((state: { auth: AuthState }) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const sidebarLinks = user?.isAdmin ? [...linkData, {
    label: "Settings",
    link: "settings",
    icon: <MdSettings />
  }, {
    label: "Logout",
    link: "logout",
    icon: <IoLogOutOutline />
  }] : [...linkData.slice(0, 5), {
    label: "Settings",
    link: "settings",
    icon: <MdSettings />
  }, {
    label: "Logout",
    link: "logout",
    icon: <IoLogOutOutline />
  }];

  const closeSidebar = () => {
    onClose();
  };

  interface NavLinkProps {
  el: SidebarLink;
}

const NavLink: React.FC<NavLinkProps> = ({ el }) => {
    const handleLogout = async () => {
      try {
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
      }
    };

    const closeSidebar = () => {
      onClose();
    };

    const handleNav = (e: React.MouseEvent) => {
      e.preventDefault();
      if (el.link === 'logout') {
        handleLogout();
      } else if (el.link.startsWith('tasks/status/')) {
        navigate(`/${el.link}`);
        closeSidebar();
      } else {
        navigate(`/${el.link}`);
        closeSidebar();
      }
    };

    // Determine if this link is active
    const isActive =
      (el.link === 'tasks' && path === '/tasks') ||
      (el.link.startsWith('tasks/status/') && path.startsWith(`/${el.link}`)) ||
      (el.link === 'dashboard' && path === '/dashboard') ||
      (el.link === 'team' && path === '/team') ||
      (el.link === 'trashed' && path === '/trashed') ||
      (el.link === 'settings' && path === '/settings');

    return (
      <a
        href={el.link === 'logout' ? '#' : `/${el.link}`}
        onClick={handleNav}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 dark:text-gray-200 text-base hover:bg-[#2564ed2d] dark:hover:bg-blue-600/20 transition-colors duration-150",
          isActive ? "bg-blue-600 text-white font-semibold" : ""
        )}
      >
        {el.icon}
        <span className="text-sm">{el.label}</span>
      </a>
    );
  };
  return (
    <div className={clsx(
      'fixed inset-y-0 left-0 z-50 w-full h-full bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 border-r border-gray-200 dark:border-gray-700',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0 lg:static lg:w-64'
    )}>
      <h1 className='flex gap-1 items-center p-4'>
        <p className='bg-blue-600 p-2 rounded-full'>
          <MdOutlineAddTask className='text-white text-2xl font-black' />
        </p>
        <span className='text-2xl font-bold text-black dark:text-white'>TaskMe</span>
      </h1>

      <div className='flex-1 flex flex-col gap-y-5 py-8 px-4'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
