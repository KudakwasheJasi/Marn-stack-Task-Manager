import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { updateTask } from '../../services/api';

const EditTask = ({ open, setOpen, task, refreshTasks }) => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        getValues,
    } = useForm({
        defaultValues: {
            title: '',
            date: '',
            priority: 'normal',
            stage: 'todo'
        }
    });

    useEffect(() => {
        if (task) {
            setValue('title', task.title || '');
            setValue('date', task.date || '');
            setValue('priority', task.priority || 'normal');
            setValue('stage', task.stage || 'todo');
            setInitialLoading(false);
        } else {
            reset();
        }
    }, [task, setValue, reset]);



    const handleOnSubmit = async (data) => {
        try {
            setLoading(true);
            
            const taskData = {
                title: data.title.trim(),
                date: new Date(data.date).toISOString(),
                priority: data.priority,
                stage: data.stage
            };

            await updateTask(task._id, taskData);
            toast.success('Task updated successfully');
            
            // Close modal and reset form first
            setOpen(false);
            reset();
            
            // Then refresh tasks
            if (refreshTasks) refreshTasks();

        } catch (error) {
            console.error('Task update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading || !task) {
        return null;
    }

    return (
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='space-y-6'>
                <Dialog.Title
                    as='h2'
                    className='text-base font-bold leading-6 text-gray-900'
                >
                    EDIT TASK
                </Dialog.Title>

                <div className='space-y-4'>
                    <Textbox
                        placeholder='Enter task title'
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
                    />

                    <Textbox
                        placeholder='Select due date'
                        type='date'
                        name='date'
                        label='Due Date'
                        className='w-full rounded'
                        register={register("date", {
                            required: "Due date is required",
                            validate: (date) => {
                             const selectedDate = new Date(date);
                             const today = new Date();
                             return selectedDate >= today || 'Due date must be today or later';
                         }
                        })}
                    />

                    <select
                        {...register("priority")}
                        className="w-full p-2 border rounded"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                    <div className="space-y-4">
                        <select
                            {...register("stage")}
                            className="w-full p-2 border rounded"
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        <div className="flex items-center space-x-4">
                            <Button
                                type="button"
                                onClick={() => {
                                    setValue('stage', 'completed');
                                    handleOnSubmit({
                                        title: getValues('title'),
                                        date: getValues('date'),
                                        priority: getValues('priority'),
                                        stage: 'completed'
                                    });
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                label="Mark as Done"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                reset();
                            }}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default EditTask;
