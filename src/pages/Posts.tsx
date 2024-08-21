import { dislikePost, getPosts, likePost } from "@/apiService/lib/postRequest";
import { Post } from "@/apiService/types/Post";
import PostCard from "@/components/containers/PostCard";
import PostLoader from "@/components/ui/PostLoader";
import SearchLoader from "@/components/ui/SearchLoader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Posts = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true); // Initial state is true since we load posts.
	const [filter, setFilter] = useState("");

	const filteredPosts = posts.filter((post) => {
		const filterLowerCase = filter.toLowerCase();
		const firstNameMatches = post.author.firstname
			.toLowerCase()
			.includes(filterLowerCase);
		const lastNameMatches = post.author.lastname
			.toLowerCase()
			.includes(filterLowerCase);
		const userNameMatches = post.author.username
			.toLowerCase()
			.includes(filterLowerCase);
		const bodyMatches = post.body.toLowerCase().includes(filterLowerCase);

		return (
			firstNameMatches ||
			lastNameMatches ||
			bodyMatches ||
			userNameMatches
		);
	});
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const postData = await getPosts();
				setPosts(postData.data);
				setTimeout(() => {
					// Timeout to show the skeleton
					setLoading(false);
				}, 1500);
			} catch (error) {
				const errorMessage = handleAxiosError(error);
				if (errorMessage) {
					toast(errorMessage);
				}
			}
		};

		fetchPosts();
	}, []);

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

	return (
		<div>
			{loading ? (
				<div className="space-y-8">
					<div className="flex items-center w-full m-auto">
						<SearchLoader />
					</div>
					{filteredPosts?.map((post) => (
						<PostLoader key={post._id} classes="" />
					))}
				</div>
			) : (
				<div className="space-y-8">
					<div className="flex items-center w-1/2 m-auto">
						<Card className="flex flex-col w-full">
							<CardHeader>
								<h2 className="text-pretty text-2xl font-semibold ">
									Filter posts
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
					{filteredPosts.length > 0 ? (
						<div className="w-full space-y-4 pb-2 flex flex-col items-center">
							{filteredPosts.map((post) => (
								<PostCard
									post={post}
									key={post._id}
									classes="w-1/2"
									onDelete={handleDeletePost}
									onUpdate={handleUpdatePost}
									onLike={handleLikePost}
									onDislike={handleDislikePost}
								/>
							))}
						</div>
					) : (
						<h2 className="flex justify-center items-center text-pretty text-2xl font-semibold">
							No post found :(
						</h2>
					)}
				</div>
			)}
		</div>
	);
};

export default Posts;
