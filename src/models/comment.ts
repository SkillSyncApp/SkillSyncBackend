import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment extends Document {
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const CommentModel: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);

export default CommentModel;