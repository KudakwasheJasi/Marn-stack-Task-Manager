import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskDetails from "./pages/TaskDetails";
import Tasks from "./pages/Tasks";
import Trash from "./pages/Trash";
import Users from "./pages/Users";
import Dashboard from "./pages/dashboard";
import { setOpenSidebar } from "./redux/slices/authSlice";

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
    <div className='w-full h-screen flex flex-col md:flex-row'>
      <Transition
        show={isSidebarOpen}
        enter="transition-all duration-300"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-all duration-300"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg md:static md:inset-0 md:translate-x-0">
          <Sidebar />
        </div>
      </Transition>

      <div className='flex-1 overflow-y-auto'>
        <Navbar onToggleSidebar={handleSidebarToggle} />
        <div className='p-4 2xl:px-10'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const MobileSidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.auth);
  const mobileMenuRef = useRef(null);
  const dispatch = useDispatch();

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  return (
    <>
      <Transition
        show={isSidebarOpen}
        as={Fragment}
        enter='transition-opacity duration-700'
        enterFrom='opacity-x-10'
        enterTo='opacity-x-100'
        leave='transition-opacity duration-700'
        leaveFrom='opacity-x-100'
        leaveTo='opacity-x-0'
      >
        {(ref) => (
          <div
            ref={(node) => (mobileMenuRef.current = node)}
            className={clsx(
              "md:hidden w-full h-full bg-black/40 fixed top-0 left-0 transition-all duration-700 transform",
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={closeSidebar}
          >
            <div 
              className='bg-white w-3/4 h-full ml-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='w-full flex justify-end px-5 mt-5'>
                <button
                  onClick={closeSidebar}
                  className='flex justify-end items-end hover:text-gray-600 transition-colors'
                >
                  <IoClose size={25} />
                </button>
              </div>

              <div className='-mt-10'>
                <Sidebar />
              </div>
            </div>
          </div>
        )}
      </Transition>
    </>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
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
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/users" element={<Users />} />
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