import mongoose from "mongoose"
export function connecttodb() {
    mongoose.connect("mongouri").then(() => {
        console.log("Conntected to Database")
    });
}