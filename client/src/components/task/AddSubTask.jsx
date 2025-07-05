import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { toast } from 'sonner';
import { useState, useCallback, useEffect } from 'react';
import { createTask } from '../../services/api';

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
      dueDate: '',
      parentId: null
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
        parentId: id,
        status: 'todo'
      };

      await createTask(subtaskData);
      toast.success('Sub-task created successfully');
      reset();
      
      // Show notification and play sound
      showNotification("Sub-task Created", "A new sub-task has been created!");
      
      const audio = new Audio('/alarm-sound.mp3');
      audio.play().catch(error => console.error('Error playing sound:', error));

      if (refetchTasks) {
        await refetchTasks();
      }
      
      setOpen(false);

    } catch (error) {
      console.error('Subtask creation error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to create sub-task. Please try again.'
      );
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
    <>

      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className='space-y-6'>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900'
          >
            ADD SUB-TASK
          </Dialog.Title>

        <div className='space-y-4'>
          <Textbox
            placeholder='Enter sub-task title'
            type='text'
            name='title'
            label='Title'
            className='w-full rounded'
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
            error={errors.title ? errors.title.message : ""}
          />

          <Textbox
            placeholder='Enter description'
            type='text'
            name='description'
            label='Description'
            className='w-full rounded'
            register={register("description", {
              required: "Description is required"
            })}
            error={errors.description ? errors.description.message : ""}
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
              error={errors.dueDate ? errors.dueDate.message : ""}
              min={new Date().toISOString().split('T')[0]}
            />

            <Textbox
              placeholder='Enter priority (low, medium, high)'
              type='text'
              name='priority'
              label='Priority'
              className='w-full rounded'
              register={register("priority", {
                required: "Priority is required",
                pattern: {
                  value: /^(low|medium|high)$/i,
                  message: "Priority must be low, medium, or high"
                }
              })}
              error={errors.priority ? errors.priority.message : ""}
            />
          </div>
        </div>

        <div className='flex justify-end gap-3'>
          <Button
            type='button'
            className='bg-white border text-sm font-semibold text-gray-900 px-4 py-2 rounded hover:bg-gray-50'
            onClick={() => {
              reset();
              setOpen(false);
            }}
            label='Cancel'
            disabled={loading}
          />

          <Button
            type='submit'
            className='bg-blue-600 text-sm font-semibold text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
            label={loading ? 'Creating...' : 'Create Sub-task'}
            disabled={loading}
          />
        </div>
      </form>
    </ModalWrapper>
    </>
  );
};

export default AddSubTask;