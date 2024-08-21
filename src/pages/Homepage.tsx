import { cancelFriendRequest, getFriendRequests, sendFriendRequest } from "@/apiService/lib/friendRequest";
import { dislikePost, getFollowedFeed, likePost } from "@/apiService/lib/postRequest";
import { getUsersNotFollowedBy } from "@/apiService/lib/userRequest";
import { FriendRequest } from "@/apiService/types/FriendRequest";
import { Post } from "@/apiService/types/Post";
import { User } from "@/apiService/types/User";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/containers/PostCard";
import PostLoader from "@/components/ui/PostLoader";
import UserLoader from "@/components/ui/UserLoader";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { handleAxiosError } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { getInitials } from "@/utils";
import { Avatar } from "@radix-ui/react-avatar";
import { UserPlus, UserX } from "lucide-react";
import moment from "moment";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Homepage = () => {
	const [followedFeed, setFollowedFeed] = useState<Post[]>([]);
	const [notFollwedUsers, setNotFollowedUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const user: User | null = useSelector((state: RootState) => state.auth.user);
	const [sentFriendRequests, setSentFriendRequests] = useState<string[]>([]);
	
	useEffect(() => {
		const fetchFeed = async () => {
			try {
				const followedFeedData = await getFollowedFeed();
				setFollowedFeed(followedFeedData.data);
				setLoading(false);
			} catch (error) {
				console.log(error)
				const errorMessage = handleAxiosError(error);
				if (errorMessage) {
					toast(errorMessage);
				}
			}
		};

		const fetchNotFollows = async () => {
			if (!user) return;
			try {
				const notFollwedUsers = await getUsersNotFollowedBy(user);
				setNotFollowedUsers(notFollwedUsers.data);
			} catch (error) {
				const errorMessage = handleAxiosError(error);
				if (errorMessage) {
					toast(errorMessage);
				}
			}
		}

		const fetchSentFriendRequests = async () => {
			if (!user) return;
			try {
				const friendRequestsData = await getFriendRequests(user._id);
				const sentRequests = friendRequestsData.data
					.filter((request: FriendRequest) => request.status === "pending")
					.map((request: FriendRequest) => request.receiver);
				setSentFriendRequests(sentRequests);
			} catch (error) {
				const errorMessage = handleAxiosError(error);
				if (errorMessage) {
					toast(errorMessage);
				}
			}
		};

		fetchFeed();
		fetchNotFollows();
		fetchSentFriendRequests();
	}, [user]);

	const handleNewPost = (newPost: Post) => {
		setFollowedFeed((prevFeed) => [newPost, ...prevFeed]);
	};

	const handleUpdatePost = (updatedPost: Post) => {
		const updatedPosts = followedFeed.map((post) => {
			if (post._id === updatedPost._id) {
				return updatedPost;
			}
			return post;
		});
		setFollowedFeed(updatedPosts);
	};

	const handleDeletePost = (postId: string) => {
		setFollowedFeed((prevPosts) =>
			prevPosts.filter((post) => post._id !== postId)
		);
	};

	const handleLikePost = async (postId: string) => {
		try {
			const likedPost: Post = (await likePost(postId)).data;
			handleUpdatePost(likedPost);
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	}

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
	}

	const handleSendFriendRequest = async (notFollowedUser: User) => {
		if (!user) return;
		try {
			await sendFriendRequest(user._id, notFollowedUser._id);
			setSentFriendRequests([...sentFriendRequests, notFollowedUser._id]);
			toast("Friend request sent!")
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleCancelFriendRequest = async (notFollowedUser: User) => {
		if (!notFollowedUser || !user) return;

		try {
			await cancelFriendRequest(user._id, notFollowedUser._id);

			setSentFriendRequests((prevRequests) =>
				prevRequests.filter(
					(requestId) => requestId !== notFollowedUser._id
				)
			);
			toast("Friend request cancelled.");
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};


	return (
		<div className="flex justify-evenly space-x-4">
			<div className="w-1/5 h-full flex flex-col rounded-sm space-y-4 justify-center sticky top-[89px]">
				<Card className="w-full">
					<CardHeader className="space-y-4">
						<div className="flex gap-2 items-center text-xl">
							<Avatar>
								<AvatarImage
									src={user?.profilePicture}
									className="w-12 h-12 rounded-full"
								/>
								<AvatarFallback className="text-md w-12 h-12 rounded-full">
									{getInitials(
										user?.firstname ?? "",
										user?.lastname ?? ""
									)}
								</AvatarFallback>
							</Avatar>
							<CardTitle>
								{user?.firstname} {user?.lastname}
							</CardTitle>
						</div>
						<Separator className="w-full" />
					</CardHeader>
					<CardContent className="space-y-4">
						<h2 className="text-md">
							{user?.follows?.length} Friends
						</h2>
						<div className="flex justify-between text-sm">
							<p className="text-gray-400">Joined</p>
							<p>{moment(user?.createdAt).fromNow()}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="w-full">
					<CardHeader className="space-y-4">
						<div className="flex gap-2 items-center text-xl">
							<CardTitle>
								{user?.follows?.length} Friends
							</CardTitle>
						</div>
						<Separator className="w-full" />
					</CardHeader>
					<CardContent className="space-y-4">
						<ScrollArea className="w-full h-[250px]">
							{loading ? (
								<div className="space-y-2">
									{Array.from({ length: user?.follows.length ?? 10 }, (_, index) => (
										<UserLoader key={index} />
									))}
								</div>
							) : (
								<div>
									{user?.follows?.map((friend) => (
										<div key={friend._id}>
											<div className="flex gap-1 mt-2 text-pretty text-md items-center">
												<Avatar>
													<AvatarImage
														src={
															friend.profilePicture
														}
														alt="Friend profile pic"
														className="w-12 h-12 rounded-full"
													/>
													<AvatarFallback className="w-12 h-12 rounded-full">
														{getInitials(
															friend.firstname ??
																"",
															friend.lastname ??
																""
														)}
													</AvatarFallback>
												</Avatar>
												<Link
													to={`/visitprofile/${friend._id}`}
												>
													{friend.firstname}{" "}
													{friend.lastname}
												</Link>
											</div>
										</div>
									))}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col space-y-4 w-3/5">
				{loading ? (
					<div className="w-full">
						{Array.from({ length: 10 }, (_, index) => (
							<PostLoader key={index} classes="w-full" />
						))}
					</div>
				) : (
					<div className="flex flex-col space-y-4 w-full">
						<CreatePost
							classes="w-full"
							onPostCreated={handleNewPost}
						/>
						{followedFeed.map((item) => (
							<PostCard
								key={item._id}
								post={item}
								classes="w-full"
								onDelete={handleDeletePost}
								onUpdate={handleUpdatePost}
								onLike={handleLikePost}
								onDislike={handleDislikePost}
							/>
						))}
					</div>
				)}
			</div>
			<div className="w-1/5 h-full flex flex-col rounded-sm space-y-4 justify-center sticky top-[89px]">
				<Card className="w-full">
					<CardHeader className="space-y-4">
						<div className="flex gap-2 items-center text-xl">
							<CardTitle>Add new friends</CardTitle>
						</div>
						<Separator className="w-full" />
					</CardHeader>
					<CardContent className="space-y-4">
						<ScrollArea className="w-full h-[350px]">
							{loading ? (
								<div className="space-y-2">
									{Array.from({ length: 20 }, (_, index) => (
										<UserLoader key={index} />
									))}
								</div>
							) : (
								<div>
									{notFollwedUsers?.map((notFollwedUser) => {
										const isRequestSent = sentFriendRequests.includes(notFollwedUser._id);
										return (
											<div key={notFollwedUser._id}>
												<HoverCard>
													<HoverCardTrigger
														asChild
														className="hover:cursor-pointer"
													>
														<Link
															to={`/visitprofile/${notFollwedUser._id}`}
														>
															<div className="flex gap-1 mt-2 text-pretty text-md items-center">
																<Avatar>
																	<AvatarImage
																		src={
																			notFollwedUser.profilePicture
																		}
																		alt="Friend profile pic"
																		className="w-12 h-12 rounded-full"
																	/>
																	<AvatarFallback className="w-12 h-12 rounded-full">
																		{getInitials(
																			notFollwedUser.firstname ??
																				"",
																			notFollwedUser.lastname ??
																				""
																		)}
																	</AvatarFallback>
																</Avatar>
																{
																	notFollwedUser.firstname
																}{" "}
																{
																	notFollwedUser.lastname
																}
															</div>
														</Link>
													</HoverCardTrigger>
													<HoverCardContent className="w-80">
														<div className="flex gap-2 w-full items-center">
															<div>
																<Avatar className="w-16 h-16">
																	<AvatarImage
																		src={
																			notFollwedUser.profilePicture
																		}
																		className="w-16 h-16 rounded-full"
																	/>
																	<AvatarFallback className="w-16 h-16 rounded-full">
																		{getInitials(
																			notFollwedUser.firstname ??
																				"",
																			notFollwedUser.lastname ??
																				""
																		)}
																	</AvatarFallback>
																</Avatar>
															</div>
															<div>
																<div className="flex gap-1 font-semibold text-xl">
																	<span>
																		{
																			notFollwedUser.firstname
																		}
																	</span>
																	<span>
																		{
																			notFollwedUser.lastname
																		}
																	</span>
																</div>
																<div className="text-xs">
																	{`Joined: ${moment(
																		notFollwedUser.createdAt
																	).fromNow()}`}
																</div>
															</div>
														</div>
														<div>
															{
																notFollwedUser.description
															}
														</div>
														{isRequestSent ? (
															<Button 
															className="flex gap-1 items-center mt-4"
															onClick={() => handleCancelFriendRequest(notFollwedUser)}>
																<UserX />
																<span>
																	Cancel
																	request
																</span>
															</Button>
														) : (
															<Button className="flex gap-1 items-center mt-4" onClick={() => handleSendFriendRequest(notFollwedUser)}>
																<UserPlus />
																<span>
																	Add friend
																</span>
															</Button>
														)}
													</HoverCardContent>
												</HoverCard>
											</div>
										);
									})}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Homepage;
