import { axiosClient } from "../apiService";
import { User, userLogin, userRegister, userUpdate } from "../types/User";

const httpOptions = {
	headers: {'Content-Type': 'application/json'},
	withCredentials: true,
};

export const loginUser = async (credentials: userLogin) => {
	return axiosClient.post("users/login", credentials);
};

export const logoutUser = async () => {
	return axiosClient.post("users/logout", httpOptions);
}

export const RegisterUser = async (data: userRegister) => {
	return axiosClient.post("users/register", data);
};

export const getUser = async () => {
	return axiosClient
		.get("users/", httpOptions)
};

export const getUsers = async () => {
	return axiosClient.get("users/all/", httpOptions);
}

export const getUsersNotFollowedBy = async (user: User) => {
	return axiosClient.post("users/not-followed", { user })
}

export const updateUser = async (id: string, data: userUpdate) => {
	const url = `users/edit/${id}`;
	return axiosClient.put(url, data, httpOptions);
}

export const deleteUser = async (id: string) => {
	const url = `users/${id}`;
	return axiosClient.delete(url);
}

export const followUser = async (userId: string) => {
	return axiosClient.get(`users/follow/${userId}`, httpOptions)
}

export const unfollowUser = async (userId: string) => {
	return axiosClient.get(`users/unfollow/${userId}`, httpOptions)
}

export const getUserById = async (userId: string) => {
	return axiosClient.get(`users/${userId}`, httpOptions)
}

export const getCurrentUserId = async () => {
	const response = axiosClient.get("users/", httpOptions);
	return (await response).data._id;
}

export const checkFollowingStatus = async ( user: User) => {
	try {
		const currentUser = await axiosClient.get(`users/`);
		const isFollowing = currentUser.data.follows.some((obj: User) => obj._id === user._id);
		return isFollowing;
	} catch (error) {
		console.log(`rror checking following status: ${error}`);
	}
}
