/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 01/07/2025 - 14:40:42
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 01/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import { response } from "express";
import User from "../models/User.js";
import { createJWT } from "../utils/index.js";
import Notice from "../models/notification.js";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../utils/notificationService.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
    });

    if (user) {
      isAdmin ? createJWT(res, user._id) : null;

      user.password = undefined;

      res.status(201).json(user);
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      createJWT(res, user._id);

      user.password = undefined;

      res.status(200).json(user);
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const users = await User.find().select("name title role email isActive");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getNotificationsList = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log('Getting notifications for user ID:', userId);
    console.log('User object from request:', req.user);

    const notifications = await getUserNotifications(userId, 20);
    console.log('Returning notifications to frontend:', notifications.length);

    res.status(201).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id, name, email, phone, bio, imageUrl } = req.body;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
        ? _id
        : userId;

    const user = await User.findById(id);

    if (user) {
      // Update basic fields
      user.name = name || user.name;
      user.email = email || user.email;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;
      
      // Update new fields
      if (phone !== undefined) user.phone = phone;
      if (bio !== undefined) user.bio = bio;
      if (imageUrl !== undefined) user.imageUrl = imageUrl;

      const updatedUser = await user.save();

      // Remove password from response
      updatedUser.password = undefined;

      res.status(201).json({
        status: true,
        message: "Profile Updated Successfully.",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { isReadType, id } = req.query;
    
    console.log('Marking notification as read:', { userId, isReadType, id });

    if (isReadType === "all") {
      console.log('Marking all notifications as read for user:', userId);
      await markAllNotificationsAsRead(userId);
    } else if (isReadType === "single" || id) {
      console.log('Marking single notification as read:', { notificationId: id, userId });
      if (!id) {
        return res.status(400).json({ status: false, message: "Notification ID is required" });
      }
      await markNotificationAsRead(id, userId);
    } else {
      return res.status(400).json({ status: false, message: "Invalid request. Either 'all' or 'single' with ID required" });
    }

    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Password changed successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive; //!user.isActive

      await user.save();

      res.status(201).json({
        status: true,
        message: `User account has been ${
          user?.isActive ? "activated" : "disabled"
        }`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    res.json({ status: true, preferences: user.notificationPreferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.user;
    const { email, push } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    if (email !== undefined) user.notificationPreferences.email = email;
    if (push !== undefined) user.notificationPreferences.push = push;
    await user.save();
    res.json({ status: true, preferences: user.notificationPreferences });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.user;
    const { email } = req.body;
    const user = await User.findById(userId);
    const member = await User.findOne({ email });
    if (!user || !member) {
      return res.status(404).json({ status: false, message: 'User or member not found' });
    }
    if (user.team.includes(member._id)) {
      return res.status(400).json({ status: false, message: 'Member already in team' });
    }
    user.team.push(member._id);
    await user.save();
    res.json({ status: true, team: user.team });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.user;
    const { memberId } = req.body;
    if (userId === memberId) {
      return res.status(400).json({ status: false, message: 'Cannot remove yourself from the team' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    user.team = user.team.filter(id => id.toString() !== memberId);
    await user.save();
    res.json({ status: true, team: user.team });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};
