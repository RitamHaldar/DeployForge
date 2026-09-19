import mongoose from "mongoose";
const userSchema = new mongoose.Schema({}, { strict: false });
export const userModel = mongoose.models.users || mongoose.model("users", userSchema);
