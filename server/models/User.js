/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 01/07/2025 - 13:07:08
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 01/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : Enhanced password hashing and comparison with consistent bcrypt version
**/
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        match: [
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    title: {
        type: String,
        default: 'Member'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    // Use consistent salt rounds and prefix
    const saltRounds = 12;
    const hash = await bcrypt.hash(this.password, saltRounds);
    
    // Ensure the hash uses the correct prefix
    if (!hash.startsWith('$2a$')) {
        throw new Error('Password hash format is incorrect');
    }
    
    this.password = hash;
    next();
});

// Method to check if the user is an admin
userSchema.methods.isAdminUser = function() {
    return this.role === 'admin';
};

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Ensure the stored hash uses the correct prefix
        if (!this.password.startsWith('$2a$')) {
            throw new Error('Stored password hash format is incorrect');
        }
        
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

export default mongoose.model('User', userSchema);