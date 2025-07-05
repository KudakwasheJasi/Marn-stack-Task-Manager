import mongoose, { Schema } from "mongoose";

const noticeSchema = new Schema(
  {
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    text: { type: String },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
    notiType: { 
      type: String, 
      default: "alert", 
      enum: ["alert", "message", "task_created", "task_deleted", "task_updated", "task_duplicated", "subtask_created"] 
    },
    isRead: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    notificationId: { type: String, unique: true, sparse: true },
    metadata: {
      action: String,
      taskTitle: String,
      priority: String,
      stage: String
    }
  },
  { timestamps: true }
);

noticeSchema.index({ task: 1, notiType: 1, createdBy: 1, "metadata.action": 1 }, { unique: true });

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;
