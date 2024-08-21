import { getUserById, unfollowUser } from "@/apiService/lib/userRequest";
import { User } from "@/apiService/types/User";
import FollowingItem from "@/components/containers/FollowingItem";
import { handleAxiosError } from "@/lib/utils";
import { updateUserInStore } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const Following = () => {
	const user: User | null = useSelector(
		(state: RootState) => state.auth.user
	);
	const [followingData, setFollowingData] = useState<User[]>([]);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchFollowingData = async () => {
			try {
				if (!user) {
					return;
				}
				const follows = user.follows;

				const followingUsersData = await Promise.all(
					follows.map(async (user: User) => {
						try {
							const response = await getUserById(user._id);
							if (response.data) {
								return response.data;
							}
						} catch (error) {
							const errorMessage = handleAxiosError(error);
							if (errorMessage) {
								toast(errorMessage);
							}
						}
					})
				);
				setFollowingData(followingUsersData);
			} catch (error) {
				console.error("Error fetching following data:", error);
			}
		};

		fetchFollowingData();
	}, [user]);

	const handleUnfollow = async (userId: string) => {
		try {
			const resp = await unfollowUser(userId);
			const updatedUser = resp.data;
			setFollowingData((prevFollowingData) =>
				prevFollowingData.filter((user) => user._id !== userId)
			);
			window.localStorage.setItem("user", JSON.stringify(updatedUser));
			if (user) {
				dispatch(updateUserInStore(updatedUser));
			}
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			toast(errorMessage);
		}
	};

	return (
		<div>
			<h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl mb-7">
				Following
			</h1>
			{followingData.map((item) => (
				<FollowingItem
					userInfo={item}
					key={item._id}
					{...item}
					handleUnfollow={handleUnfollow}
				/>
			))}
		</div>
	);
};

export default Following;
