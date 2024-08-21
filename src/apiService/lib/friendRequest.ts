import { axiosClient } from "../apiService";

export const sendFriendRequest = async (senderId: string, receiverId: string) => {
    const url = "friend-request";
    return axiosClient.post(url, {senderId, receiverId});
};

export const acceptFriendRequest = async (initiatorId: string) => {
	const url = `friend-request/accept`;
	return axiosClient.post(url, { initiatorId });
};

export const declineFriendRequest = async (receiverId: string) => {
	const url = `friend-request/decline`;
	return axiosClient.post(url, receiverId);
};

export const cancelFriendRequest = async (senderId: string, receiverId: string) => {
	return axiosClient.post("friend-request/cancel", { senderId, receiverId });
};

export const getFriendRequests = async (userId: string) => {
    const url = `friend-request/${userId}`;
    return axiosClient.get(url);
}

export const getFriendRequestStatus = async (initiatorId: string) => {
	const url = `friend-request/status/${initiatorId}`;
	return axiosClient.get(url);
}