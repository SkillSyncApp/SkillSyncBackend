import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    refreshTokens: string[];
    type: 'company' | 'student' | 'unknown';
    image?: {
        originalName?: string;
        serverFilename?: string;
    };
    bio: string;
}

const userSchema = new mongoose.Schema<IUser>({
    name: { 
        type: String,
        required: true 
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true 
    },
    password: {
        type: String,
        required: false,
    },
    refreshTokens: {
        type: [String],
        required: false,
    },
    type: {
        type: String,
        required: true,
        enum: ['company', 'student', 'unknown'], // Specify the allowed values
    },
    image: {
        originalName: { type: String, required: false },
        serverFilename: { type: String, required: false }
    },
    bio: {
        type: String,
        required: true,
    },
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
