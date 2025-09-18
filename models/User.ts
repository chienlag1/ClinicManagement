import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkUserId: { type: String, unique: true, index: true, required: true },
    email: { type: String, index: true },
    firstName: String,
    lastName: String,
    imageUrl: String,
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: string;
  clerkUserId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export const User = models.User || model("User", UserSchema);
