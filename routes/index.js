import express from "express";
import taskRoutes from "./taskRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

// Add test route
router.get('/test-routes', (req, res) => {
    res.json({ message: 'Routes are connected' });
});

router.use("/tasks", taskRoutes);  // Changed from /task to /tasks
router.use("/users", userRoutes);  // Changed from /user to /users
router.use("/auth", authRoutes);

export default router;