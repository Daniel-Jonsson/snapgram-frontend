import { getUsers } from "@/apiService/lib/userRequest";
import { User } from "@/apiService/types/User";
import UserCard from "@/components/containers/UserCard";
import PostLoader from "@/components/ui/PostLoader";
import SearchLoader from "@/components/ui/SearchLoader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Users = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("");

	const filteredUsers = users.filter((user) => {
		const filterLowerCase = filter.toLowerCase();
		const firstNameMatches = user.firstname
			.toLowerCase()
			.includes(filterLowerCase);
		const lastNameMatches = user.lastname
			.toLowerCase()
			.includes(filterLowerCase);
		const userNameMatches = user.username
			.toLowerCase()
			.includes(filterLowerCase);

		return firstNameMatches || lastNameMatches || userNameMatches;
	});

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const userData = await getUsers();
				setUsers(userData.data);
				setTimeout(() => {
					// Timeout to show the skeleton
					setLoading(false);
				}, 1500);
			} catch (err) {
				const errorMessage = handleAxiosError(err);
				if (errorMessage) {
					toast(errorMessage);
				}
			}
		};
		fetchUsers();
	}, []);

	const handleDeleteUser = (userId: string) => {
		setUsers((prevUsers) =>
			prevUsers.filter((user) => user._id !== userId)
		);
	};

	const handleUpdateUser = (updatedUser: User) => {
		const updatedUsers = users.map((user) => {
			if (user._id === updatedUser._id) {
				return updatedUser;
			}
			return user;
		});
		setUsers(updatedUsers);
	};

	return (
		<div>
			{loading ? (
				<div className="space-y-8">
					<div className="flex items-center w-full m-auto">
						<SearchLoader />
					</div>
					{filteredUsers?.map((user) => (
						<PostLoader key={user._id} classes="" /> // Postloader works as user loader also.
					))}
				</div>
			) : (
				<div className="space-y-8">
					<div className="flex items-center w-1/2 m-auto">
						<Card className="flex flex-col w-full">
							<CardHeader>
								<h2 className="text-pretty text-2xl font-semibold ">
									Filter users
								</h2>
							</CardHeader>
							<CardContent>
								<Input
									placeholder="Search..."
									className="h-12"
									onChange={(e) => setFilter(e.target.value)}
								/>
							</CardContent>
						</Card>
					</div>
					{filteredUsers.length > 0 ? (
						<div>
							{filteredUsers.map((user) => (
								<UserCard
									user={user}
									key={user._id}
									classes="w-1/2"
									onDelete={handleDeleteUser}
									onUpdate={handleUpdateUser}
								/>
							))}
						</div>
					) : (
						<h2 className="flex justify-center items-center text-pretty text-2xl font-semibold">
							No user found :(
						</h2>
					)}
				</div>
			)}
		</div>
	);
};

export default Users;
