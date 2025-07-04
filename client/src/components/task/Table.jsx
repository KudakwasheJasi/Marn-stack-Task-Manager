import React, { useState, useCallback } from "react";
import { deleteTask } from '../../services/api';
import TaskDialog from './TaskDialog';
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../UserInfo";
import Button from "../Button";
import ConfirmatioDialog from "../Dialogs";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks, refetchTasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const deleteClicks = useCallback((id) => {
    setSelected(id);
    setOpenDialog(true);
  }, []);

  const deleteHandler = async () => {
    if (!selected) return;

    console.log('Attempting to delete task with ID:', selected); // Log the task ID
    try {
      setLoading(true);
      await deleteTask(selected); // Call the deleteTask function
      toast.success('Task deleted successfully');
      
      // Refresh tasks list
      if (typeof refetchTasks === 'function') {
        await refetchTasks();
      }
      
      setOpenDialog(false);
      setSelected(null);
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const TableHeader = () => (
    <thead className='w-full border-b border-gray-300'>
      <tr className='w-full text-black text-left'>
        <th className='py-3 px-4'>Task Title</th>
        <th className='py-3 px-4'>Priority</th>
        <th className='py-3 px-4 line-clamp-1'>Created At</th>
        <th className='py-3 px-4'>Assets</th>
        <th className='py-3 px-4'>Team</th>
        <th className='py-3 px-4 text-right'>Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors'>
      <td className='py-3 px-4'>
        <div className='flex items-center gap-2'>
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
            title={`Status: ${task.stage}`}
          />
          <p className='w-full line-clamp-2 text-base text-black'>
            {task?.title || 'Untitled Task'}
          </p>
        </div>
      </td>

      <td className='py-3 px-4'>
        <div className={"flex gap-1 items-center"}>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className='capitalize line-clamp-1'>
            {task?.priority || 'Normal'} Priority
          </span>
        </div>
      </td>

      <td className='py-3 px-4'>
        <span className='text-sm text-gray-600'>
          {task?.date ? formatDate(new Date(task.date)) : 'No date set'}
        </span>
      </td>

      <td className='py-3 px-4'>
        <div className='flex items-center gap-3'>
          <div className='flex gap-1 items-center text-sm text-gray-600' title='Activities'>
            <BiMessageAltDetail />
            <span>{task?.activities?.length || 0}</span>
          </div>
          <div className='flex gap-1 items-center text-sm text-gray-600' title='Attachments'>
            <MdAttachFile />
            <span>{task?.assets?.length || 0}</span>
          </div>
          <div className='flex gap-1 items-center text-sm text-gray-600' title='Sub-tasks'>
            <FaList />
            <span>
              {task?.subTasks?.filter(st => st.completed)?.length || 0}/
              {task?.subTasks?.length || 0}
            </span>
          </div>
        </div>
      </td>

      <td className='py-3 px-4'>
        <div className='flex'>
          {task?.team?.map((member, index) => (
            <div
              key={member._id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
              title={member.name}
            >
              <UserInfo user={member} />
            </div>
          ))}
        </div>
      </td>

      <td className='py-3 px-4'>
        <div className='flex gap-2 md:gap-4 justify-end'>
          <TaskDialog
            task={task}
            refetchTasks={refetchTasks}
          />

          <Button
            className='text-red-700 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm md:text-base transition-colors'
            label={loading ? 'Deleting...' : 'Delete'}
            type='button'
            onClick={() => deleteClicks(task._id)}
            disabled={loading}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className='bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded'>
        <div className='overflow-x-auto'>
          {tasks?.length > 0 ? (
            <table className='w-full min-w-[800px]'>
              <TableHeader />
              <tbody>
                {tasks.map((task) => (
                  <TableRow key={task._id} task={task} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              No tasks found
            </div>
          )}
        </div>
      </div>

      <ConfirmatioDialog
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

export default Table;