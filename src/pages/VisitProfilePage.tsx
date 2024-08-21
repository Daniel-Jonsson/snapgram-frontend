import { Post } from "@/apiService/types/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/apiService/types/User";
import { getInitials } from "@/utils";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import Timeline from "@/components/Timeline";
import { useEffect, useState } from "react";
import {
	dislikePost,
	getPostsByUserId,
	likePost,
} from "@/apiService/lib/postRequest";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, unfollowUser } from "@/apiService/lib/userRequest";
import { UserCheck, UserCog, UserPlus, UserX } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { cancelFriendRequest, getFriendRequests, sendFriendRequest } from "@/apiService/lib/friendRequest";
import { FriendRequest } from "@/apiService/types/FriendRequest";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { updateUserInStore } from "@/redux/slices/authSlice";

const VisitProfilePage = () => {
	const { userId } = useParams<{ userId?: string }>() ?? {};
	const [user, setUser] = useState<User | null>(null);
	const currentUser: User | null = useSelector(
		(state: RootState) => state.auth.user
	);
	const dispatch = useDispatch();
	const [follows, setFollows] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [friendRequestStatus, setFriendRequestStatus] = useState<
		string | null
	>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			if (!userId || !currentUser) return; // If userId is undefined, exit early

			try {
				// Fetch user info
				const userResponse = await getUserById(userId);
				setUser(userResponse.data);

				// Fetch user posts
				const userFollows = currentUser.follows.some(
					(followedUser) => followedUser._id === userResponse.data?._id
				);
				setFollows(userFollows);
				const postsResponse = await getPostsByUserId(userId);
				setPosts(postsResponse.data);

				const friendRequestStatusResponse: FriendRequest[] = (await getFriendRequests(currentUser._id)).data;
				const friendRequestStatus = friendRequestStatusResponse.find((request: FriendRequest) => request.receiver === userId);
				setFriendRequestStatus(friendRequestStatus?.status || null);
				setLoading(false);
			} catch (error) {
				const errorMessage = handleAxiosError(error);
				if (errorMessage) {
					toast(errorMessage, {
						position: "bottom-right",
						duration: 3000,
					});
				}
			}
		};

		fetchData();
	}, [userId, currentUser]);

	const handleDeletePost = (postId: string) => {
		setPosts((prevPosts) =>
			prevPosts.filter((post) => post._id !== postId)
		);
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

	const handleSendFriendRequest = async () => {
		if (!userId || !currentUser) return;
		try {
			await sendFriendRequest(currentUser?._id, userId);
			setFriendRequestStatus("pending");
			toast("Friend request sent!")
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleRemoveFriend = async () => {
		if (!userId || !currentUser) return;
		try {
			const response = await unfollowUser(userId);
			const updatedUser = response.data;
			window.localStorage.setItem("user", JSON.stringify(updatedUser));
			dispatch(updateUserInStore(updatedUser));
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	}

	const handleCancelFriendRequest = async () => {
		if (!userId || !currentUser) return;

		try {
			await cancelFriendRequest(currentUser._id, userId);

			setFriendRequestStatus(null);
			toast("Friend request cancelled.")
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	}

	
	return (
		<div className="w-3/5 justify-center m-auto">
			{loading ? (
				<div className="flex w-full min-h-[calc(100vh-100px)] justify-center items-center text-2xl font-semibold">
					<div>Loading...</div>
				</div>
			) : (
				<div>
					<div className="flex flex-col bg-background-foreground">
						<div className="flex flex-row gap-4 items-center">
							<div>
								<Avatar className="h-36 w-36">
									<AvatarImage src={user?.profilePicture} />
									<AvatarFallback className="text-4xl">
										{getInitials(
											user?.firstname ?? "",
											user?.lastname ?? ""
										)}
									</AvatarFallback>
								</Avatar>
							</div>

							<div className="flex flex-col space-y-1 w-full">
								<h1 className="font-semibold text-4xl">{`${user?.firstname} ${user?.lastname}`}</h1>
								<div className="text-accent-foreground font-semibold">
									{user?.follows.length}{" "}
									{user?.follows.length === 1
										? "friend"
										: "friends"}
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
																{
																	follower.firstname
																}{" "}
																{
																	follower.lastname
																}
															</div>
															<div>
																{
																	follower?.description
																}
															</div>
														</div>
													</div>
												</HoverCardContent>
											</HoverCard>
										))}
									</div>
									{follows ? (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button className="flex flex-row-reverse gap-2 items-center justify-center">
													<UserCheck />
													<span>Friends</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-44 mt-1">
												<DropdownMenuItem
													className="hover:cursor-pointer"
													onClick={() =>
														handleRemoveFriend()
													}
												>
													<UserCog
														size={20}
														className="mr-1"
													/>
													<span>Remove friend</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									) : friendRequestStatus === "pending" ? (
										<Button
											className="flex flex-row-reverse gap-2 items-center justify-center"
											onClick={handleCancelFriendRequest}
										>
											<UserX />
											<span>Cancel request</span>
										</Button>
									) : (
										<Button
											className="flex flex-row-reverse gap-2 items-center justify-center"
											onClick={() =>
												handleSendFriendRequest()
											}
										>
											<UserPlus />
											<span>Follow</span>
										</Button>
									)}
								</div>
							</div>
						</div>
					</div>
					<div className="pt-2">
						<span>{user?.description}</span>
					</div>
					<div className="pt-8 space-y-8">
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
			)}
		</div>
	);
};

export default VisitProfilePage;