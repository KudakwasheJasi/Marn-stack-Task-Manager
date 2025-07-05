import { Popover, Transition } from "@headlessui/react";
import moment from "moment";
import { Fragment, useState, useEffect } from "react";
import { BiSolidMessageRounded } from "react-icons/bi";
import { HiBellAlert } from "react-icons/hi2";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link } from "react-router-dom";

const data = [
  {
    _id: "kudakwashe01",
    team: ["user01", "user02", "user03"],
    text: "A new feature has been assigned to you and your team. The task priority is set to high, with a due date of Wed Nov 29 2024. Please review and take necessary action.",
    task: {
      _id: "task01",
      title: "Develop New User Dashboard",
    },
    notiType: "alert",
    isRead: [],
    createdAt: "2024-11-20T10:15:00.000Z",
    updatedAt: "2024-11-20T10:15:00.000Z",
    __v: 0,
  },
  {
    _id: "kudakwashe02",
    team: ["user01", "user04", "user05"],
    text: "Your meeting with the project stakeholders is scheduled for Thu Nov 23 2024 at 2:00 PM. Please prepare and attend promptly.",
    task: null,
    notiType: "message",
    isRead: [],
    createdAt: "2024-11-21T14:00:00.000Z",
    updatedAt: "2024-11-21T14:00:00.000Z",
    __v: 0,
  },
];

const ICONS = {
  alert: (
    <HiBellAlert className='h-5 w-5 text-gray-600 group-hover:text-indigo-600' />
  ),
  message: (
    <BiSolidMessageRounded className='h-5 w-5 text-gray-600 group-hover:text-indigo-600' />
  ),
};

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const alarmSound = new Audio('./alarm-sound.mp3'); // Using relative path

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const readHandler = () => {};
  const viewHandler = (item) => {
    // Handle viewing the notification
    console.log("Viewing notification:", item);
  };

  const handleTaskCreated = () => {
    showNotification("Task Created", "A new task has been created!");
    alarmSound.play();
  };

  const handleTaskDeleted = () => {
    showNotification("Task Deleted", "A task has been deleted!");
    alarmSound.play();
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
            {data?.length > 0 && (
              <span className='absolute text-center top-0 right-1 text-sm text-white font-semibold w-4 h-4 rounded-full bg-red-600'>
                {data?.length}
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
              data?.length > 0 && (
                <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5'>
                  <div className='p-4'>
                    {data?.slice(0, 5).map((item, index) => (
                      <div
                        key={item._id + index}
                        className='group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50'
                      >
                        <div className='mt-1 h-8 w-8 flex items-center justify-center rounded-lg bg-gray-200 group-hover:bg-white'>
                          {ICONS[item.notiType]}
                        </div>

                        <div
                          className='cursor-pointer'
                          onClick={() => viewHandler(item)}
                        >
                          <div className='flex items-center gap-3 font-semibold text-gray-900 capitalize'>
                            <p> {item.notiType}</p>
                            <span className='text-xs font-normal lowercase'>
                              {moment(item.createdAt).fromNow()}
                            </span>
                          </div>
                          <p className='line-clamp-1 mt-1 text-gray-600'>
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='grid grid-cols-2 divide-x bg-gray-50'>
                    {callsToAction.map((item) => (
                      <Link
                        key={item.name}
                        onClick={
                          item?.onClick ? () => item.onClick() : () => close()
                        }
                        className='flex items-center justify-center gap-x-2.5 p-3 font-semibold text-blue-600 hover:bg-gray-100'
                      >
                        {item.name}
                      </Link>
                    ))}
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