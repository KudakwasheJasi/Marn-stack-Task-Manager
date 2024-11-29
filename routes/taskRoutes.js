import express from "express";
import { protectRoute } from "../middlewares/authMiddlewave.js";
import Task from "../models/task.js";

const router = express.Router();

// GET all tasks
router.get("/", protectRoute, async (req, res) => {
    try {
        console.log('Fetching all tasks');
        
        const tasks = await Task.find({ isTrashed: false })
            .populate("team", "name email")
            .populate("activities.by", "name email");

        console.log('Found tasks:', tasks.length);
        
        res.json({
            status: true,
            tasks
        });
    } catch (error) {
        console.error("Get tasks error:", error);
        res.status(500).json({
            status: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

// POST route for creating tasks
router.post("/create", protectRoute, async (req, res) => {
    try {
        console.log('Creating task with data:', req.body);
        console.log('User ID:', req.user.userId);

        const { title, description, priority, stage, team } = req.body;

        if (!title) {
            return res.status(400).json({
                status: false,
                message: "Title is required"
            });
        }

        const taskData = {
            title,
            description,
            priority: priority || 'medium',
            stage: stage || 'todo',
            team: team || [req.user.userId],
            createdBy: req.user.userId,
            activities: [{
                type: "created",
                activity: "Task created",
                by: req.user.userId,
                date: new Date()
            }]
        };

        console.log('Creating task with:', taskData);

        const task = new Task(taskData);
        await task.save();

        console.log('Task saved with ID:', task._id);

        const populatedTask = await Task.findById(task._id)
            .populate("team", "name email")
            .populate("activities.by", "name email");

        console.log('Populated task:', populatedTask);

        res.status(201).json({
            status: true,
            message: "Task created successfully",
            task: populatedTask
        });
    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({
            status: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
            details: process.env.NODE_ENV === 'production' ? null : {
                name: error.name,
                code: error.code,
                keyPattern: error.keyPattern,
                keyValue: error.keyValue
            }
        });
    }
});

// DELETE route for deleting a task by ID
router.delete("/:id", protectRoute, async (req, res) => {
    const taskId = req.params.id;
    try {
        const result = await Task.findByIdAndDelete(taskId);
        if (!result) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error("Delete task error:", error);
        res.status(500).json({
            status: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

export default router;