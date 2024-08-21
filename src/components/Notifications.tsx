/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadgeX, Check, Dock, Ellipsis } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "@/utils";
import moment from "moment";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { NotificationStatus, notificationType } from "@/apiService/types/Notification";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "sonner";
import { acceptFriendRequest, declineFriendRequest, getFriendRequestStatus } from "@/apiService/lib/friendRequest";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateUserInStore } from "@/redux/slices/authSlice";
import NotificationLoader from "./ui/NotificationLoader";

const NotificationSetting = ({ onReadAll, onDeleteAll, notifications }: {onReadAll: () => void, onDeleteAll: () => void, notifications: notificationType[]}) => {
	const shouldShow = notifications.length === 0;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="w-8 h-8 rounded-full bg-transparent mr-1">
					<Button
						variant="ghost"
						className="w-full h-full rounded-full flex items-center justify-center p-0"
					>
						<Ellipsis className="w-6 h-6" />
					</Button>
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-80 mr-28">
				<Button
					variant="ghost"
					className="w-full pl-2 justify-start gap-3 items-center"
					onClick={onReadAll}
					disabled={shouldShow}
				>
					<Check size={18} />
					<p>Mark all as read</p>
				</Button>
				<Button
					variant="ghost"
					className="w-full pl-2 justify-start gap-3 items-center"
					onClick={onDeleteAll}
					disabled={shouldShow}
				>
					<BadgeX size={18} />
					<p>Delete all notifications</p>
				</Button>
				<Button
					variant="ghost"
					className="w-full pl-2 justify-start gap-3 items-center"
				>
					<Dock size={18} />
					<Link to="/notifications">Open notifications</Link>
				</Button>
			</PopoverContent>
		</Popover>
	);
};

const Notifications = ({
	notifications,
	onReadAll,
	onDeleteAll,
}: {
	notifications: notificationType[];
	setNotificationCount: (count: number) => void;
	onReadAll: () => void;
	onDeleteAll: () => void;
}) => {
	const currentUser = useSelector((state: RootState) => state.auth.user);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(true);

	const [notificationStatus, setNotificationStatus] = useState<{
		[key: string]: NotificationStatus;
	}>({});

    const [unreadNotifications, setUnreadNotifications] = useState(
		[] as notificationType[]
	);

	const [readNotifications, setReadNotifications] = useState(
		[] as notificationType[]
	);

    useEffect(() => {
		setUnreadNotifications(
			notifications.filter((notification) => !notification.read)
		);
		setReadNotifications(
			notifications.filter((notification) => notification.read)
		);
	}, [notifications]);

	useEffect(() => {
		const fetchFriendRequestStatuses = async () => {
			const statusUpdates: { [key: string]: NotificationStatus } = {};

			for (const notification of notifications) {
				if (notification.type === "friend_request") {
					try {
						const response = await getFriendRequestStatus(
							notification.initiator._id
						);
						statusUpdates[notification._id] = response.data;
					} catch (error) {
						console.error(
							"Error fetching friend request status",
							error
						);
					}
				}
			}
			setNotificationStatus(statusUpdates);
			setLoading(false);
		};

		fetchFriendRequestStatuses();
	}, [notifications]);

	const notiText: Record<string, string> = {
		like: "Liked your post!",
		dislike: "Disliked your post!",
		comment: "Commented on your post!",
		like_comment: "Liked your comment!",
		dislike_comment: "Disliked your comment!",
		reply_comment: "Replied to your comment!",
		friend_request: "Sent you a friend request!",
	};

    const notiIcon: Record<string, React.ReactNode> = {
		friend_request: (
			<div
				className="bg-no-repeat rounded-full w-6 h-6 bg-auto"
				style={{
					backgroundImage:
						'url("https://static.xx.fbcdn.net/rsrc.php/v3/yO/r/olLJu84lqHJ.png")',
					backgroundPosition: "-4px -1193px",
					width: "20px",
					height: "20px",
				}}
			></div>
		),
		like: (
			<div
				className="bg-no-repeat rounded-full w-8 h-8 bg-auto"
				style={{
					backgroundImage:
						'url("https://scontent-arn2-1.xx.fbcdn.net/m1/v/t6/An-HX414PnqCVzyEq9OFFdayyrdj8c3jnyPbPcierija6hpzsUvw-1VPQ260B2M9EbxgmP7pYlNQSjYAXF782_vnvvpDLxvJQD74bwdWEJ0DhcErkDga6gazZZUYm_Q.png?ccb=10-5&oh=00_AYDqlT9VPdo90jALL2TFH2zFRr1O0Qms4vOhL2IjlmW5Iw&oe=66891BE3&_nc_sid=7da55a")',
					width: "20px",
					height: "20px",
				}}
			></div>
		),
		dislike: (
			<div
				className="bg-no-repeat rounded-full w-6 h-6 bg-auto"
				style={{
					backgroundImage:
						'url("https://scontent-arn2-1.xx.fbcdn.net/m1/v/t6/An-HX414PnqCVzyEq9OFFdayyrdj8c3jnyPbPcierija6hpzsUvw-1VPQ260B2M9EbxgmP7pYlNQSjYAXF782_vnvvpDLxvJQD74bwdWEJ0DhcErkDga6gazZZUYm_Q.png?ccb=10-5&oh=00_AYDqlT9VPdo90jALL2TFH2zFRr1O0Qms4vOhL2IjlmW5Iw&oe=66891BE3&_nc_sid=7da55a")',
					transform: "rotate(180deg)",
					width: "20px",
					height: "20px",
				}}
			></div>
		),
		comment: (
			<div
				className="bg-no-repeat rounded-full w-6 h-6 bg-auto"
				style={{
					backgroundImage:
						'url("https://static.xx.fbcdn.net/rsrc.php/v3/yO/r/olLJu84lqHJ.png")',
					backgroundPosition: "-1px -1945px",
					width: "24px",
					height: "24px",
				}}
			></div>
		),
		reply_comment: (
			<div
				className="bg-no-repeat rounded-full w-6 h-6 bg-auto"
				style={{
					backgroundImage:
						'url("https://static.xx.fbcdn.net/rsrc.php/v3/yO/r/olLJu84lqHJ.png")',
					backgroundPosition: "-1px -1945px",
					width: "24px",
					height: "24px",
				}}
			></div>
		),
		like_comment: (
			<div
				className="bg-no-repeat rounded-full w-8 h-8 bg-auto"
				style={{
					backgroundImage:
						'url("https://scontent-arn2-1.xx.fbcdn.net/m1/v/t6/An-HX414PnqCVzyEq9OFFdayyrdj8c3jnyPbPcierija6hpzsUvw-1VPQ260B2M9EbxgmP7pYlNQSjYAXF782_vnvvpDLxvJQD74bwdWEJ0DhcErkDga6gazZZUYm_Q.png?ccb=10-5&oh=00_AYDqlT9VPdo90jALL2TFH2zFRr1O0Qms4vOhL2IjlmW5Iw&oe=66891BE3&_nc_sid=7da55a")',
					width: "20px",
					height: "20px",
				}}
			></div>
		),
		dislike_comment: (
			<div
				className="bg-no-repeat rounded-full w-6 h-6 bg-auto"
				style={{
					backgroundImage:
						'url("https://scontent-arn2-1.xx.fbcdn.net/m1/v/t6/An-HX414PnqCVzyEq9OFFdayyrdj8c3jnyPbPcierija6hpzsUvw-1VPQ260B2M9EbxgmP7pYlNQSjYAXF782_vnvvpDLxvJQD74bwdWEJ0DhcErkDga6gazZZUYm_Q.png?ccb=10-5&oh=00_AYDqlT9VPdo90jALL2TFH2zFRr1O0Qms4vOhL2IjlmW5Iw&oe=66891BE3&_nc_sid=7da55a")',
					transform: "rotate(180deg)",
					width: "20px",
					height: "20px",
				}}
			></div>
		),
	};
	// TODO: Fix a button with ellipsis for handling single notifications (delete, read)
	// const handleReadNotification = async (notificationId: string) => {
	// 	try {
	// 		await onReadOne(notificationId);
	// 	} catch (error) {
	// 		const errorMessage = handleAxiosError(error);
	// 		if (errorMessage) {
	// 			toast(errorMessage)
	// 		}
	// 	}
	// }


	const handleAcceptFriendRequest = async (notification: notificationType) => {
		try {
			await acceptFriendRequest(notification?.initiator._id);
			setNotificationStatus((prevStatus) => ({
				...prevStatus,
				[notification._id]: "accepted",
			}));

			if (currentUser) {
				const updatedUser = {
					...currentUser,
					follows: [...currentUser.follows, notification.initiator],
				};

				window.localStorage.setItem(
					"user",
					JSON.stringify(updatedUser)
				);
				dispatch(updateUserInStore(updatedUser));
			}
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleDeclineFriendRequest = async (
		notification: notificationType
	) => {
		try {
			await declineFriendRequest(notification.initiator._id);
			setNotificationStatus((prevStatus) => ({
				...prevStatus,
				[notification._id]: "declined",
			}));
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const renderNotificationButtons = (notification: notificationType) => {
		if (notificationStatus[notification._id] === "accepted") {
			return <p className="text-primary/40 text-sm">Request accepted</p>;
		} else if (notificationStatus[notification._id] === "declined") {
			return <p className="text-primary/40 text-sm">Request declined</p>;
		} else {
			return (
				<div>
					<p className="text-xs">{notiText[notification?.type]}</p>

					<div className="flex gap-2 mt-2">
						<Button
							onClick={() =>
								handleAcceptFriendRequest(
									notification
								)
							}
						>
							Accept
						</Button>
						<Button
							onClick={() =>
								handleDeclineFriendRequest(
									notification
								)
							}
						>
							Decline
						</Button>
					</div>
				</div>
			);
		}
	};

	return (
		<div className="grid gap-2 p-2">
			<div className="space-y-2">
				<div className="flex justify-between">
					<h2 className="text-xl font-bold">Notifications</h2>
					<NotificationSetting
						onReadAll={onReadAll}
						onDeleteAll={onDeleteAll}
						notifications={notifications}
					/>
				</div>
			</div>
			{notifications.length > 0 ? (
				<div>
					{unreadNotifications.length > 0 && (
						<div>
							<div className="text-md font-semibold flex justify-between items-center">
								<h3>New</h3>
								<Link to="/notifications">
									<Button
										variant="ghost"
										className="flex items-center justify-center"
									>
										Show all
									</Button>
								</Link>
							</div>
						</div>
					)}
					<div>
						{unreadNotifications.length > 0 && (
							<div>
								{loading ? (
									<div className="space-y-2">
										{notifications.map((notification) => (
											<div>
												<NotificationLoader
													notification={notification}
													newNoti={true}
												/>
											</div>
										))}
									</div>
								) : (
									<div>
										{unreadNotifications.map(
											(notification) => (
												<div key={notification._id}>
													{notification.post ? (
														<Link
															to={`posts/${notification.post?._id}`}
														>
															<div
																key={
																	notification._id
																}
																className="flex relative justify-between hover:bg-accent group p-2 rounded-md transition-colors duration-200"
															>
																<div className="flex flex-row gap-1 items-center">
																	<div className="relative p-2">
																		<Avatar className="w-14 h-14">
																			<AvatarImage
																				src={
																					notification
																						.initiator
																						.profilePicture
																				}
																				alt="profile pic"
																				className=""
																			/>
																			<AvatarFallback className="group-hover:bg-background/30">
																				{getInitials(
																					notification
																						.initiator
																						.firstname ??
																						"",
																					notification
																						.initiator
																						.lastname ??
																						""
																				)}
																			</AvatarFallback>
																		</Avatar>
																		<div className="absolute bottom-1 right-1">
																			{
																				notiIcon[
																					notification
																						.type
																				]
																			}
																		</div>
																	</div>

																	<div>
																		<span className="font-semibold">
																			{
																				notification
																					.initiator
																					.firstname
																			}{" "}
																			{
																				notification
																					.initiator
																					.lastname
																			}
																		</span>
																		<p className="text-xs">
																			{
																				notiText[
																					notification
																						?.type
																				]
																			}
																		</p>
																	</div>
																</div>
																<div className="text-sm">
																	{moment(
																		notification.createdAt
																	).fromNow()}
																</div>
																<div className="absolute bottom-3 right-3 bg-blue-300 h-3 w-3 rounded-full"></div>
															</div>
														</Link>
													) : (
														<div
															key={
																notification._id
															}
															className="flex relative justify-between hover:bg-accent group p-2 rounded-md transition-colors duration-200"
														>
															<div className="flex flex-row gap-1 items-center">
																<div className="relative p-2">
																	<Avatar className="w-14 h-14">
																		<AvatarImage
																			src={
																				notification
																					.initiator
																					.profilePicture
																			}
																			alt="profile pic"
																			className=""
																		/>
																		<AvatarFallback className="group-hover:bg-background/30">
																			{getInitials(
																				notification
																					.initiator
																					.firstname ??
																					"",
																				notification
																					.initiator
																					.lastname ??
																					""
																			)}
																		</AvatarFallback>
																	</Avatar>
																	<div className="absolute bottom-1 right-1">
																		{
																			notiIcon[
																				notification
																					.type
																			]
																		}
																	</div>
																</div>

																<div>
																	<span className="font-semibold">
																		{
																			notification
																				.initiator
																				.firstname
																		}{" "}
																		{
																			notification
																				.initiator
																				.lastname
																		}
																	</span>
																	{notification?.type ===
																	"friend_request" ? (
																		renderNotificationButtons(
																			notification
																		)
																	) : (
																		<p className="text-xs">
																			{
																				notiText[
																					notification
																						?.type
																				]
																			}
																		</p>
																	)}
																</div>
															</div>
															<div className="text-sm">
																{moment(
																	notification.createdAt
																).fromNow()}
															</div>
															<div className="absolute bottom-3 right-3 bg-blue-300 h-3 w-3 rounded-full"></div>
														</div>
													)}
												</div>
											)
										)}
									</div>
								)}
							</div>
						)}
					</div>
					{readNotifications.length > 0 && (
						<div>
							<div className="text-md font-semibold flex items-center justify-between">
								<h3>Eariler</h3>
							</div>
							<div>
								{loading ? (
									<div className="space-y-2">
										{notifications.map((notification) => (
											<div>
												<NotificationLoader
													notification={notification}
													newNoti={false}
												/>
											</div>
										))}
									</div>
								) : (
									<div>
										{readNotifications
											.slice(0, 50)
											.map((notification) => (
												<div key={notification._id}>
													{notification.post ? (
														<Link
															to={`posts/${notification.post._id}`}
														>
															<div
																key={
																	notification._id
																}
																className="flex justify-between hover:bg-accent group p-2 rounded-md transition-colors duration-200"
															>
																<div className="flex flex-row gap-1 items-center">
																	<div className="relative p-2">
																		<Avatar className="w-14 h-14">
																			<AvatarImage
																				src={
																					notification
																						.initiator
																						.profilePicture
																				}
																				alt="profile pic"
																				className=""
																			/>
																			<AvatarFallback className="group-hover:bg-background/30">
																				{getInitials(
																					notification
																						.initiator
																						.firstname ??
																						"",
																					notification
																						.initiator
																						.lastname ??
																						""
																				)}
																			</AvatarFallback>
																		</Avatar>
																		<div className="absolute bottom-1 right-1">
																			{
																				notiIcon[
																					notification
																						.type
																				]
																			}
																		</div>
																	</div>
																	<div>
																		<span className="font-semibold">
																			{
																				notification
																					.initiator
																					.firstname
																			}{" "}
																			{
																				notification
																					.initiator
																					.lastname
																			}
																		</span>
																		<p className="text-xs">
																			{
																				notiText[
																					notification
																						?.type
																				]
																			}
																		</p>
																	</div>
																</div>
																<div className="text-sm">
																	{moment(
																		notification.createdAt
																	).fromNow()}
																</div>
															</div>
														</Link>
													) : (
														<div
															key={
																notification._id
															}
															className="flex justify-between hover:bg-accent group p-2 rounded-md transition-colors duration-200"
														>
															<div className="flex flex-row gap-1 items-center">
																<div className="relative p-2">
																	<Avatar className="w-14 h-14">
																		<AvatarImage
																			src={
																				notification
																					.initiator
																					.profilePicture
																			}
																			alt="profile pic"
																			className=""
																		/>
																		<AvatarFallback className="group-hover:bg-background/30">
																			{getInitials(
																				notification
																					.initiator
																					.firstname ??
																					"",
																				notification
																					.initiator
																					.lastname ??
																					""
																			)}
																		</AvatarFallback>
																	</Avatar>
																	<div className="absolute bottom-1 right-1">
																		{
																			notiIcon[
																				notification
																					.type
																			]
																		}
																	</div>
																</div>
																<div>
																	<span className="font-semibold">
																		{
																			notification
																				.initiator
																				.firstname
																		}{" "}
																		{
																			notification
																				.initiator
																				.lastname
																		}
																	</span>
																	{notification?.type ===
																	"friend_request" ? (
																		renderNotificationButtons(
																			notification
																		)
																	) : (
																		<p className="text-xs">
																			{
																				notiText[
																					notification
																						?.type
																				]
																			}
																		</p>
																	)}
																</div>
															</div>
															<div className="text-sm">
																{moment(
																	notification.createdAt
																).fromNow()}
															</div>
														</div>
													)}
												</div>
											))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col justify-center text-center items-center gap-3 h-[480px]">
					<Dock className="w-10 h-10" />
					<h1 className="text-xl font-bold">No notifications yet</h1>
					<p className="text-sm">
						We'll let you know when we have something for you
					</p>
				</div>
			)}
		</div>
	);
};

export default Notifications;
