import { Post } from "./Post";
import { User } from "./User";

export interface Comment {
	_id: string;
	message: string;
	author: User; // This should be User type if you have it defined
	post: Post; // This should be Post type if you have it defined
	parentComment: Comment;
    likes: User[];
    dislikes: User[];
	replies: Comment[];
	createdAt: string;
	updatedAt: string;
}

export interface CommentCreate {
	message: string;
	author: string; // User ID
	post: string; // Post ID
}

export interface CommentReply {
	message: string;
	author: string; // User ID
	post: string; // Post ID
	parentComment: string; // Comment ID
}
