/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 01/07/2025 - 20:30:49
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 01/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: new Date() },
    priority: {
      type: String,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "created",
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: String,
        date: { type: Date, default: new Date() },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    subTasks: [
      {
        title: { type: String, required: true },
        description: String,
        priority: {
          type: String,
          default: "medium",
          enum: ["high", "medium", "low"]
        },
        dueDate: Date,
        status: {
          type: String,
          default: "todo",
          enum: ["todo", "in progress", "completed"]
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now }
      },
    ],
    assets: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, 
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;