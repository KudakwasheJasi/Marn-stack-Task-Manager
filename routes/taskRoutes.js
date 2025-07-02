/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 01/07/2025 - 16:00:55
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 01/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
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

// Create subtask for a task
router.post("/:id/subtasks", protectRoute, async (req, res) => {
  const taskId = req.params.id;
  try {
    const { title, description, priority, dueDate, status } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ status: false, message: "Title is required" });
    }
    
    // Validate due date
    let parsedDueDate;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ 
          status: false, 
          message: "Invalid due date format" 
        });
      }
    }
    
    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    
    // Add subtask with proper date handling
    const subtask = {
      title,
      description,
      priority,
      status,
      createdBy: req.user._id,
      createdAt: new Date(),
      dueDate: parsedDueDate ? parsedDueDate : undefined
    };
    
    task.subTasks.push(subtask);
    await task.save();

    // Return the created subtask with status and data
    res.status(201).json({
      status: true,
      message: "Subtask created successfully",
      data: {
        subtask,
        task: task.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Edit (update) a task
router.put("/:id", protectRoute, async (req, res) => {
    const taskId = req.params.id;
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $set: req.body },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }
        res.status(200).json({
            status: true,
            message: "Task updated successfully",
            task: updatedTask
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
});

export default router;