import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import Textbox from "../Textbox";
import Button from "../Button";
import { toast } from 'sonner';
import { createTask } from '../../services/api';
import { MdKeyboardArrowLeft } from "react-icons/md";

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSubtaskForm, setShowSubtaskForm] = useState(false);

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
        }
    });

    const validateDate = (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today || "Due date cannot be in the past";
    };

    useEffect(() => {
        // Fetch task details here
        setLoading(false);
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleOnSubmit = async (data) => {
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
            setShowSubtaskForm(false);
            
            // Refresh task details
            // This would typically fetch updated task data
            
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

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    type="button"
                    className="bg-white border text-sm font-semibold text-gray-900 px-4 py-2 rounded hover:bg-gray-50"
                    onClick={handleBack}
                    label={<MdKeyboardArrowLeft className="mr-2" />}
                >
                    Back
                </Button>
                <h2 className="text-xl font-bold">Task Details</h2>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                {/* Task details will go here */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">Title</h3>
                        <p className="text-gray-600">{task?.title}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Description</h3>
                        <p className="text-gray-600">{task?.description}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Sub-tasks</h3>
                    <Button
                        type="button"
                        className="bg-purple-600 text-sm font-semibold text-white px-4 py-2 rounded hover:bg-purple-700"
                        onClick={() => setShowSubtaskForm(true)}
                        label="Add Sub-task"
                    />
                </div>

                {showSubtaskForm && (
                    <form onSubmit={handleSubmit(handleOnSubmit)} className='space-y-6'>
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
                                    setShowSubtaskForm(false);
                                }}
                                label='Cancel'
                                disabled={loading}
                            />

                            <Button
                                type='submit'
                                className='bg-purple-600 text-sm font-semibold text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50'
                                label={loading ? 'Creating...' : 'Create Sub-task'}
                                disabled={loading}
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
