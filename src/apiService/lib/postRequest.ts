import { axiosClient } from "../apiService"
import { Post } from "../types/Post";

export const getPostsByUserId = (userId: string) => {
	return axiosClient.get(`posts/user/${userId}`);
}

export const addPost = (desc: string, image: string) => {
		const data = {
			body: desc,
			image: image
		}
    
        return axiosClient.post("posts/add", data );
};

export const uploadImage = (url: string, formdata: FormData) => {
	return axiosClient.post(url, formdata);
}
export const updatePost = (post: Post) => {
	return axiosClient.put("posts/edit", post)
}

export const deletePost = (postId: string) => {
	const url = `posts/delete/${postId}`;
	return axiosClient.delete(url);
}

export const likePost = (postId: string) => {
	const data = { _id: postId }
	return axiosClient.post("posts/like", data );
}

export const dislikePost = (postId: string) => {
	const data = {_id: postId };
	return axiosClient.post("posts/dislike", data);
}

export const getFollowedFeed = () => {
	return axiosClient.get("posts/feed/followers");
}

export const getPosts = () => {
	return axiosClient.get("posts/feed/all");
}

export const getPost = (postId: string) => {
	const url = `posts/${postId}`;
	return axiosClient.get(url);
}

// export const deletePost = (postId: string) => {
// 	const data = {_id: postId};
// 	return axiosClient.delete(`posts/delete/`, {data});
// }

