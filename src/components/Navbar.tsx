import { ModeToggle } from "./theme/mode-toggle";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { User } from "@/apiService/types/User";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { getInitials } from "@/utils";
import { Bell, Home, LogIn, SquareStack, Users } from "lucide-react";
import { Tooltip, TooltipProvider } from "./ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Notifications from "./Notifications";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { notificationType } from "@/apiService/types/Notification";
import { deleteAllNotifications, getNotifications, readAllNotifications } from "@/apiService/lib/notificationRequest";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";

const MobileNavbar = () => {
    return (
        <SheetHeader>
            <SheetTitle>Hello World!</SheetTitle>
            <SheetDescription>How are you doing?</SheetDescription>
        </SheetHeader>
    )
}

const Navbar = () => {
	const user: User | null = useSelector((state: RootState) => state.auth.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [notificationCount, setNotificationCount] = useState(0);
	const [notifications, setNotifications] = useState<notificationType[]>([]);

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const notificationResponse = await getNotifications();
				const notifications: notificationType[] = notificationResponse.data;
				setNotifications(notifications);
				setNotificationCount(notifications.filter((notification) => !notification.read).length);
			} catch (error) {
				const errorMessage = handleAxiosError(error);
				if (!errorMessage) return;
				toast(errorMessage);
			}
		};

		fetchNotifications();
	}, []);

    const onLogoutClick = () => {
        dispatch(logout());
		navigate("/login");
	}

	const onFriendsClick = () => {
		navigate("/following");
	}

	const onProfileClick = () => {
		navigate("/myprofile")
	}

	const handleReadAllNotifications = async () => {
		try {
			await readAllNotifications();
			const updatedNotifications = notifications.map((notification) => ({
				...notification,
				read: true,
			}));
			setNotifications(updatedNotifications);
			setNotificationCount(0);
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (!errorMessage) return;
			toast(errorMessage);
		}
	};

	// const handleReadNotification = async (notificationId: string) => {
	// 	try {
	// 		await readNotification(notificationId);
	// 		const updatedNotifications = notifications.map((notification) =>
    //         notification._id === notificationId
    //             ? { ...notification, read: true }
    //             : notification
	// 		);
	// 		setNotifications(updatedNotifications);
	// 		setNotificationCount((prevCount) => prevCount - 1);
	// 	} catch (error) {
	// 		const errorMessage = handleAxiosError(error);
	// 		if (errorMessage) {
	// 			toast(errorMessage);
	// 		}
	// 	}
	// }

	const handleDeleteAllNotifications = async () => {
		try {
			await deleteAllNotifications();
			setNotifications([]);
			setNotificationCount(0);
			toast("Deleted all notifications.")
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	}

	return (
		<header className="sticky min-h-fit flex justify-between top-0 p-4 xl:px-10 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex gap-0 xl:gap-20">
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							className="gap-2 items-center xl:hidden hover:bg-transparent pl-0"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5"
								/>
							</svg>
						</Button>
					</SheetTrigger>
					<SheetContent side="left">
						<MobileNavbar />
					</SheetContent>
				</Sheet>

				<div className="hidden xl:flex">
					<Link to="/">
						<img
							src="https://studenter.miun.se/~dajo1903/dt167g/project/dist/public/logo.svg"
							alt="logo"
							className="hidden dark:flex"
						/>
						<img
							src="https://studenter.miun.se/~dajo1903/dt167g/project/dist/public/logo_dark.svg"
							alt="logo"
							className="dark:hidden"
						/>
					</Link>
				</div>
			</div>
			<div className="flex gap-4 items-center">
				<div>
					<Link to="/">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" className="p-2">
										<Home size={20} />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
									<p>Home</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Link>
				</div>
				{user?.admin && (
					<div className="flex flex-row gap-4">
						<Link to="/users/all">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" className="p-2">
											<Users size={20} />
										</Button>
									</TooltipTrigger>
									<TooltipContent className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
										<p>All users</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Link>
						<Link to="/posts/all">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" className="p-2">
											<SquareStack size={20} />
										</Button>
									</TooltipTrigger>
									<TooltipContent className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
										<p>All posts</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</Link>
					</div>
				)}
				<ModeToggle />
				<Popover>
					<PopoverTrigger
						asChild
						onClick={() => setNotificationCount(0)}
					>
						<div className="relative">
							<Button variant="ghost" className="p-2 group">
								<Bell size={20} />
								{notificationCount > 0 && (
									<div className="absolute group-hover:bg-primary-foreground text-xs top-0 right-0 bg-secondary flex items-center justify-center w-5 h-5 rounded-full">
										{notificationCount}
									</div>
								)}
							</Button>
						</div>
					</PopoverTrigger>
					<PopoverContent className="bg-primary-foreground w-96 mr-20 relative p-0">
						<ScrollArea className="w-full h-[550px]">
							<Notifications
								notifications={notifications}
								setNotificationCount={setNotificationCount}
								onReadAll={handleReadAllNotifications}
								onDeleteAll={handleDeleteAllNotifications}
							/>
						</ScrollArea>
					</PopoverContent>
				</Popover>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Avatar>
								<AvatarImage src={user?.profilePicture} />
								<AvatarFallback>
									{getInitials(
										user?.firstname ?? "",
										user?.lastname ?? ""
									)}
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-44">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="hover:cursor-pointer"
								onClick={() => onProfileClick()}
							>
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem
								className="hover:cursor-pointer"
								onClick={() => onFriendsClick()}
							>
								Following
							</DropdownMenuItem>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => onLogoutClick()}
								className="hover:cursor-pointer"
							>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Link to="/login">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" className="p-2">
										<LogIn />
									</Button>
								</TooltipTrigger>
								<TooltipContent className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
									<p>Log in</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</Link>
				)}
			</div>
		</header>
	);
};

export default Navbar;
