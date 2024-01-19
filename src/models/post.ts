import mongoose, { Document } from "mongoose";

export interface IPost extends Document {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    image: string;
    comments: Comment[];
    commentsCount: number;
}

interface Comment {
    _id: string;
    content: string;
    userName: String;
    createdAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    title: { 
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    commentsCount: {
        type: Number,
        default: 0,
    },
});

const PostModel = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
