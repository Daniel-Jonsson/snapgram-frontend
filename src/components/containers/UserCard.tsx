import { deleteUser, updateUser } from "@/apiService/lib/userRequest";
import { User } from "@/apiService/types/User";
import { handleFileUpload } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { getInitials } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ellipsis, SquarePen, Trash } from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const UserCard = ({
	user,
	classes,
	onDelete,
	onUpdate,
}: {
	user: User;
	classes: string;
	onDelete: (userId: string) => void;
	onUpdate: (updatedUser: User) => void;
}) => {
	const [deleting, setDeleting] = useState(false);
	const [editing, setEditing] = useState(false);

	const handleUpdate = async (updatedUser: User) => {
		try {
			setEditing(false); // Close the edit dialog
			await updateUser(user._id, updatedUser);
			onUpdate(updatedUser);
			toast("Profile updated successfully.");
		} catch (error) {
			console.log(error);
			toast("Failed to update user, try again later.");
		}
	};

	const handleDelete = async () => {
		try {
			await deleteUser(user._id);
			toast("Successfully deleted user!");
			onDelete(user._id); // Call the onDelete callback
			setDeleting(false); // Close the delete dialog
		} catch (err) {
			toast("Failed to delete user, try again later.");
		}
	};

	return (
		<div className="w-full flex flex-col xl:flex-row items-center justify-center pb-4">
			<Card className={classes}>
				<CardHeader>
					<CardTitle>
						<div className="flex flex-col xl:flex-row items-center gap-2">
							<div className="flex-shrink-0">
								<Avatar className="w-10 h-10">
									<AvatarImage
										src={user?.profilePicture}
										className="w-10 h-10 rounded-full"
									/>
									<AvatarFallback className="w-10 h-10 rounded-full">
										{getInitials(
											user?.firstname ?? "",
											user?.lastname ?? ""
										)}
									</AvatarFallback>
								</Avatar>
							</div>
							<div className="w-full">
								<div className="flex flex-col xl:flex-row gap-1 items-center">
									<div className="text-pretty font-medium text-base">
										{user?.firstname} {user?.lastname}
									</div>
									<div className="text-muted-foreground font-normal flex-1">
										@{user?.username}
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="hover:bg-transparent"
											>
												<Ellipsis />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-44">
											<DropdownMenuItem
												onClick={() => setEditing(true)}
												className="flex items-center gap-2 hover:cursor-pointer"
											>
												<SquarePen size={20} />
												Edit user
											</DropdownMenuItem>
											<DropdownMenuItem
												className="flex items-center gap-2 hover:cursor-pointer"
												onClick={() =>
													setDeleting(true)
												}
											>
												<Trash size={20} />
												Delete user
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<DeleteAlertDialog
										user={user}
										open={deleting}
										setOpen={setDeleting}
										onDelete={handleDelete} // Pass the handleDelete function
									/>
									<EditingDialog
										user={user}
										open={editing}
										setOpen={setEditing}
										onUpdate={(updatedPost) =>
											handleUpdate(updatedPost)
										}
									/>
								</div>
								<div className="flex gap-1 text-xs font-medium items-center -mt-2 text-muted-foreground">
									<p>
										Created:{" "}
										{moment(user?.createdAt).calendar()}
									</p>
								</div>
							</div>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-pretty text-sm">
					{user.description}
				</CardContent>
			</Card>
		</div>
	);
};

const DeleteAlertDialog = ({
	open,
	setOpen,
	onDelete,
}: {
	user: User;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onDelete: () => void; // Add the onDelete prop
}) => {
	return (
		<AlertDialog open={open} onOpenChange={() => setOpen(false)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently
						delete this user and remove its data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onDelete} // Call the onDelete function
						className="bg-destructive text-foreground hover:bg-destructive/80"
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const EditingDialog = ({
	user,
	open,
	setOpen,
	onUpdate,
}: {
	user: User;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onUpdate: (updatedUser: User) => void;
}) => {
	const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];
	const ACCEPTED_IMAGE_MIME_TYPES = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
	];
	const MAX_FILE_SIZE = 1024 * 1024 * 5;
	const currentUser = useSelector((state: RootState) => state.auth.user);

	const updateUserSchema = z.object({
		firstname: z.string().min(2, { message: "Name is too short." }),
		lastname: z.string().min(2, { message: "Name is too short." }),
		description: z
			.string()
			.max(500, { message: "Description is too long." }),
		email: z.string().email({ message: "Invalid email." }),
		admin: z.string(),
		profilePicture: z
			.instanceof(FileList)
			.optional()
			.refine(
				(files) => !files?.length || files?.[0]?.size <= MAX_FILE_SIZE,
				{ message: "Max image size is 5MB." }
			)
			.refine(
				(files) =>
					!files?.length ||
					ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type) ||
					ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
				{
					message:
						"Only .jpg, .jpeg, .png and .webp formats are supported.",
				}
			),
	});

	const form = useForm<z.infer<typeof updateUserSchema>>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			firstname: user?.firstname,
			lastname: user?.lastname,
			email: user?.email,
			description: user?.description,
			admin: user.admin ? "Admin" : "Peasant",
			profilePicture: undefined,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				firstname: user?.firstname ?? "",
				lastname: user?.lastname ?? "",
				email: user?.email ?? "",
				description: user?.description ?? "",
				admin: user.admin ? "Admin" : "Peasant",
				profilePicture: undefined,
			});
		}
	}, [open, form, user]);

	const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
		const uri =
			data.profilePicture &&
			(await handleFileUpload(data.profilePicture?.[0]));
		const isAdmin: boolean = data.admin.toLowerCase() === "admin";
		const updateProfile = {
			_id: user._id,
			username: user.username,
			follows: user.follows,
			createdAt: user.createdAt,
			firstname: data.firstname,
			lastname: data.lastname,
			email: data.email,
			description: data.description,
			profilePicture: uri ?? user.profilePicture,
			admin: user.admin ?? isAdmin,
		};
		try {
			onUpdate(updateProfile);
		} catch (error) {
			toast.error("Failed to edit the post. Please try again later.");
		}
	};
	const { isDirty } = form.formState;

	return (
		<Dialog open={open} onOpenChange={() => setOpen(false)}>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>
						{currentUser?._id === user?._id
							? "Editing your profile"
							: `Editing ${user?.firstname}'s profile`}
					</DialogTitle>
					<DialogDescription>
						Make changes to the profile here. Click 'save changes'
						when you're done.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						id="editForm"
						className="w-full flex flex-col gap-2 pt-4"
					>
						<div className="grid grid-cols-2 gap-2">
							<FormField
								control={form.control}
								name="firstname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl className="">
											<Input
												placeholder="First Name"
												id="test"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl className="">
											<Input
												placeholder="Last Name"
												id="lastname"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl className="">
											<Input
												placeholder="JohnDoe@email.com"
												id="email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="profilePicture"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Profile Picture</FormLabel>
										<FormControl>
											<Input
												id="picture"
												type="file"
												onChange={(e) => {
													field.onChange(
														e.target.files
													);
												}}
												ref={field.ref}
												className="file:text-muted-foreground"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid w-full items-center gap-1.5">
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl className="">
											<Textarea
												placeholder="Description..."
												{...field}
												rows={5}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="admin"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Access level</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											disabled={
												user._id === currentUser?._id ||
												user.admin
											}
										>
											<FormControl className="">
												<SelectTrigger>
													<SelectValue placeholder="Select a role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="Admin">
													Admin
												</SelectItem>
												<SelectItem value="Peasant">
													Peasant
												</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>
											{user._id === currentUser?._id
												? "Cannot edit your own access level"
												: user.admin
												? "Cannot edit access privilege for other admins"
												: "This will set the user access level, Admins get privileges."}
										</FormDescription>
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
				<DialogFooter>
					<Button
						type="submit"
						disabled={!isDirty}
						form="editForm"
						variant="outline"
					>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UserCard;
