/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 01/07/2025 - 20:46:24
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 01/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  addTeamMember,
  removeTeamMember,
} from "../controllers/userController.js";
import Notice from "../models/notification.js";
import User from "../models/User.js";

const router = express.Router();

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", protectRoute, isAdminRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);

// Profile image upload endpoint
router.post("/upload-profile-image", protectRoute, (req, res, next) => {
  console.log("Upload endpoint hit - checking directory:", uploadsDir);
  console.log("Directory exists:", fs.existsSync(uploadsDir));
  console.log("Directory is writable:", fs.accessSync ? (() => {
    try { fs.accessSync(uploadsDir, fs.constants.W_OK); return true; } catch { return false; }
  })() : 'Cannot check');
  
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        status: false,
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : 'File upload error'
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        status: false,
        message: err.message || 'File upload error'
      });
    }
    
    // Continue to the main handler
    next();
  });
}, async (req, res) => {
  try {
    console.log("Upload request received:", {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename,
        path: req.file.path
      } : null,
      user: req.user ? req.user._id : null,
      headers: req.headers
    });

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No image file provided"
      });
    }

    // Verify file was actually saved
    if (!fs.existsSync(req.file.path)) {
      console.error("File was not saved to disk:", req.file.path);
      return res.status(500).json({
        status: false,
        message: "Failed to save file to disk"
      });
    }

    // Create the image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    console.log("Image uploaded successfully:", {
      filename: req.file.filename,
      imageUrl: imageUrl,
      filePath: req.file.path,
      fileExists: fs.existsSync(req.file.path)
    });

    res.json({
      status: true,
      message: "Profile image uploaded successfully",
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to upload profile image",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint to create a notification manually
router.post("/test-notification", protectRoute, async (req, res) => {
  try {
    const { userId } = req.user;
    console.log('Creating test notification for user:', userId);
    
    // Clear old test notifications first
    await Notice.deleteMany({
      team: [userId],
      "metadata.action": { $regex: /^test_/ }
    });
    
    const timestamp = Date.now();
    const testNotification = await Notice.create({
      team: [userId],
      text: `This is a test notification to verify the system is working (${timestamp})`,
      notiType: "alert",
      createdBy: userId,
      notificationId: `test_${timestamp}`,
      metadata: {
        action: `test_${timestamp}`, // Make action unique each time
        taskTitle: "Test Task",
        priority: "medium",
        stage: "todo"
      }
    });
    
    console.log('Test notification created:', testNotification._id);
    res.json({ status: true, message: "Test notification created", notification: testNotification });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ status: false, message: error.message });
  }
});

// Clear test notifications endpoint
router.delete("/clear-test-notifications", protectRoute, async (req, res) => {
  try {
    const { userId } = req.user;
    console.log('Clearing test notifications for user:', userId);
    
    const result = await Notice.deleteMany({
      team: [userId],
      "metadata.action": { $regex: /^test_/ }
    });
    
    console.log('Cleared test notifications:', result.deletedCount);
    res.json({ status: true, message: `Cleared ${result.deletedCount} test notifications` });
  } catch (error) {
    console.error('Error clearing test notifications:', error);
    res.status(500).json({ status: false, message: error.message });
  }
});

// Add this route before the /:id route
router.delete("/profile", protectRoute, async (req, res) => {
  try {
    const { userId } = req.user;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Specific routes should come before the generic :id route
router.get("/notification-preferences", protectRoute, getNotificationPreferences);
router.put("/notification-preferences", protectRoute, updateNotificationPreferences);

router.post("/team/add", protectRoute, addTeamMember);
router.post("/team/remove", protectRoute, removeTeamMember);

// Place the generic :id route LAST
router
  .route("/:id")
  .put(protectRoute, isAdminRoute, activateUserProfile)
  .delete(protectRoute, isAdminRoute, deleteUserProfile);

export default router;
