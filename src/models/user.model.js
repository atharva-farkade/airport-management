import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const roles = ['airline_staff', 'service_vendor', 'airport_admin', 'finance'];

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]

    },
    password: {
        type: String,
        required: [true, "Password is required"],
        
    },

    role: { 
        type: String, 
        enum: roles, 
        default: 'service_vendor' 
    }, 

    gender: { 
        type: String, 
        enum: ['male', 'female', 'other'], 
        default: 'other' 
    },

    number: { 
        type: String,
        unique: true,
        required: true,
        validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);  // Exactly 10 digits, no spaces or symbols
      },
      message: props => `${props.value} is not a valid phone number!`
    }
    }, 

    refreshToken: {
        type: String,
    }
})

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    role: this.role
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};
export const User = mongoose.model("User", userSchema)
