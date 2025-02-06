import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: function() {
            return this.provider === 'email'; // Only require password for email-based users
        },
        // minlength: [6, 'Password must be at least 6 characters long']
    },
    bookmarks: [{
        question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
        },
        tag: {
            type: String,
            default: "Bookmarked"
        }
    }],
    refreshToken:{
        type: String
    },
    isadmin:{
        type: Boolean,
        default: false
    },
    testHistory: [
        {
            test: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Test",
            },
            score: Number,
            answers: [
                {
                    questionId: mongoose.Schema.Types.ObjectId,
                    isCorrect: Boolean,
                    timeSpent: {
                        type: String
                    },
                    userAnswer: {
                        type: mongoose.Schema.Types.Mixed
                    },
                    
                },
            ],
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    provider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    avatar: String,
    isVerified: {
        type: Boolean,
        default: false
    }
},{timestamps:true}

)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        fullname: this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model("User", userSchema)