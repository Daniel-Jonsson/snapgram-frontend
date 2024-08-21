import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./alert-dialog";

import { toast } from "sonner";

const UnfollowAlertDialog = ({
    open,
    setOpen,
    onUnfollow,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onUnfollow: () => void;
}) => {
    const handleUnfollow = async () => {
        try {
            onUnfollow();
            setOpen(false); 
            toast("Successfully unfollowed user!");
        } catch (err) {
            toast("Failed to unfollow user, try again later.");
        }
    };

    

    return (
        <AlertDialog open={open} onOpenChange={() => setOpen(false)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Unfollow User
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to unfollow this user?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleUnfollow}
                        className="bg-destructive text-foreground hover:bg-destructive/80"
                    >
                        Unfollow
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UnfollowAlertDialog;
