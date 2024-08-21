import { showAlert } from "@/redux/slices/alertSlice";
import { store } from "@/redux/store";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_BACKEND;

const axiosClient = axios.create({
	baseURL: BASE_API_URL,
	withCredentials: true,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
	responseType: "json",
});


axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (
			error.response &&
			error.response.status === 401 &&
			error.response.data === "Session is over"
		) {
			console.log("Session is over.");
			store.dispatch(showAlert()); // show the alert if the response is 401 and message is session is over.
		}
		return Promise.reject(error);
	}
);

export {axiosClient}