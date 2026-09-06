import mongoose, { Document } from "mongoose";
import { IUsers } from "../types/user.types.js";
import bcrypt from "bcryptjs";

/**
 * Extended Mongoose Document interface for User model including custom methods.
 */
interface UserSchema extends IUsers, Document {
    /**
     * Compares a plain text password with the hashed password stored in the database.
     * @param pass - Plain text password to verify
     * @returns True if password matches, false otherwise
     */
    comparepass(pass: string): boolean;
}
const userschema = new mongoose.Schema<UserSchema>({
    Username: {
        type: String,
        required: true,
    },
    Mobileno: {
        Number: {
            type: String,
            required: function (this: any): boolean {
                return !this.Gid;
            },
        },
        CountryCode: {
            type: String,
            required: function (this: any): boolean {
                return !this.Gid;
            },
            enum: ["+91", "+1", "+20", "+44", "+971", "+966", "+212"],
        },
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Gid: {
        type: String,
        default: null,
    },
    Password: {
        type: String,
        required: function (this: any): boolean {
            return !this.Gid;
        },
        minlength: [6, "Min 6 characters required"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

/**
 * Pre-save Mongoose hook.
 * Automatically hashes user password using bcrypt with salt rounds of 10 if modified.
 */
userschema.pre("save", function (this: any): void {
    if (!this.isModified("Password")) return;
    this.Password = bcrypt.hashSync(this.Password || "", 10);
});

/**
 * Instance method to compare plain password with hashed password.
 *
 * @param pass - Plain text password provided during login
 * @returns boolean indicating password match
 */
userschema.methods.comparepass = function (this: any, pass: string): boolean {
    return bcrypt.compareSync(pass, this.Password || "");
};

/**
 * Exported Mongoose User Model for querying and saving user records.
 */
export const UserModel = mongoose.model<UserSchema>("users", userschema);