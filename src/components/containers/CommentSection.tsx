import { Post } from '@/apiService/types/Post';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { createComment, deleteComment, dislikeComment, getComment, getCommentsForPost, likeComment, replyToComment, updateComment } from '@/apiService/lib/commentRequest';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { User } from '@/apiService/types/User';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleAxiosError } from '@/lib/utils';
import { toast } from 'sonner';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/utils';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Comment, CommentCreate } from '@/apiService/types/Comment';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Ellipsis, Loader2, MessageCircle, SquarePen, ThumbsDown, ThumbsUp, Trash } from 'lucide-react';
import clsx from 'clsx';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';



const CommentForm = ({ user, post, onCommentAdded  }: {user: User, post: Post, onCommentAdded: (comment: Comment) => void}) => {
	const [loading, setLoading] = useState(false);

    const CommentSchema = z.object({
		message: z.string().min(1, "Your comment needs to have content.")
	});

    const form = useForm<z.infer<typeof CommentSchema>>({
		resolver: zodResolver(CommentSchema),
	});

	const onSubmit = async (data: z.infer<typeof CommentSchema>) => {
		try {
			setLoading(true);
            const response = await createComment({
                message: data.message,
                post: post._id,
                author: user._id
            });
            onCommentAdded(response.data);
            form.reset({message: ""});
            setLoading(false);

		} catch (err) {
			const errorMessage = handleAxiosError(err);
			toast(errorMessage);
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
				<Card>
					<CardHeader>
						<div className="flex gap-2 items-center">
							<Avatar className="w-14 h-14">
								<AvatarImage
									src={user.profilePicture}
									className="rounded-full"
								/>
								<AvatarFallback>
									{getInitials(
										user.firstname ?? "",
										user.lastname ?? ""
									)}
								</AvatarFallback>
							</Avatar>
							<div className="w-full">
								<FormField
									control={form.control}
									name="message"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Textarea
													placeholder="Enter your comment here..."
                                                    className='focus-visible:ring-accent/60'
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</CardHeader>
					<CardFooter className="justify-end">
						{loading ? (
							<Button variant="outline" className='rounded-full'>Submitting...</Button>
						) : (
							<Button
								variant="outline"
								type="submit"
								className="rounded-full"
							>
								Submit
							</Button>
						)}
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
};

const ReplyForm = ({
	user,
	post,
	parentComment,
	onReplyAdded,
}: {
	user: User;
	post: Post;
	parentComment: Comment;
	onReplyAdded: (comment: Comment) => void;
}) => {
	const [loading, setLoading] = useState(false);

	const CommentSchema = z.object({
		message: z.string().min(1, "Your reply needs to have content."),
	});

	const form = useForm<z.infer<typeof CommentSchema>>({
		resolver: zodResolver(CommentSchema),
	});

	const onSubmit = async (data: z.infer<typeof CommentSchema>) => {
		try {
			setLoading(true);
			const response = await replyToComment({
				message: data.message,
				post: post._id,
				author: user._id,
				parentComment: parentComment._id,
			});
			onReplyAdded(response.data);
			form.reset({message: ""});
			setLoading(false);
		} catch (err) {
			const errorMessage = handleAxiosError(err);
			toast(errorMessage);
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
				<Card>
					<CardHeader>
						<div className="flex gap-2 items-center">
							<Avatar className="w-14 h-14">
								<AvatarImage
									src={user.profilePicture}
									className="rounded-full"
								/>
								<AvatarFallback>
									{getInitials(
										user.firstname ?? "",
										user.lastname ?? ""
									)}
								</AvatarFallback>
							</Avatar>
							<div className="w-full">
								<FormField
									control={form.control}
									name="message"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Textarea
													placeholder="Enter your reply here..."
													className="focus-visible:ring-accent/60"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</CardHeader>
					<CardFooter className="justify-end">
						{loading ? (
							<Button variant="outline" className="rounded-full">
								Submitting...
							</Button>
						) : (
							<Button
								variant="outline"
								type="submit"
								className="rounded-full"
							>
								Submit
							</Button>
						)}
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
};

const DeleteAlertDialog = ({
	open,
	setOpen,
	onDelete,
    loading,
}: {
	comment: Comment;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loading: boolean,
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
						delete this comment and remove its data from our
						servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					{loading ? (
						<Button type="button" disabled variant="destructive">
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Deleting...
						</Button>
					) : (
						<Button
							onClick={onDelete} // Call the onDelete function
							variant="destructive"
						>
							Continue
						</Button>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const EditingDialog = ({
	comment,
	open,
	setOpen,
	onUpdate,
}: {
	comment: Comment;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onUpdate: (updatedComment: Comment) => void;
}) => {
	const user = useSelector((state: RootState) => state.auth.user);
	const [loading, setLoading] = useState<boolean>(false);

	const EditCommentSchema = z.object({
		message: z
			.string()
			.min(1, { message: "The comments needs to contain content" }),
	});

	const form = useForm<z.infer<typeof EditCommentSchema>>({
		resolver: zodResolver(EditCommentSchema),
		defaultValues: {
			message: comment.message, // Set initial value from the post
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				message: comment?.message ?? "",
			});
		}
	}, [open, form, comment]);

	const onSubmit = async (data: z.infer<typeof EditCommentSchema>) => {
		try {
			setLoading(true);
			const updatedComment = {
				...comment,
				message: data.message,
			};
			onUpdate(updatedComment);
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
						{comment.author._id === user?._id
							? "Editing your comment"
							: `Editing ${comment.author.firstname}'s comment`}
					</DialogTitle>
					<DialogDescription>
						Make changes to the comment here. Click 'save changes' when
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
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormControl className="">
										<Textarea
											placeholder="What's on your mind..."
											className="h-fit focus-visible:ring-0"
											{...field}
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

const NestedComment = ({
	commentId,
	post,
	onDelete,
	onUpdate,
}: {
	commentId: string;
	post: Post;
	onDelete: (commentId: string) => void;
	onUpdate: (updatedComment: Comment) => void;
}) => {
	const user = useSelector((state: RootState) => state.auth.user);
	const [isLiked, setIsLiked] = useState(false);
	const [isDisliked, setIsDisliked] = useState(false);
	const [showReply, setShowReply] = useState(false);
	const [comment, setComment] = useState<Comment | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchCommentAndLikes = async () => {
			try {
				if (!user) {
					return;
				}
				const response = await getComment(commentId);
				setComment(response.data);
				const userLiked = response.data.likes.some(
					(likedUser: User) => likedUser._id === user._id
				);
				const userDisliked = response.data.dislikes.some(
					(dislikedUser: User) => dislikedUser._id === user._id
				);
				setIsDisliked(userDisliked);
				setIsLiked(userLiked);
			} catch (error) {
				console.log(error);
			}
		};

		fetchCommentAndLikes();
	}, [commentId, user]);

	const handleReplyComment = (newComment: Comment) => {
		if (!user) {
			toast("You need to be logged in to dislike a comment");
			return;
		}
		setComment(newComment);
        setShowReply(false);
	};

	const handleDislikeComment = async (dislikedComment: Comment) => {
		if (!user) {
			toast("You need to be logged in to dislike a comment");
			return;
		}

		try {
			const response = await dislikeComment(
				dislikedComment._id,
				user._id
			);
			const updatedComment = response.data;
			setComment(updatedComment);
			if (!isDisliked) {
				setIsLiked(false);
				setIsDisliked(true);
			} else {
				setIsDisliked(false);
				setIsLiked(false);
			}
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleLikeComment = async (likedComment: Comment) => {
		if (!user) {
			toast("You need to be logged in to like a comment");
			return;
		}

		try {
			const response = await likeComment(likedComment._id, user._id);
			const updatedComment = response.data;
			setComment(updatedComment);
			if (!isLiked) {
				setIsDisliked(false);
				setIsLiked(true);
			} else {
				setIsDisliked(false);
				setIsLiked(false);
			}
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

    const handleDeleteCommentRecursive = async (comment: Comment) => {
		// Delete all replies first
		for (const replyId of comment.replies) {
            const replyComment = (await getComment(replyId._id ?? replyId)).data;
			await handleDeleteCommentRecursive(replyComment);
		}
		// Then delete the comment itself
		try {
			await deleteComment(comment._id);
		} catch (err) {
			console.error(
				`Failed to delete comment with message: ${comment.message}`,
				err
			);
			throw err;
		}
	};

	const handleDeleteComment = async () => {
		if (!comment) return;
		try {
            setLoading(true);
			await handleDeleteCommentRecursive(comment);
			onDelete(comment._id); // Call the onDelete callback
            setLoading(false);
			setDeleting(false); // Close the delete dialog
            setComment(null);
			toast("Successfully deleted comment.");
		} catch (err) {
			toast("Failed to delete comment, try again later.");
		}
	};

	const handleUpdateComment = async (updatedComment: Comment) => {
		try {
			const commentCreate: CommentCreate = {
				message: updatedComment.message,
				author: updatedComment.author._id,
				post: updatedComment.post._id,
			};
			const response = await updateComment(comment!._id, commentCreate);
            const updatedCommentResp: Comment = response.data;
			toast("Comment updated successfully.");
			onUpdate(updatedCommentResp);
            setComment(updatedCommentResp);
			setEditing(false); // Close the edit dialog
		} catch (error) {
			console.log(error);
			toast("Failed to update comment, try again later.");
		}
	};

	return (
		<div>
			{comment && (
				<div className="pl-4 border-l border-muted mt-4">
					<Card key={comment._id}>
						<CardHeader>
							<CardTitle>
								<div className="flex flex-col xl:flex-row items-center gap-2">
									<div className="flex-shrink-0">
										<Avatar className="w-10 h-10">
											<AvatarImage
												src={
													comment?.author
														?.profilePicture
												}
												className="w-10 h-10 rounded-full"
											/>
											<AvatarFallback className="w-10 h-10 rounded-full">
												{getInitials(
													comment?.author
														?.firstname ?? "",
													comment?.author?.lastname ??
														""
												)}
											</AvatarFallback>
										</Avatar>
									</div>
									<div className="w-full">
										<div className="flex flex-col xl:flex-row gap-1 items-center">
											<div className="text-pretty font-medium text-base">
												<Link
													to={`/visitprofile/${comment.author._id}`}
												>
													{comment.author.firstname}{" "}
													{comment.author.lastname}
												</Link>
											</div>
											<div className="text-muted-foreground font-normal flex-1">
												@{comment.author.username}
											</div>
											{(comment.author._id ===
												user?._id ||
												user?.admin) && (
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
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
															onClick={() => setEditing(true)}
															className="flex items-center gap-2 hover:cursor-pointer"
														>
															<SquarePen
																size={20}
															/>
															Edit comment
														</DropdownMenuItem>
														<DropdownMenuItem
															className="flex items-center gap-2 hover:cursor-pointer"
															onClick={() => setDeleting(true)}
														>
															<Trash size={20} />
															Delete comment
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
											<DeleteAlertDialog
												comment={comment}
												open={deleting}
												setOpen={setDeleting}
												onDelete={handleDeleteComment}
                                                loading={loading}
											/>
											<EditingDialog
												comment={comment}
												open={editing}
												setOpen={setEditing}
												onUpdate={(updatedComment) =>
													handleUpdateComment(
														updatedComment
													)
												}
											/>
										</div>
										<div className="flex gap-1 text-xs font-medium items-center text-muted-foreground">
											<p>
												{moment(
													comment.createdAt
												).calendar()}
											</p>
										</div>
									</div>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent>{comment.message}</CardContent>
						<CardFooter>
							<div className="flex flex-col w-full space-y-2">
								<div className="flex items-center space-x-3">
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
											onClick={() =>
												handleLikeComment(comment)
											}
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
														"text-white":
															isLiked ||
															isDisliked,
													})}
												/>
											)}
										</Button>
										<span
											className={clsx(
												"text-pretty text-xs font-semibold",
												(isLiked || isDisliked) &&
													"text-white"
											)}
										>
											{comment.likes.length -
												comment.dislikes.length}
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
											onClick={() =>
												handleDislikeComment(comment)
											}
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
														"text-white":
															isLiked ||
															isDisliked,
													})}
												/>
											)}
										</Button>
									</div>
									<Button
										variant="ghost"
										className="flex gap-2 items-center min-w-20 justify-center bg-primary-foreground p-0 rounded-full"
										onClick={() => setShowReply(!showReply)}
									>
										<MessageCircle size={16} />
										Reply
									</Button>
								</div>
								{showReply && user && (
									<div>
										<ReplyForm
											user={user}
											post={post}
											parentComment={comment!}
											onReplyAdded={handleReplyComment}
										/>
									</div>
								)}
							</div>
						</CardFooter>
					</Card>
					{comment.replies.length > 0 && (
						<div className="mt-4 space-y-4">
							{comment.replies.map((reply) => (
								<NestedComment
									key={reply._id}
									commentId={reply._id}
									post={post}
                                    onDelete={onDelete}
                                    onUpdate={onUpdate}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const CommentSection = ({ post }: {post: Post}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await getCommentsForPost(post._id);
                setComments(response.data);
            } catch (error) {
                const errorMessage = handleAxiosError(error);
                if (errorMessage) {
                    toast(errorMessage);
                }
            }
        };
        fetchComments();
    }, [post._id])

    const handleCommentAdd = (newComment: Comment) => {
		setComments((prevComments) => [newComment, ...prevComments]);
	};

    const handleDeleteComment = (commentId: string) => {
		const removeCommentRecursively = (
			comments: Comment[],
			commentId: string
		): Comment[] => {
			return comments.reduce((acc: Comment[], comment: Comment) => {
				if (comment._id !== commentId) {
					if (Array.isArray(comment.replies)) {
						comment.replies = removeCommentRecursively(
							comment.replies,
							commentId
						);
					}
					acc.push(comment);
				}
				return acc;
			}, []);
		};

		setComments((prevComments) =>
			removeCommentRecursively(prevComments, commentId)
		);
	};


    const handleUpdateComment = (updatedComment: Comment) => {
        const updatedComments = comments.map((comment: Comment) => {
            if (comment._id === updatedComment._id) {
                return updatedComment
            }
            return comment
        })
        setComments(updatedComments);
    }


  return (
		<div className="w-full flex items-center justify-center">
			<Card className="w-3/5 bg-primary-foreground/40 space-y-4">
				<CardHeader className="space-y-4">
					{user && (
						<div className="w-full">
							<CommentForm
								user={user}
								post={post}
								onCommentAdded={handleCommentAdd}
							/>
						</div>
					)}
					<CardTitle className="text-pretty text-2xl">
						Comments
					</CardTitle>
				</CardHeader>
				{comments.length > 0 ? (
					<CardContent className="space-y-2">
						{comments.map((comment) => (
							<NestedComment 
                            key={comment._id} 
                            post={post} 
                            commentId={comment._id}
                            onDelete={handleDeleteComment}  
                            onUpdate={handleUpdateComment}
                            />
						))}
					</CardContent>
				) : (
					<div className="flex items-center justify-center text-2xl font-semibold p-4">
						No comments :(
					</div>
				)}
			</Card>
		</div>
  );
}

export default CommentSection