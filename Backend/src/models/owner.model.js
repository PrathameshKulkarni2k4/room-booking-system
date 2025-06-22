import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const ownerSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Invalid email address'],
        },
        phoneNo: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        rooms: [
            {
                type: Schema.Types.ObjectId,
                ref: "Room",
            }
        ],
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

ownerSchema.pre("save",async function (next) { // encrypt the pass before save to database
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
}) // dont use () => {} here

ownerSchema.methods.isPasswordCorrect = async function name(password) {
    return await bcrypt.compare(password, this.password)
}

ownerSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
ownerSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id, // it refreshed often so used less payload here than accessToken
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Owner = mongoose.model("Owner",ownerSchema)