import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { toast } from 'sonner';
import { useState } from 'react';
import { createTask } from '../../services/api';
import { useRef } from 'react';

const AddTask = ({ open, setOpen, refreshTasks }) => {
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            title: '',
            date: '',
            tag: '',
        }
    });

    const watchedDate = watch('date');

    const validateDate = (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today || "Due date cannot be in the past";
    };

    const handleOnSubmit = async (data) => {
        try {
            setLoading(true);
            
            const taskData = {
                title: data.title.trim(),
                date: new Date(data.date).toISOString(),
                priority: "normal",
                stage: "todo",
                team: [localStorage.getItem('userId')],
                activities: [
                    {
                        type: "assigned",
                        activity: "Task created",
                        by: localStorage.getItem('userId')
                    }
                ]
            };

            await createTask(taskData);
            toast.success('Task created successfully');
            
            // Play sound notification
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(error => console.error('Error playing sound:', error));
            }
            
            // Close modal and reset form first
            setOpen(false);
            reset();
            
            // Refresh tasks list
            if (typeof refreshTasks === 'function') {
                await refreshTasks();
            }

        } catch (error) {
            console.error('Task creation error:', error);
            toast.error('Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
          <audio ref={audioRef} src="/alarm-sound.mp3" preload="auto" />
          <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='space-y-6'>
                <Dialog.Title
                    as='h2'
                    className='text-base font-bold leading-6 text-gray-900'
                >
                    ADD TASK
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
                        error={errors.title ? errors.title.message : ""}
                    />

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Textbox
                            placeholder='Select due date'
                            type='date'
                            name='date'
                            label='Due Date'
                            className='w-full rounded'
                            register={register("date", {
                                required: "Due date is required",
                                validate: validateDate
                            })}
                            error={errors.date ? errors.date.message : ""}
                            min={new Date().toISOString().split('T')[0]}
                        />

                        <Textbox
                            placeholder='Enter tag (e.g., urgent, review)'
                            type='text'
                            name='tag'
                            label='Tag'
                            className='w-full rounded'
                            register={register("tag", {
                                required: "Tag is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9-_]+$/,
                                    message: "Tag can only contain letters, numbers, hyphens and underscores"
                                },
                                maxLength: {
                                    value: 20,
                                    message: "Tag must not exceed 20 characters"
                                }
                            })}
                            error={errors.tag ? errors.tag.message : ""}
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
                        label={loading ? 'Creating...' : 'Create Task'}
                        disabled={loading}
                    />
                </div>
            </form>
        </ModalWrapper>
        </>
    );
};

export default AddTask;