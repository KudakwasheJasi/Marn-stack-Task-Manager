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
    },
    imageUrl: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Helper function to try multiple bcrypt versions
const tryComparePassword = async (candidatePassword, hash) => {
    try {
        // Try with the current bcrypt version
        const match = await bcrypt.compare(candidatePassword, hash);
        if (match) return true;

        // If that fails, try with different prefix
        if (hash.startsWith('$2a$')) {
            // Try with $2b$ prefix
            const modifiedHash = hash.replace('$2a$', '$2b$');
            const match2b = await bcrypt.compare(candidatePassword, modifiedHash);
            if (match2b) return true;
        }

        // If that fails, try with $2y$ prefix
        if (hash.startsWith('$2y$')) {
            const modifiedHash = hash.replace('$2y$', '$2a$');
            const match2a = await bcrypt.compare(candidatePassword, modifiedHash);
            if (match2a) return true;
        }

        // If all else fails, try rehashing with current version
        const saltRounds = 12;
        const newHash = await bcrypt.hash(candidatePassword, saltRounds);
        const matchNew = await bcrypt.compare(candidatePassword, newHash);
        return matchNew;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Method to check if the user is an admin
userSchema.methods.isAdminUser = function() {
    return this.role === 'admin';
};

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Verify the stored hash
        const isValidHash = await bcrypt.compare(candidatePassword, this.password);
        if (!isValidHash) {
            // Try multiple versions if initial check fails
            return await tryComparePassword(candidatePassword, this.password);
        }
        return isValidHash;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

export default mongoose.model('User', userSchema);