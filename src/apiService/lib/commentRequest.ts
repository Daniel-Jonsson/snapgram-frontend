import { axiosClient } from "../apiService";
import { CommentCreate, CommentReply } from "../types/Comment";

const httpOptions = {
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
};

export const createComment = async (data: CommentCreate) => {
	return axiosClient.post("/comments", data, httpOptions);
};

export const replyToComment = async (data: CommentReply) => {
	return axiosClient.post("comments/reply", data, httpOptions);
};

export const getCommentsForPost = async (postId: string) => {
	return axiosClient.get(`comments/post/${postId}`, httpOptions);
};

export const getComment = async (commentId: string) => {
    return axiosClient.get(`comments/${commentId}`, httpOptions)
}

export const deleteComment = async (commentId: string) => {
	return axiosClient.delete(`comments/${commentId}`, httpOptions);
};

export const updateComment = async (commentId: string, data: CommentCreate) => {
	return axiosClient.put(`comments/${commentId}`, data, httpOptions);
};

export const likeComment = async (commentId: string, userId: string) => {
    const body = {
        commentId,
        userId
    }
    return axiosClient.post("comments/like", body, httpOptions);
}

export const dislikeComment = async (commentId: string, userId: string) => {
    const body = {
		commentId,
		userId,
	};
    return axiosClient.post("comments/dislike", body, httpOptions);
}