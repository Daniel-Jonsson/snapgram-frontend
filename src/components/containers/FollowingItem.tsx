import { User } from "@/apiService/types/User";
import { getInitials } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { Link } from "react-router-dom";
import UnfollowAlertDialog from "../ui/UnfollowAlertDialog";
import { Button } from "../ui/button";

interface Props {
	userInfo: User;
	handleUnfollow: (userId: string) => void;
}

const FollowingItem = ({ userInfo, handleUnfollow }: Props) => {
	const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);

	const handleUnfollowClick = () => {
		setUnfollowDialogOpen(true);
	};

	return (
		<div className="friend-item ml-5 border-gray-500 border-2 rounded-lg mt-4 shadow-lg">
			<div className="flex items-center justify-between">
				<div className="friend-info flex items-center">
					<Avatar className="h-12 w-12 rounded-full overflow-hidden mr-3 ml-3">
						<AvatarImage
							src={userInfo?.profilePicture}
							className="h-full w-full object-cover"
						/>
						<AvatarFallback className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-1s">
							{getInitials(
								userInfo.firstname ?? "",
								userInfo.lastname ?? ""
							)}
						</AvatarFallback>
					</Avatar>
					<div>
						<Link
							to={`/visitprofile/${userInfo._id}`}
							className="text-lg font-semibold hover:underline"
						>{`${userInfo.firstname} ${userInfo.lastname}`}</Link>
						<p className="mb-2">{userInfo.description}</p>
					</div>
				</div>

				<Button
					className="p-2 bg-gray-400 rounded-lg shadow-md m-3"
					onClick={handleUnfollowClick}
				>
					Unfollow
				</Button>
			</div>
			<UnfollowAlertDialog
				open={unfollowDialogOpen}
				setOpen={setUnfollowDialogOpen}
				onUnfollow={() => {
					handleUnfollow(userInfo._id);
					setUnfollowDialogOpen(false);
				}}
			/>
		</div>
	);
};

export default FollowingItem;
