/**
 * @description      : Notification Service for Task Manager
 * @author           : kudakwashe Ellijah
 * @group            : 
 * @created          : 05/07/2025 - 16:00:00
 * 
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 05/07/2025
 * - Author          : kudakwashe Ellijah
 * - Modification    : Created comprehensive notification service
**/

import Notice from "../models/notification.js";
import User from "../models/User.js";

// Generate unique notification ID
const generateNotificationId = (action, taskId, userId) => {
  return `${action}_${taskId}_${userId}_${Date.now()}`;
};

// Create notification with duplicate prevention
export const createNotification = async (notificationData) => {
  try {
    const {
      team,
      text,
      task,
      notiType = "alert",
      createdBy,
      action,
      taskTitle,
      priority,
      stage
    } = notificationData;

    console.log('Creating notification with data:', {
      team,
      text: text.substring(0, 50) + '...',
      task,
      notiType,
      createdBy,
      action
    });

    // Generate unique notification ID
    const notificationId = generateNotificationId(action, task, createdBy);

    // Check for existing notification to prevent duplicates
    const existingNotification = await Notice.findOne({
      task,
      notiType,
      createdBy,
      "metadata.action": action,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 minutes
    });

    if (existingNotification) {
      console.log('Duplicate notification prevented:', notificationId);
      return existingNotification;
    }

    const notification = await Notice.create({
      team,
      text,
      task,
      notiType,
      createdBy,
      notificationId,
      metadata: {
        action,
        taskTitle,
        priority,
        stage
      }
    });

    console.log('Notification created successfully:', notificationId);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // If it's a duplicate key error, ignore it
    if (error.code === 11000) {
      console.log('Duplicate notification prevented (database level)');
      return null;
    }
    throw error;
  }
};

// Create task creation notification
export const notifyTaskCreated = async (task, createdBy) => {
  try {
    console.log('Creating task creation notification for:', {
      taskId: task._id,
      taskTitle: task.title,
      team: task.team,
      createdBy: createdBy
    });

    const text = `New task "${task.title}" has been created and assigned to you. Priority: ${task.priority}, Stage: ${task.stage}`;
    
    const notification = await createNotification({
      team: task.team,
      text,
      task: task._id,
      notiType: "task_created",
      createdBy,
      action: "task_created",
      taskTitle: task.title,
      priority: task.priority,
      stage: task.stage
    });

    console.log('Task creation notification result:', notification ? 'Success' : 'Failed or duplicate');
  } catch (error) {
    console.error('Error creating task creation notification:', error);
  }
};

// Create task deletion notification
export const notifyTaskDeleted = async (task, deletedBy) => {
  try {
    const text = `Task "${task.title}" has been deleted by ${deletedBy}.`;
    
    await createNotification({
      team: task.team,
      text,
      task: task._id,
      notiType: "task_deleted",
      createdBy: deletedBy,
      action: "task_deleted",
      taskTitle: task.title,
      priority: task.priority,
      stage: task.stage
    });
  } catch (error) {
    console.error('Error creating task deletion notification:', error);
  }
};

// Create task update notification
export const notifyTaskUpdated = async (task, updatedBy, changes) => {
  try {
    const changeText = Object.keys(changes).map(key => `${key}: ${changes[key]}`).join(', ');
    const text = `Task "${task.title}" has been updated by ${updatedBy}. Changes: ${changeText}`;
    
    await createNotification({
      team: task.team,
      text,
      task: task._id,
      notiType: "task_updated",
      createdBy: updatedBy,
      action: "task_updated",
      taskTitle: task.title,
      priority: task.priority,
      stage: task.stage
    });
  } catch (error) {
    console.error('Error creating task update notification:', error);
  }
};

// Create task duplication notification
export const notifyTaskDuplicated = async (originalTask, newTask, duplicatedBy) => {
  try {
    const text = `Task "${originalTask.title}" has been duplicated as "${newTask.title}" by ${duplicatedBy}.`;
    
    await createNotification({
      team: newTask.team,
      text,
      task: newTask._id,
      notiType: "task_duplicated",
      createdBy: duplicatedBy,
      action: "task_duplicated",
      taskTitle: newTask.title,
      priority: newTask.priority,
      stage: newTask.stage
    });
  } catch (error) {
    console.error('Error creating task duplication notification:', error);
  }
};

// Create subtask creation notification
export const notifySubtaskCreated = async (parentTask, subtask, createdBy) => {
  try {
    const text = `New sub-task "${subtask.title}" has been added to task "${parentTask.title}" by ${createdBy}.`;
    
    await createNotification({
      team: parentTask.team,
      text,
      task: parentTask._id,
      notiType: "subtask_created",
      createdBy,
      action: "subtask_created",
      taskTitle: subtask.title,
      priority: subtask.priority,
      stage: subtask.status
    });
  } catch (error) {
    console.error('Error creating subtask notification:', error);
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, limit = 20) => {
  try {
    console.log('Fetching notifications for user:', userId);
    
    const notifications = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] }
    })
    .populate("task", "title")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(limit);

    console.log('Found notifications:', notifications.length);
    console.log('Notification details:', notifications.map(n => ({
      id: n._id,
      type: n.notiType,
      text: n.text.substring(0, 30) + '...',
      task: n.task?.title,
      createdBy: n.createdBy?.name
    })));

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    console.log('Marking notification as read:', { notificationId, userId });
    
    // First check if the notification exists
    const notification = await Notice.findById(notificationId);
    if (!notification) {
      console.error('Notification not found:', notificationId);
      throw new Error('Notification not found');
    }
    
    console.log('Found notification:', {
      id: notification._id,
      team: notification.team,
      isRead: notification.isRead
    });
    
    // Check if user is in the team (should receive this notification)
    if (!notification.team.includes(userId)) {
      console.error('User not in notification team:', { userId, team: notification.team });
      throw new Error('User not authorized to mark this notification as read');
    }
    
    const result = await Notice.findByIdAndUpdate(
      notificationId,
      { $addToSet: { isRead: userId } },
      { new: true }
    );
    
    console.log('Notification marked as read successfully:', {
      notificationId,
      userId,
      updatedIsRead: result.isRead
    });
    
    return result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    await Notice.updateMany(
      { team: userId, isRead: { $nin: [userId] } },
      { $addToSet: { isRead: userId } }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}; 