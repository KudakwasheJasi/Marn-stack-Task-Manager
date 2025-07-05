import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { MdCheck, MdError } from "react-icons/md";
import clsx from "clsx";
import { getInitials } from "../../utils";
import { toast } from "sonner";

const UserList = ({ setTeam, team, disabled = false, error }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://marn-stack-task-manager.onrender.com/api/users');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions);
    // Map selected users to array of IDs for parent component
    setTeam(selectedOptions?.map((user) => user._id));
  };

  useEffect(() => {
    if (users.length > 0) {
      if (!team || team.length < 1) {
        // Set default selection to first user if no team specified
        setSelectedUsers([users[0]]);
      } else if (Array.isArray(team)) {
        // Find full user objects for team IDs
        const selectedTeamMembers = users.filter(user => 
          team.some(memberId => memberId === user._id)
        );
        setSelectedUsers(selectedTeamMembers);
      }
    }
  }, [team, users]);

  return (
    <div className="space-y-1">
      <p className={clsx(
        'text-sm font-medium',
        error ? 'text-red-600' : 'text-gray-700'
      )}>
        Assign Task To:
      </p>
      
      <Listbox
        value={selectedUsers}
        onChange={handleChange}
        multiple
        disabled={disabled || loading}
      >
        <div className='relative mt-1'>
          <Listbox.Button 
            className={clsx(
              'relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left px-3 py-2.5 2xl:py-3 border sm:text-sm',
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              disabled && 'bg-gray-50 cursor-not-allowed opacity-75',
              loading && 'animate-pulse'
            )}
          >
            <span className='block truncate'>
              {loading 
                ? 'Loading users...' 
                : selectedUsers?.length > 0
                  ? selectedUsers.map(user => user.name).join(", ")
                  : 'Select team members'
              }
            </span>

            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <BsChevronExpand
                className={clsx(
                  'h-5 w-5',
                  error ? 'text-red-400' : 'text-gray-400'
                )}
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'>
              {loading ? (
                <div className="py-2 px-3 text-gray-500 text-center">
                  Loading users...
                </div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <Listbox.Option
                    key={user._id}
                    className={({ active }) =>
                      clsx(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                      )
                    }
                    value={user}
                  >
                    {({ selected, active }) => (
                      <>
                        <div
                          className={clsx(
                            "flex items-center gap-2 truncate",
                            selected ? "font-medium" : "font-normal"
                          )}
                        >
                          <div className={clsx(
                            'w-6 h-6 rounded-full text-white flex items-center justify-center',
                            active ? 'bg-blue-600' : 'bg-violet-600'
                          )}>
                            <span className='text-center text-[10px]'>
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <span>{user.name}</span>
                        </div>
                        {selected && (
                          <span className={clsx(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-blue-600' : 'text-violet-600'
                          )}>
                            <MdCheck className='h-5 w-5' aria-hidden='true' />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <div className="py-2 px-3 text-gray-500 text-center">
                  No users available
                </div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 mt-1">
          <MdError className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default UserList;