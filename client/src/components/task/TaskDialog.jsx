import React, { Fragment, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Menu, Transition } from "@headlessui/react";
import AddTask from "./AddTask";
import ConfirmationDialog from "../Dialogs";
import { toast } from 'sonner';
import { deleteTask, createTask, updateTask } from '../../services/api'; // Ensure deleteTask and createTask are imported

const TaskDialog = ({ task, refetchTasks }) => {
  const [openEdit, setOpenEdit] = useState(false); // State for editing task
  const [openDialog, setOpenDialog] = useState(false); // State for confirmation dialog
  const [loading, setLoading] = useState(false); // State for loading indicator
  const audioRef = useRef(null); // Reference for audio element

  const navigate = useNavigate(); // Hook for navigation

  // Handler for duplicating a task
  const duplicateHandler = async () => {
    try {
      setLoading(true);
      const duplicateData = {
        ...task,
        title: `${task.title} (Copy)`,
        createdAt: new Date().toISOString(),
        _id: undefined // Remove the _id so a new one will be generated
      };

      await createTask(duplicateData);
      toast.success('Task duplicated successfully');
      
      // Play sound notification
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => console.error('Error playing sound:', error));
      }
      
      if (typeof refetchTasks === 'function') {
        await refetchTasks();
      }
    } catch (error) {
      console.error('Duplicate task error:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate task');
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation dialog for deletion
  const deleteClicks = () => {
    setOpenDialog(true);
  };

  // Handler for deleting a task
  const deleteHandler = async () => {
    try {
      setLoading(true);
      await deleteTask(task._id); // Call the deleteTask function
      
      // Play sound notification
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(error => console.error('Error playing sound:', error));
      }
      
      toast.success('Task deleted successfully');
      
      if (typeof refetchTasks === 'function') {
        await refetchTasks(); // Refetch tasks after deletion
      }
      
      setOpenDialog(false); // Close confirmation dialog
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Menu items for task actions
  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className='mr-2 h-5 w-5 text-blue-500' aria-hidden='true' />,
      onClick: () => navigate(`/task/${task._id}`),
    },
    {
      label: "Edit",
      icon: <MdOutlineEdit className='mr-2 h-5 w-5 text-green-500' aria-hidden='true' />,
      onClick: () => setOpenEdit(true),
    },
    {
      label: "Add Sub-Task",
      icon: <MdAdd className='mr-2 h-5 w-5 text-purple-500' aria-hidden='true' />,
      onClick: () => navigate(`/task/${task._id}/subtask`),
    },
    {
      label: "Duplicate",
      icon: <HiDuplicate className='mr-2 h-5 w-5 text-orange-500' aria-hidden='true' />,
      onClick: duplicateHandler,
      disabled: loading,
    },
  ];

  return (
    <>
      <audio ref={audioRef} src="./alarm-sound.mp3" preload="auto" />
      <div className="relative">
        <Menu as='div' className='relative inline-block text-left'>
          <Menu.Button 
            className='inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
            disabled={loading}
          >
            <BsThreeDots className="h-5 w-5" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
              <div className='px-1 py-1 space-y-1'>
                {items.map((item) => (
                  <Menu.Item key={item.label}>
                    {({ active }) => (
                      <button
                        onClick={item.onClick}
                        className={`${
                          active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                          item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500 hover:text-white'
                        }`}
                        disabled={item.disabled}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>

              <div className='px-1 py-1'>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={deleteClicks} // Open confirmation dialog
                      className={`${
                        active ? 'bg-red-500 text-white' : 'text-red-500'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 hover:text-white'
                      }`}
                      disabled={loading}
                    >
                      <RiDeleteBin6Line
                        className='mr-2 h-5 w-5'
                        aria-hidden='true'
                      />
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={task}
        refetchTasks={refetchTasks}
      />

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel={loading ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        loading={loading}
      />
    </>
  );
};

export default TaskDialog;