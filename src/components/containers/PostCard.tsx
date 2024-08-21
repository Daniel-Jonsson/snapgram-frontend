import {
	deletePost as deleteUserPost,
	updatePost,
} from "@/apiService/lib/postRequest";
import { Post } from "@/apiService/types/Post";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn, handleAxiosError, handleFileUpload } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { getInitials } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { Avatar } from "@radix-ui/react-avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Ellipsis, Loader2, MessageCircle, SquarePen, ThumbsDown, ThumbsUp, Trash } from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { AspectRatio } from "../ui/aspect-ratio";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "../ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { User } from "@/apiService/types/User";
import { Link } from "react-router-dom";
import clsx from "clsx";

const PostCard = ({
	post,
	classes,
	onDelete,
	onUpdate,
	onLike,
	onDislike,
}: {
	post: Post;
	classes: string;
	onDelete: (postId: string) => void;
	onUpdate: (updatedPost: Post) => void;
	onLike: (postId: string) => void;
	onDislike: (postId: string) => void;
}) => {
	const [deleting, setDeleting] = useState(false);
	const [editing, setEditing] = useState(false);
	const user: User | null = useSelector((state: RootState) => state.auth.user);
	const [isLiked, setIsLiked] = useState(false);
	const [isDisliked, setIsDisliked] = useState(false);
	const postReactions: number = post.likes.length - post.dislikes.length;
	

	const handleUpdate = async (updatedPost: Post) => {
		try {
			await updatePost(updatedPost);
			toast("Post updated successfully");
			onUpdate(updatedPost);
			setEditing(false); // Close the edit dialog
		} catch (error) {
			console.log(error);
			toast("Failed to update post, try again later.");
		}
	};

	const handleDelete = async () => {
		try {
			await deleteUserPost(post._id);
			onDelete(post._id); // Call the onDelete callback
			setDeleting(false); // Close the delete dialog
			toast("Successfully deleted post!");
		} catch (err) {
			toast("Failed to delete post, try again later.");
		}
	};

	const handleLike = async () => {
		try {
			await onLike(post._id);
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	}

	const handleDislike = async () => {
		try {
			await onDislike(post._id)
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	}

	useEffect(() => {
		const fetchLikeStatus = () => {
			try {
				if (!user) {
					return;
				}
				const userLiked = post.likes.some(likedUser => likedUser._id === user._id);
				const userDisliked = post.dislikes.some(dislikedUser => dislikedUser._id === user._id);
				setIsDisliked(userDisliked)
				setIsLiked(userLiked);
			} catch (error) {
				console.log(error)
			}
		}
		fetchLikeStatus()
	}, [post, user])
	
	return (
		<Card className={cn("flex flex-col bg-primary-foreground/40", classes)}>
			<div>
				<CardHeader>
					<CardTitle>
						<div className="flex flex-col xl:flex-row items-center gap-2">
							<div className="flex-shrink-0">
								<Avatar className="w-10 h-10">
									<AvatarImage
										src={post?.author?.profilePicture}
										className="w-10 h-10 rounded-full"
									/>
									<AvatarFallback className="w-10 h-10 rounded-full">
										{getInitials(
											post?.author?.firstname ?? "",
											post?.author?.lastname ?? ""
										)}
									</AvatarFallback>
								</Avatar>
							</div>
							<div className="w-full">
								<div className="flex flex-col xl:flex-row gap-1 items-center">
									<div className="text-pretty font-medium text-base">
										<Link
											to={`/visitprofile/${post.author._id}`}
										>
											{post.author.firstname}{" "}
											{post.author.lastname}
										</Link>
									</div>
									<div className="text-muted-foreground font-normal flex-1">
										@{post.author.username}
									</div>
									{(post.author._id === user?._id ||
										user?.admin) && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<div className="relative">
													<Button
														variant="ghost"
														className="hover:bg-transparent absolute -right-2 -top-4"
													>
														<Ellipsis />
													</Button>
												</div>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-44">
												<DropdownMenuItem
													onClick={() =>
														setEditing(true)
													}
													className="flex items-center gap-2 hover:cursor-pointer"
												>
													<SquarePen size={20} />
													Edit post
												</DropdownMenuItem>
												<DropdownMenuItem
													className="flex items-center gap-2 hover:cursor-pointer"
													onClick={() =>
														setDeleting(true)
													}
												>
													<Trash size={20} />
													Delete post
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
									<DeleteAlertDialog
										post={post}
										open={deleting}
										setOpen={setDeleting}
										onDelete={handleDelete} // Pass the handleDelete function
									/>
									<EditingDialog
										post={post}
										open={editing}
										setOpen={setEditing}
										onUpdate={(updatedPost) =>
											handleUpdate(updatedPost)
										}
									/>
								</div>
								<div className="flex gap-1 text-xs font-medium items-center  text-muted-foreground">
									<p>{moment(post.createdAt).calendar()}</p>
								</div>
							</div>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-pretty text-sm">
					<div className="flex flex-col gap-2">
						{post.body}
						{post.image && (
							<Dialog>
								<DialogTrigger asChild>
									<AspectRatio
										ratio={4 / 3}
										className="rounded-md bg-muted mt-2 mb-2 hover:cursor-pointer"
									>
										<img
											src={post.image}
											className="w-full h-full rounded-md"
										/>
									</AspectRatio>
								</DialogTrigger>
								<DialogContent className="md:max-w-[625px] h-2/3 bg-transparent border-none">
									<AspectRatio
										ratio={16 / 9}
										className="rounded-md w-full bg-muted mt-2 mb-2"
									>
										<img
											src={post.image}
											className="w-full h-full rounded-md"
										/>
									</AspectRatio>
								</DialogContent>
							</Dialog>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<div className="flex w-full space-x-3">
						<div
							className={clsx(
								"flex items-center min-w-20 justify-between p-0 rounded-full",
								isLiked
									? "bg-green-600"
									: isDisliked
									? "bg-red-600"
									: "bg-primary-foreground"
							)}
						>
							<Button
								variant="ghost"
								className={clsx(
									"flex items-center rounded-full h-8 w-8 p-0 justify-center",
									!(isLiked || isDisliked) &&
										"hover:text-green-600",
									(isLiked || isDisliked) &&
										"hover:bg-accent/30"
								)}
								onClick={handleLike}
							>
								{isLiked ? (
									<ThumbsUp
										fill="white"
										stroke="white"
										size={16}
									/>
								) : (
									<ThumbsUp
										size={16}
										className={clsx({
											"text-white": isLiked || isDisliked,
										})}
									/>
								)}
							</Button>
							<span
								className={clsx(
									"text-pretty text-xs font-semibold",
									(isLiked || isDisliked) && "text-white"
								)}
							>
								{postReactions}
							</span>
							<Button
								variant="ghost"
								className={clsx(
									"flex items-center justify-center rounded-full h-8 w-8 p-0",
									!(isDisliked || isLiked) &&
										"hover:text-red-600",
									(isLiked || isDisliked) &&
										"hover:bg-accent/30"
								)}
								onClick={handleDislike}
							>
								{isDisliked ? (
									<ThumbsDown
										fill="white"
										stroke="white"
										size={16}
									/>
								) : (
									<ThumbsDown
										size={16}
										className={clsx({
											"text-white": isLiked || isDisliked,
										})}
									/>
								)}
							</Button>
						</div>
						<Link to={`/posts/${post._id}`}>
							<Button
								variant="ghost"
								className="flex gap-2 items-center min-w-20 justify-center bg-primary-foreground p-0 rounded-full"
							>
								<MessageCircle size={16} />
								{post.comments.length}
							</Button>
						</Link>
					</div>
				</CardFooter>
			</div>
		</Card>
	);
};

const DeleteAlertDialog = ({
	open,
	setOpen,
	onDelete,
}: {
	post: Post;
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
						delete this post and remove its data from our servers.
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
	post,
	open,
	setOpen,
	onUpdate,
}: {
	post: Post;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onUpdate: (updatedPost: Post) => void;
}) => {
	const user = useSelector((state: RootState) => state.auth.user);
	const [loading, setLoading] = useState<boolean>(false);
	const MAX_FILE_SIZE = 1024 * 1024 * 5;
	const ACCEPTED_IMAGE_MIME_TYPES = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
	];
	const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

	const EditPostSchema = z.object({
		desc: z
			.string()
			.min(1, { message: "The post needs to contain a description" }),
		image: z
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

	const form = useForm<z.infer<typeof EditPostSchema>>({
		resolver: zodResolver(EditPostSchema),
		defaultValues: {
			desc: post.body, // Set initial value from the post
			image: undefined,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				desc: post?.body ?? "",
				image: undefined,
			});
		}
	}, [open, form, post]);

	const onSubmit = async (data: z.infer<typeof EditPostSchema>) => {
		try {
			setLoading(true);
			const uri = data.image && (await handleFileUpload(data.image?.[0]));
			const updatedPost = { ...post, body: data.desc, image: uri ?? post.image };
			onUpdate(updatedPost);
			setLoading(false);
		} catch (error) {
			toast.error("Failed to edit the post. Please try again later.");
			setLoading(false);
		}
	};
	const { isDirty } = form.formState;
	return (
		<Dialog open={open} onOpenChange={() => setOpen(false)}>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>
						{post.author._id === user?._id
							? "Editing your post"
							: `Editing ${post.author.firstname}'s post`}
					</DialogTitle>
					<DialogDescription>
						Make changes to the post here. Click 'save changes' when
						you're done.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						id="editForm"
						className="w-full"
					>
						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem>
									<FormControl className="">
										<Textarea
											placeholder="What's on your mind..."
											className="h-fit focus-visible:ring-0"
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
							name="image"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Picture</FormLabel>
									<FormControl>
										<Input
											id="picture"
											type="file"
											accept="image/*"
											onChange={(e) => {
												field.onChange(e.target.files);
											}}
											ref={field.ref}
											className="file:text-muted-foreground"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					{loading ? (
						<Button type="button" disabled variant="outline">
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</Button>
					) : (
						<Button
							type="submit"
							form="editForm"
							disabled={!isDirty}
							variant="outline"
						>
							Save changes
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PostCard;
