import { logoutUser } from "@/apiService/lib/userRequest";
import { User } from "@/apiService/types/User";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export type userState = {
	user: User | null;
};

const getUserFromLocalStorage = (): User | null => {
	const user = window.localStorage.getItem("user");
	return user ? JSON.parse(user) : null;
};

const initialState: userState = {
	user: typeof window !== "undefined" ? getUserFromLocalStorage() : null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
			localStorage.setItem("user", JSON.stringify(action.payload));
		},
		logout: (state) => {
			state.user = null;
			localStorage?.removeItem("user");
			logoutUser();
		},
		updateUserInStore: (state, action: PayloadAction<User>) => {
			state.user = { ...state.user, ...action.payload };
		},
	},
});

export const { login, logout, updateUserInStore } = authSlice.actions;
export default authSlice.reducer;
