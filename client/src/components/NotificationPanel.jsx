/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 18:12:15
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import { Popover, Transition } from "@headlessui/react";
import moment from "moment";
import { Fragment, useState, useEffect } from "react";
import { BiSolidMessageRounded } from "react-icons/bi";
import { HiBellAlert } from "react-icons/hi2";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaTasks, FaTrash, FaCopy, FaEdit, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getNotifications, markNotificationRead } from "../services/api";

const ICONS = {
  alert: (
    <HiBellAlert className='h-5 w-5 text-gray-600 group-hover:text-indigo-600' />
  ),
  message: (
    <BiSolidMessageRounded className='h-5 w-5 text-gray-600 group-hover:text-indigo-600' />
  ),
  task_created: (
    <FaTasks className='h-5 w-5 text-green-600 group-hover:text-green-700' />
  ),
  task_deleted: (
    <FaTrash className='h-5 w-5 text-red-600 group-hover:text-red-700' />
  ),
  task_duplicated: (
    <FaCopy className='h-5 w-5 text-blue-600 group-hover:text-blue-700' />
  ),
  task_updated: (
    <FaEdit className='h-5 w-5 text-yellow-600 group-hover:text-yellow-700' />
  ),
  subtask_created: (
    <FaPlus className='h-5 w-5 text-purple-600 group-hover:text-purple-700' />
  ),
};

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications when component mounts or when opened
  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open, user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching notifications for user:', user?._id);
      const response = await getNotifications();
      console.log('Notifications response:', response);
      // The backend sends notifications directly, not wrapped in data property
      setNotifications(response || []);
      console.log('Set notifications:', response?.length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const readHandler = async (type, id) => {
    try {
      await markNotificationRead(type, id);
      // Refresh notifications after marking as read
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const viewHandler = (item) => {
    // Mark notification as read when viewed
    if (!item.isRead?.includes(user?._id)) {
      readHandler('single', item._id);
    }
    
    // Navigate to task if it exists
    if (item.task) {
      window.location.href = `/task/${item.task._id}`;
    }
  };

  const callsToAction = [
    { name: "Cancel", href: "#", icon: "" },
    {
      name: "Mark All Read",
      href: "#",
      icon: "",
      onClick: () => readHandler("all", ""),
    },
  ];

  return (
    <>
      <Popover className='relative'>
        <Popover.Button className='inline-flex items-center outline-none'>
          <div className='w-8 h-8 flex items-center justify-center text-gray-800 relative'>
            <IoIosNotificationsOutline className='text-2xl' />
            {notifications?.length > 0 && (
              <span className='absolute text-center top-0 right-1 text-sm text-white font-semibold w-4 h-4 rounded-full bg-red-600'>
                {notifications?.length}
              </span>
            )}
          </div>
        </Popover.Button>

        <Transition
          as={Fragment}
          enter='transition ease-out duration-200'
          enterFrom='opacity-0 translate-y-1'
          enterTo='opacity-100 translate-y-0'
          leave='transition ease-in duration-150'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-1'
        >
          <Popover.Panel className='absolute -right-16 md:-right-2 z-10 mt-5 flex w-screen max-w-max  px-4'>
            {({ close }) =>
              notifications?.length > 0 ? (
                <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5'>
                  <div className='p-4'>
                    {loading ? (
                      <div className='flex items-center justify-center py-8'>
                        <div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                        <span className='ml-2 text-gray-600'>Loading notifications...</span>
                      </div>
                    ) : (
                      notifications?.slice(0, 5).map((item, index) => (
                        <div
                          key={item._id + index}
                          className='group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50 cursor-pointer'
                          onClick={() => viewHandler(item)}
                        >
                          <div className='mt-1 h-8 w-8 flex items-center justify-center rounded-lg bg-gray-200 group-hover:bg-white'>
                            {ICONS[item.notiType] || ICONS.alert}
                          </div>

                          <div className='flex-1'>
                            <div className='flex items-center gap-3 font-semibold text-gray-900 capitalize'>
                              <p>{item.notiType?.replace('_', ' ')}</p>
                              <span className='text-xs font-normal lowercase'>
                                {moment(item.createdAt).fromNow()}
                              </span>
                            </div>
                            <p className='line-clamp-2 mt-1 text-gray-600'>
                              {item.text}
                            </p>
                            {item.createdBy && (
                              <p className='text-xs text-gray-500 mt-1'>
                                By: {item.createdBy.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {notifications?.length > 5 && (
                      <div className='text-center py-2 text-sm text-gray-500'>
                        +{notifications.length - 5} more notifications
                      </div>
                    )}
                  </div>
                  
                  <div className='bg-gray-50 px-4 py-3 flex justify-between'>
                    {callsToAction.map((item) => (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className='text-sm font-semibold text-gray-900 hover:text-indigo-600'
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5'>
                  <div className='p-8 text-center'>
                    <IoIosNotificationsOutline className='mx-auto h-12 w-12 text-gray-400' />
                    <h3 className='mt-2 text-sm font-semibold text-gray-900'>No notifications</h3>
                    <p className='mt-1 text-sm text-gray-500'>You're all caught up!</p>
                  </div>
                </div>
              )
            }
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  );
};

export default NotificationPanel;