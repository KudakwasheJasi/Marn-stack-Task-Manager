/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 02/07/2025 - 21:59:58
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 02/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdEdit
} from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import { PRIORITYSTYLES, TASK_TYPE, BGS, getInitials } from "../utils";
import clsx from "clsx";
import { Chart } from "../components/Chart";
import UserInfo from "../components/UserInfo";
import { toast } from 'sonner';
import AddTask from '../components/task/AddTask';

const TaskTable = ({ tasks }) => {
  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const TableHeader = () => (
    <thead className='border-b border-gray-300 '>
      <tr className='text-black text-left'>
        <th className='py-2'>Task Title</th>
        <th className='py-2'>Priority</th>
        <th className='py-2'>Team</th>
        <th className='py-2 hidden md:block'>Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className='border-b border-gray-300 text-gray-600 hover:bg-gray-300/10'>
      <td className='py-2'>
        <div className='flex items-center gap-2'>
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />

          <p className='text-base text-black'>{task.title}</p>
        </div>
      </td>

      <td className='py-2'>
        <div className='flex gap-1 items-center'>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className='capitalize'>{task.priority}</span>
        </div>
      </td>

      <td className='py-2'>
        <div className='flex'>
          {task.team.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS.length]
              )}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>
      <td className='py-2 hidden md:block'>
        <span className='text-base text-gray-600'>
          {moment(task?.date).fromNow()}
        </span>
      </td>
    </tr>
  );
  return (
    <>
      <div className='w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded'>
        <table className='w-full'>
          <TableHeader />
          <tbody>
            {tasks?.map((task, id) => (
              <TableRow key={id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const UserTable = ({ users }) => {
  const TableHeader = () => (
    <thead className='border-b border-gray-300 '>
      <tr className='text-black  text-left'>
        <th className='py-2'>Full Name</th>
        <th className='py-2'>Status</th>
        <th className='py-2'>Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className='border-b border-gray-200  text-gray-600 hover:bg-gray-400/10'>
      <td className='py-2'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700'>
            <span className='text-center'>{getInitials(user?.name)}</span>
          </div>

          <div>
            <p> {user.name}</p>
            <span className='text-xs text-black'>{user?.role}</span>
          </div>
        </div>
      </td>

      <td>
        <p
          className={clsx(
            "w-fit px-3 py-1 rounded-full text-sm",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </p>
      </td>
      <td className='py-2 text-sm'>{moment(user?.createdAt).fromNow()}</td>
    </tr>
  );

  return (
    <div className='w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded'>
      <table className='w-full mb-5'>
        <TableHeader />
        <tbody>
          {users?.map((user, index) => (
            <TableRow key={index + user?._id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setTasks(data.last10Task || []);
        setSummary(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

    const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Make API call to logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
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

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    if (status === 'all') {
      setTasks(tasks);
    } else {
      setTasks(tasks.filter(task => task.stage === status));
    }
  };

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASK",
      total: summary?.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
      status: "all"
    },
    {
      _id: "2",
      label: "COMPLETED TASK",
      total: tasks?.filter(task => task.stage === 'completed').length || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
      status: "completed"
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS",
      total: tasks?.filter(task => task.stage === 'in progress').length || 0,
      icon: <MdEdit />,
      bg: "bg-[#f59e0b]",
      status: "in progress"
    },
    {
      _id: "4",
      label: "TODOS",
      total: tasks?.filter(task => task.stage === 'todo').length || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
      status: "todo"
    },
  ];

  const Card = ({ label, count, bg, icon, status }) => {
    const [showCreateTask, setShowCreateTask] = useState(false);

    const handleRefresh = () => {
      refreshTasks();
      toast.success('Tasks refreshed');
    };

    return (
      <div className='w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between'>
        <div className='h-full flex flex-1 flex-col justify-between'>
          <p className='text-base text-gray-600'>{label}</p>
          <span className='text-2xl font-semibold'>{count}</span>
          <span className='text-sm text-gray-400'>{"110 last month"}</span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => handleStatusClick(status)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              selectedStatus === status ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MdKeyboardArrowUp className='text-gray-600' />
          </button>
          <button
            onClick={() => handleRefresh()}
            className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors'
          >
            <MdKeyboardDoubleArrowUp className='text-blue-600' />
          </button>
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center text-white",
              bg
            )}
          >
            {icon}
          </div>
        </div>

        {showCreateTask && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full'>
              <h3 className='text-lg font-bold mb-4'>Create New Task</h3>
              <AddTask
                open={showCreateTask}
                setOpen={setShowCreateTask}
                refreshTasks={refreshTasks}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className='h-full py-4'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <button
          onClick={handleLogout}
          className='flex items-center gap-2 px-4 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors'
          disabled={loading}
        >
          <IoLogOutOutline className='text-lg' />
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-5'>
        {stats.map(({ icon, bg, label, total, status }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} status={status} />
        ))}
      </div>

      <div className='w-full bg-white my-16 p-4 rounded shadow-sm'>
        <h4 className='text-xl text-gray-600 font-semibold'>
          Chart by Priority
        </h4>
        <Chart />
      </div>

      <div className='w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-8'>
        {/* /left */}
        {tasks.length > 0 ? (
          <TaskTable tasks={tasks} />
        ) : (
          <div className='w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded flex items-center justify-center'>
            <p className='text-gray-500'>No tasks available</p>
          </div>
        )}

        {/* /right */}
        {summary?.users?.length > 0 ? (
          <UserTable users={summary.users} />
        ) : (
          <div className='w-full md:w-1/3 bg-white px-2 md:px-6 py-4 shadow-md rounded flex items-center justify-center'>
            <p className='text-gray-500'>No users available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
