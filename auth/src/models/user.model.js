import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        default: ""
    },
    email: {
        type: String,
        required: true,
        default: ""
    },
    password: {
        type: String,
        required: () => {
            return this.gmailid ? false : true
        },
        default: ""
    },
    gmailid: {
        type: String,
        required: () => {
            return this.password ? false : true
        },
        default: ""
    }
}, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return
    }
    this.password = bcryptjs.hashSync(this.password, 10)
})

userSchema.methods.comparePassword = async function (password) {
    return await bcryptjs.compare(password, this.password)
}

const User = mongoose.model("User", userSchema)

export default User