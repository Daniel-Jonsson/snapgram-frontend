import axios, { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const handleFileUpload = async (uploadFile: File) => {
	const formData = new FormData();
	formData.append("file", uploadFile);
	formData.append("upload_preset", "Snapgram");

	const url = `https://api.cloudinary.com/v1_1/${
		import.meta.env.VITE_CLOUDINARY_ID
	}/image/upload`;

	try {
		const response = await axios.post(url, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.secure_url;
	} catch (error) {
		console.error("Error uploading image to Cloudinary:", error);
		throw error;
	}
};

export const handleAxiosError: (error: unknown) => string | null = (error) => {
	const axiosError = error as AxiosError;

	if (
		axiosError.response?.status === 401 &&
		axiosError.response.data === "Session is over"
	) {
		return null;
	}
	if (axiosError && axiosError.response?.data) {
		return axiosError.response.data as string;
	} else {
		return "An error occurred.";
	}
};
