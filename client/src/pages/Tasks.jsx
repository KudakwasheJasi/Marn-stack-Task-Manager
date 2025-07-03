import React, { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import { getTasks, checkServerHealth } from '../services/api';

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const Tasks = () => {
  const params = useParams();
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const status = params?.status || "";

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkConnection = async () => {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const isHealthy = await checkServerHealth();
        if (isHealthy) return true;
        await delay(RETRY_DELAY);
      } catch (err) {
        console.log(`Connection check attempt ${i + 1} failed`);
        if (i < MAX_RETRIES - 1) await delay(RETRY_DELAY);
      }
    }
    return false;
  };

  const refreshTasks = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
        setError(null);
      }

      // Check server connection
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }

      // Fetch tasks
      const data = await getTasks();
      if (!data) {
        throw new Error('No data received from server');
      }

      // Process tasks data
      const tasksArray = Array.isArray(data) ? data : 
                        data?.tasks ? data.tasks :
                        data?.data ? data.data : [];
      
      setTasks(tasksArray);
      setError(null);
      setIsRetrying(false);
      setRetryCount(0);

      if (showLoadingState) {
        toast.success('Tasks loaded successfully');
      }

    } catch (err) {
      const errorMessage = err.message || 'Error fetching tasks';
      console.error('RefreshTasks Error:', err);
      setError(errorMessage);
      setTasks([]);
      
      toast.error('Connection Error', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimeout;

    const loadTasks = async () => {
      if (!mounted) return;
      
      try {
        await refreshTasks();
      } catch (error) {
        console.error('Initial load error:', error);
        if (mounted && retryCount < MAX_RETRIES) {
          retryTimeout = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadTasks();
          }, RETRY_DELAY);
        }
      }
    };

    loadTasks();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      toast.loading(`Attempting to reconnect... (${retryCount + 1}/${MAX_RETRIES})`);
      await refreshTasks(true);
      toast.success('Connection restored!');
    } catch (error) {
      if (retryCount >= MAX_RETRIES - 1) {
        toast.error('Connection failed', {
          description: 'Maximum retry attempts reached. Please try again later.',
        });
      } else {
        toast.error('Connection failed', {
          description: `Retrying in ${RETRY_DELAY/1000} seconds...`,
        });
        setTimeout(handleRetry, RETRY_DELAY);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return (
      <div className="w-full py-10 text-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            Please verify:
            <ul className="list-disc text-left pl-5 mt-2">
              <li>The server is running on port 8000</li>
              <li>Your database connection is active</li>
              <li>Your network connection is stable</li>
            </ul>
          </div>
          <button 
            onClick={handleRetry}
            disabled={isRetrying}
            className={`mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
              flex items-center justify-center mx-auto gap-2`}
          >
            {isRetrying ? (
              <>
                <span className="animate-spin">↻</span>
                Retrying...
              </>
            ) : (
              'Retry Connection'
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Attempt {retryCount}/{MAX_RETRIES}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='py-10'>
        <Loading />
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title title={status ? `${status} Tasks` : "Tasks"} />
        
        {!status && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                toast.promise(refreshTasks(true), {
                  loading: 'Refreshing tasks...',
                  success: 'Tasks refreshed successfully',
                  error: 'Failed to refresh tasks'
                });
              }}
              label='Refresh'
              icon={<span className="text-lg">↻</span>}
              className='flex flex-row-reverse gap-1 items-center bg-gray-600 text-white rounded-md py-2'
            />
            <Button
              onClick={() => setOpen(true)}
              label='Create Task'
              icon={<IoMdAdd className='text-lg' />}
              className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
            />
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No tasks found. Create a new task to get started!
        </div>
      ) : (
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!status && (
            <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
              <TaskTitle label='To Do' className={TASK_TYPE.todo} />
              <TaskTitle label='In Progress' className={TASK_TYPE["in progress"]} />
              <TaskTitle label='Completed' className={TASK_TYPE.completed} />
            </div>
          )}

          {selected !== 1 ? (
            <BoardView tasks={tasks} refreshTasks={refreshTasks} />
          ) : (
            <div className='w-full'>
              <Table tasks={tasks} refreshTasks={refreshTasks} />
            </div>
          )}
        </Tabs>
      )}

      <AddTask 
        open={open} 
        setOpen={setOpen} 
        refreshTasks={refreshTasks} 
      />
    </div>
  );
};

export default Tasks;