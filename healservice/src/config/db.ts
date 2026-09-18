import mongoose from "mongoose";
import {config} from "../config/config.js"
export async function connectTODb(){
    await mongoose.connect(config.MONGO_URI).then(()=>{
        console.log("Connected to Database")
    });
}