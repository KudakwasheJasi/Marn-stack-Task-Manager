import { useForm } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { toast } from 'sonner';
import { useState, useCallback, useEffect, Fragment } from 'react';
import { addSubtask } from '../../services/api';

const AddSubTask = ({ open, setOpen, id, refetchTasks }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'low',
      dueDate: new Date().toISOString().split('T')[0]
    }
  });

  const validateDate = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today || "Due date cannot be in the past";
  };

  const handleOnSubmit = async (data) => {
    if (!id) {
      toast.error('Parent task ID is required');
      return;
    }

    try {
      setLoading(true);
      
      const subtaskData = {
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority.toLowerCase(),
        dueDate: new Date(data.dueDate).toISOString(),
        status: 'todo'
      };

      const response = await addSubtask(id, subtaskData);
      
      if (response.data) {
        toast.success('Subtask added successfully');
        setOpen(false);
        reset();
        
        if (typeof refetchTasks === 'function') {
          await refetchTasks();
        }
      } else {
        toast.error('Failed to add subtask');
      }
    } catch (error) {
      console.error('Add subtask error:', error);
      toast.error(error.response?.data?.message || 'Failed to add subtask');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Transition
      show={open}
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          if (ref?.current) {
            ref.current.focus();
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as='h2'
                      className='text-base font-bold leading-6 text-gray-900'
                    >
                      Add Subtask
                    </Dialog.Title>

                    <form onSubmit={handleSubmit(handleOnSubmit)} className="space-y-4">
                      <Textbox
                        placeholder="Enter sub-task title"
                        type="text"
                        name="title"
                        label="Title"
                        className="w-full rounded"
                        register={register("title", {
                            required: "Title is required",
                            minLength: {
                                value: 3,
                                message: "Title must be at least 3 characters"
                            },
                            maxLength: {
                                value: 100,
                                message: "Title must not exceed 100 characters"
                            }
                        })}
                        error={errors.title?.message}
                      />

                      <Textbox
                        placeholder='Enter description'
                        type='text'
                        name='description'
                        label='Description'
                        className='w-full rounded'
                        register={register("description", {
                            maxLength: {
                                value: 255,
                                message: "Description must not exceed 255 characters"
                            }
                        })}
                        error={errors.description?.message}
                      />

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Textbox
                            placeholder='Select due date'
                            type='date'
                            name='dueDate'
                            label='Due Date'
                            className='w-full rounded'
                            register={register("dueDate", {
                                required: "Due date is required",
                                validate: validateDate
                            })}
                            error={errors.dueDate?.message}
                            min={new Date().toISOString().split('T')[0]}
                        />

                        <select
                            {...register("priority", {
                                required: "Priority is required",
                                validate: (value) => {
                                    if (!['low', 'medium', 'high'].includes(value.toLowerCase())) {
                                        return "Priority must be low, medium, or high";
                                    }
                                    return true;
                                }
                            })}
                            className='w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        >
                          <option value='low'>Low</option>
                          <option value='medium'>Medium</option>
                          <option value='high'>High</option>
                        </select>
                      </div>

                      <div className='flex justify-end space-x-3'>
                        <Button
                          type='button'
                          label='Cancel'
                          onClick={() => setOpen(false)}
                          variant='secondary'
                        />

                        <Button
                          type='submit'
                          label={loading ? 'Adding...' : 'Add Subtask'}
                          disabled={loading}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddSubTask;
