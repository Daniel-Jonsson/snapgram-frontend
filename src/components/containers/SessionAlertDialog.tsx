import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { hideAlert } from "@/redux/slices/alertSlice";
import { logout } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const SessionAlertDialog = () => {
	const isOpen = useSelector((state: RootState) => state.alert.isOpen);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleClose = () => {
		dispatch(hideAlert()); // Hide alert again
		dispatch(logout()); // Logout the user
		navigate("/login"); // Navigate to the login page
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={() => {}}>
			<AlertDialogContent className="w-[625px]">
				<AlertDialogHeader>
					<AlertDialogTitle>Session has ended</AlertDialogTitle>
					<AlertDialogDescription>
						Your session has ended, to reach this page content you
						need to logout and login again.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction onClick={handleClose}>
						Logout
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default SessionAlertDialog;
