import Task from '../models/task.js';
import User from '../models/User.js';

export const getDashboardData = async (req, res) => {
    try {
        // Get last 10 tasks with proper population
        const last10Tasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('team')
            .populate('createdBy')
            .populate('subTasks.createdBy');

        // Get user statistics
        const users = await User.find();
        const totalUsers = users.length;

        // Get task statistics
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ stage: 'completed' });
        const inProgressTasks = await Task.countDocuments({ stage: 'in progress' });
        const todoTasks = await Task.countDocuments({ stage: 'todo' });

        // Transform tasks to include user names
        const transformedTasks = last10Tasks.map(task => ({
            ...task.toObject(),
            createdBy: task.createdBy ? {
                id: task.createdBy._id,
                name: task.createdBy.name,
                email: task.createdBy.email
            } : null,
            team: task.team.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email
            })),
            subTasks: task.subTasks.map(subTask => ({
                ...subTask.toObject(),
                createdBy: subTask.createdBy ? {
                    id: subTask.createdBy._id,
                    name: subTask.createdBy.name,
                    email: subTask.createdBy.email
                } : null
            }))
        }));

        res.status(200).json({
            last10Tasks: transformedTasks,
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            users,
            totalUsers
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dashboard data',
            details: error.message 
        });
    }
};
