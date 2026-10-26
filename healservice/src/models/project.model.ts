import mongoose, { Document, Model, Schema } from "mongoose";
export type TechStackType =
  | "node"
  | "next"
  | "react"
  | "vue"
  | "angular"
  | "python"
  | "go"
  | "rust"
  | "docker"
  | "static"
  | "other";

export const SUPPORTED_TECH_STACKS: TechStackType[] = [
  "node",
  "next",
  "react",
  "vue",
  "angular",
  "python",
  "go",
  "rust",
  "docker",
  "static",
  "other",
];
export interface IEnvVar {
  key: string;
  value: string;
}
export interface IProject extends Document {
  name: string;
  userId?: mongoose.Types.ObjectId;
  techStack: TechStackType;
  envs: IEnvVar[];
  repoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const envVarSchema = new Schema<IEnvVar>(
  {
    key: {
      type: String,
      required: [true, "Environment variable key is required"],
      trim: true,
    },
    value: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters long"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    techStack: {
      type: String,
      enum: {
        values: SUPPORTED_TECH_STACKS,
        message: "{VALUE} is not a supported tech stack",
      },
      default: "node",
      lowercase: true,
      trim: true,
    },
    envs: {
      type: [envVarSchema],
      default: [],
    },
    repoUrl: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);
projectSchema.index({ name: 1, userId: 1 });
export const projectModel: Model<IProject> = mongoose.model<IProject>("Project", projectSchema);

export const Project = projectModel;
export default projectModel;
