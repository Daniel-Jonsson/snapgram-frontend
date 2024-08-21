import { axiosClient } from "../apiService";

export const getNotifications = () => {
    return axiosClient.get('/notifications');
}

export const readNotification = (id: string) => {
    const url = `/notifications/${id}/read`;
    return axiosClient.put(url);
}

export const readAllNotifications = () => {
    return axiosClient.put("/notifications/read/all");
}

export const deleteAllNotifications = () => {
    return axiosClient.delete("notifications/");
}