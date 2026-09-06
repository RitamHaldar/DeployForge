import mongoose from "mongoose";
import { config } from "./cofig.js";

/**
 * @returns {Promise<void>} Resolves when the connection is successfully established.
 */
export async function connecttodb(): Promise<void> {
    await mongoose.connect(config.uri).then(() => {
        console.log("Connected to DB");
    });
}