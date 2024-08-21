// In your alert slice
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isOpen: false,
};

const alertSlice = createSlice({
	name: "alert",
	initialState,
	reducers: {
		showAlert: (state) => {
			state.isOpen = true;
		},
		hideAlert: (state) => {
			state.isOpen = false;
		},
	},
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
