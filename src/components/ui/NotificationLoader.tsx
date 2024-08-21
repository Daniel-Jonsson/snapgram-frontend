import { Skeleton } from "./skeleton";
import { notificationType } from "@/apiService/types/Notification";

const NotificationLoader = ({
	notification,
    newNoti
}: {
	notification: notificationType;
    newNoti: boolean;
}) => {
	const renderNotificationButtons = () => {
		return (
			<div className="space-y-1">
                <Skeleton className="w-[125px] h-4" />
				<div className="flex items-center space-x-1">
					<Skeleton className="h-8 w-[75px]" />
					<Skeleton className="h-8 w-[75px]" />
				</div>
			</div>
		);
	};

	return (
		<div className="flex relative justify-between hover:bg-accent group p-2 rounded-md transition-colors duration-200">
			<div className="flex flex-row gap-1 items-center">
				<div className="relative p-2">
					<Skeleton className="w-14 h-14 rounded-full" />
					<div className="absolute bottom-1 right-1">
						<Skeleton className="w-[20px] h-[20px] rounded-full" />
					</div>
				</div>
				<div className="space-y-1">
					<span className="font-semibold">
						<Skeleton className="w-[100px] h-4" />
					</span>
					{notification?.type === "friend_request" &&
						renderNotificationButtons()}
				</div>
			</div>
			<div className="text-sm">
				<Skeleton className="w-[100px] h-4" />
			</div>
			{newNoti && (
				<Skeleton className="absolute bottom-3 right-3 bg-blue-200 h-3 w-3 rounded-full" />
			)}
		</div>
	);
};

export default NotificationLoader;