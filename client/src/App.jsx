/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 21:52:12
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar.tsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskDetails from "./components/task/TaskDetails";
import Tasks from "./pages/Tasks";
import Trash from "./pages/Trash";
import Users from "./pages/Users";
import Dashboard from "./pages/dashboard";
import { setOpenSidebar } from "./redux/slices/authSlice";
import MobileSidebar from "./components/MobileSidebar";
import Settings from "./pages/Settings";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Component (accessible only when not logged in)
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  }

  return children;
};

function Layout() {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.auth.isSidebarOpen);

  const handleSidebarToggle = () => {
    dispatch(setOpenSidebar(!isSidebarOpen));
  };

  return (
    <div className='w-full h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900'>
      <MobileSidebar />
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />
      <div className='flex-1 overflow-y-auto'>
        <Navbar onToggleSidebar={handleSidebarToggle} />
        <div className='p-4 2xl:px-10'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/status/:status" element={<Tasks />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/tasks/:taskId/subtask" element={<TaskDetails />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <Toaster
        richColors
        position="top-right"
        theme="light"
        duration={4000}
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #E2E8F0',
            color: '#1F2937'
          },
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
    </div>
  );
}

export default App;