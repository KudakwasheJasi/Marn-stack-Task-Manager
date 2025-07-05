import Task from '../models/task.js';
import User from '../models/User.js';

export const getDashboardData = async (req, res) => {
    try {
        // Get last 10 tasks
        const last10Tasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('team')
            .populate('user');

        // Get user statistics
        const users = await User.find();
        const totalUsers = users.length;

        // Get task statistics
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ stage: 'completed' });
        const inProgressTasks = await Task.countDocuments({ stage: 'in progress' });
        const todoTasks = await Task.countDocuments({ stage: 'todo' });

        res.status(200).json({
            last10Tasks,
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            users,
            totalUsers
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
