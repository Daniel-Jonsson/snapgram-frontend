import {
	dislikePost,
	getPostsByUserId,
	likePost,
} from "@/apiService/lib/postRequest";
import { deleteUser, updateUser } from "@/apiService/lib/userRequest";
import { Post } from "@/apiService/types/Post";
import { User } from "@/apiService/types/User";
import CreatePost from "@/components/CreatePost";
import Timeline from "@/components/Timeline";
import { Dropzone } from "@/components/ui/Dropzone";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { handleAxiosError, handleFileUpload } from "@/lib/utils";
import { logout, updateUserInStore } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { getInitials } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, PencilLine, Trash, UserRoundCog } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];
const ACCEPTED_IMAGE_MIME_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];
const MAX_FILE_SIZE = 1024 * 1024 * 5;

const EditingDialog = ({
	user,
	open,
	setOpen,
}: {
	user: User;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	const EditUserSchema = z.object({
		firstname: z
			.string()
			.min(2, { message: "You must have a name silly!" })
			.max(20, {
				message: "Your name is too long! Max length is 20 characters.",
			}),
		lastname: z
			.string()
			.min(2, { message: "Please provide a lastname." })
			.max(20, {
				message:
					"Your lastname is too long! Max length is 20 characters.",
			}),
		email: z
			.string()
			.min(7, {
				message: "Your email must atleast contain 7 characters.",
			})
			.max(40, {
				message: "Your email is too long! Max length is 40 characters.",
			}),
		description: z.string().max(500, {
			message:
				"Your description is too long! Max length is 500 characters.",
		}),
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

	const form = useForm<z.infer<typeof EditUserSchema>>({
		resolver: zodResolver(EditUserSchema),
		defaultValues: {
			firstname: user?.firstname ? user?.firstname : "",
			lastname: user?.lastname ? user?.lastname : "",
			email: user?.email ? user?.email : "",
			description: user?.description ? user?.description : "",
			profilePicture: undefined,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				firstname: user?.firstname ? user?.firstname : "",
				lastname: user?.lastname ? user?.lastname : "",
				email: user?.email ? user?.email : "",
				description: user?.description ? user?.description : "",
				profilePicture: undefined,
			});
		}
	}, [open, form, user]);

	const { isDirty } = form.formState;

	const onSubmit = async (data: z.infer<typeof EditUserSchema>) => {
		try {
			setLoading(true);
			const uri =
				data.profilePicture &&
				(await handleFileUpload(data.profilePicture?.[0]));
			const updateProfile = {
				firstname: data.firstname,
				lastname: data.lastname,
				email: data.email,
				description: data.description,
				profilePicture: uri ?? user.profilePicture, // Use existing profile picture if none is uploaded
				admin: user.admin ?? false, // Set admin to false.
			};

			const response = await updateUser(user._id, updateProfile);
			const updatedUser: User = response.data;
			setLoading(false);
			setOpen(false);
			window.localStorage.setItem("user", JSON.stringify(updatedUser));
			dispatch(updateUserInStore(updatedUser));
			toast("Successfully updated profile.", {
				onAutoClose() {
					setOpen(false);
				},
				duration: 3000,
			});
		} catch (err) {
			const errorMessage = handleAxiosError(err);
			toast(errorMessage);
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={() => setOpen(false)}>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Editing profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click 'save changes'
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
												accept="image/*"
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
												placeholder="Write something about yourself!"
												{...field}
												rows={5}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
				<DialogFooter>
					{loading ? (
						<Button variant="outline" disabled>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</Button>
					) : (
						<Button
							type="submit"
							form="editForm"
							variant="outline"
							disabled={!isDirty}
						>
							Save changes
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const DeleteDialog = ({
	user,
	open,
	setOpen,
}: {
	user: User;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const OnDeleteUser = async (user: User) => {
		try {
			await deleteUser(user._id);
			dispatch(logout());
			toast("Successfully deleted user.", {
				duration: 2000,
				onAutoClose: () => {
					setOpen(false);
					navigate("/login");
				},
			});
		} catch (err) {
			toast("Failed to delete user, try again later.");
		}
	};

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
						onClick={() => OnDeleteUser(user)}
						className="bg-destructive text-foreground hover:bg-destructive/80"
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const ProfilePicDialog = ({
	user,
	open,
	setOpen,
}: {
	user: User | null;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [files, setFiles] = useState<File | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [removedPic, setRemovedPic] = useState<boolean>(false);
	const dispatch = useDispatch();
	const handleUpdateUserPic = async () => {
		if (!user) {
			return;
		}

		try {
			setLoading(true);
			const uri = files ? await handleFileUpload(files) : "";
			const updateProfile = {
				...user,
				profilePicture: uri,
			};
			const response = await updateUser(user?._id, updateProfile);
			const updatedUser: User = response.data;
			setLoading(false);
			window.localStorage.setItem("user", JSON.stringify(updatedUser));
			dispatch(updateUserInStore(updatedUser));
			toast("Successfully updated profile.", {
				onAutoClose() {
					setOpen(false);
				},
				duration: 3000,
			});
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					setFiles(null);
					setRemovedPic(false);
				}
				setOpen(isOpen);
			}}
		>
			<DialogContent className="md:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Edit profile picture</DialogTitle>
					<DialogDescription>
						Make changes to your profile picture here. Click 'save
						changes' when you're done.
					</DialogDescription>
					<Dropzone
						onChange={(e) => {
							setFiles(e);
							setRemovedPic(false);
						}}
						className="w-full"
						user={user}
						onRemove={() => {
							setFiles(null);
							setRemovedPic(true);
						}} // Update onRemove to set the state
					/>
				</DialogHeader>
				<DialogFooter>
					{loading ? (
						<Button disabled>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</Button>
					) : (
						<Button
							onClick={handleUpdateUserPic}
							disabled={removedPic ? false : !files}
						>
							Save changes
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const MyProfilePage = () => {
	const user: User | null = useSelector(
		(state: RootState) => state.auth.user
	);
	const [posts, setPosts] = useState<Post[]>([]);
	const [editing, setEditing] = useState<boolean>(false);
	const [deleting, setDeleting] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			if (!user) return;
			try {
				const postsResponse = await getPostsByUserId(user._id);
				setPosts(postsResponse.data);
			} catch (error) {
				const errorMessage = handleAxiosError(error);
				if (errorMessage) {
					toast(errorMessage);
				}
			}
		};

		fetchData();
	}, [user]);

	const handleDeletePost = (postId: string) => {
		setPosts((prevPosts) =>
			prevPosts.filter((post) => post._id !== postId)
		);
	};

	const handleAddPost = (newPost: Post) => {
		setPosts((prevPosts) => [newPost, ...prevPosts]);
	};

	const handleUpdatePost = (updatedPost: Post) => {
		const updatedPosts = posts.map((post) => {
			if (post._id === updatedPost._id) {
				return updatedPost;
			}
			return post;
		});
		setPosts(updatedPosts);
	};

	const handleLikePost = async (postId: string) => {
		try {
			const likedPost: Post = (await likePost(postId)).data;
			handleUpdatePost(likedPost);
			return likedPost;
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleDislikePost = async (postId: string) => {
		try {
			const dislikedPost: Post = (await dislikePost(postId)).data;
			handleUpdatePost(dislikedPost);
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	return (
		<div className="w-3/5 justify-center m-auto">
			<div className="flex flex-col bg-background-foreground">
				<div className="flex flex-row gap-4 items-center">
					<div className="relative">
						<Avatar className="h-36 w-36">
							<AvatarImage src={user?.profilePicture} />
							<AvatarFallback className="text-4xl">
								{getInitials(
									user?.firstname ?? "",
									user?.lastname ?? ""
								)}
							</AvatarFallback>
						</Avatar>
						<div className="absolute w-10 h-10 rounded-full bottom-1 right-1 flex items-center justify-center">
							<Button
								variant="secondary"
								className="w-full h-full rounded-full flex items-center justify-center p-0"
								onClick={() => setOpen(true)}
							>
								<Camera className="w-6 h-6" />
							</Button>
						</div>
						<ProfilePicDialog
							open={open}
							setOpen={setOpen}
							user={user}
						/>
					</div>

					<div className="flex flex-col space-y-1 w-full">
						<h1 className="font-semibold text-4xl">{`${user?.firstname} ${user?.lastname}`}</h1>
						<div className="text-accent-foreground font-semibold">
							{user?.follows.length} friends
						</div>
						<div className="flex gap-1">
							<div className="flex flex-1">
								{user?.follows.map((follower) => (
									<HoverCard key={follower._id}>
										<HoverCardTrigger asChild>
											<Button
												className="p-0 m-0 bg-transparent shadow-none hover:bg-transparent"
												onClick={() =>
													navigate(
														`/visitprofile/${follower._id}`
													)
												}
											>
												<Avatar className="h-7 w-7 -mr-2 hover:opacity-80">
													<AvatarImage
														src={
															follower?.profilePicture
														}
													/>
													<AvatarFallback className="text-primary">
														{getInitials(
															follower?.firstname ??
																"",
															follower?.lastname ??
																""
														)}
													</AvatarFallback>
												</Avatar>
											</Button>
										</HoverCardTrigger>
										<HoverCardContent className="w-80">
											<div className="flex space-x-2">
												<Avatar className="w-16 h-16">
													<AvatarImage
														src={
															follower?.profilePicture
														}
													/>
													<AvatarFallback>
														{getInitials(
															follower?.firstname ??
																"",
															follower?.lastname ??
																""
														)}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col justify-center">
													<div className="font-semibold text-xl">
														{follower.firstname}{" "}
														{follower.lastname}
													</div>
													<div>
														{follower?.description}
													</div>
												</div>
											</div>
										</HoverCardContent>
									</HoverCard>
								))}
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="flex flex-row-reverse gap-2 items-center justify-center">
										<UserRoundCog />
										<span>Settings</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-44">
									<DropdownMenuLabel>
										Account Setting
									</DropdownMenuLabel>
									<DropdownMenuSeparator />

									<DropdownMenuItem
										className="hover:cursor-pointer"
										onClick={() => setEditing(true)}
									>
										<PencilLine
											size={20}
											className="mr-1"
										/>
										<span>Edit profile</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										className="hover:cursor-pointer"
										onClick={() => setDeleting(true)}
									>
										<Trash size={20} className="mr-1" />
										<span>Delete profile</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							{user && (
								<div>
									<EditingDialog
										user={user}
										open={editing}
										setOpen={setEditing}
									/>
									<DeleteDialog
										user={user}
										open={deleting}
										setOpen={setDeleting}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="pt-2">
				<span>{user?.description}</span>
			</div>
			<div className="pt-8 space-y-8">
				<div>
					<CreatePost
						classes="w-full"
						onPostCreated={handleAddPost}
					/>
				</div>
				<Timeline
					posts={posts}
					onUpdate={(updatedPost: Post) =>
						handleUpdatePost(updatedPost)
					}
					onDelete={(postId) => handleDeletePost(postId)}
					onLike={(postId) => handleLikePost(postId)}
					onDislike={(postId) => handleDislikePost(postId)}
				/>
			</div>
		</div>
	);
};

export default MyProfilePage;
