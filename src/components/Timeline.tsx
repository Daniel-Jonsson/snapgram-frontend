import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Post } from '@/apiService/types/Post';
import PostCard from './containers/PostCard';
import { handleAxiosError } from '@/lib/utils';
import { toast } from 'sonner';

const Timeline = ({ posts, onUpdate, onLike, onDislike, onDelete }: { posts: Post[], onUpdate: (post: Post) => void; onLike: (postId: string) => void; onDislike: (postId: string) => void; onDelete: (postId: string) => void }) => {

	const handleUpdatePost = (updatedPost: Post) => {
		try {
            onUpdate(updatedPost);
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            if (errorMessage) {
                toast(errorMessage);
            }
        }
	};

	const handleLikePost = async (postId: string) => {
		try {
			onLike(postId)
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleDislikePost = async (postId: string) => {
		try {
			onDislike(postId)
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
		}
	};

	const handleDeletePost = (postId: string) => {
		try {
            onDelete(postId);
        } catch (error) {
            const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
        }
	};

	return (
		<Card className="bg-primary-foreground/40 rounded-sm">
			<CardHeader>
				<div className="p-4 text-2xl font-semibold">Timeline</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="list" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger
							value="list"
							className="flex gap-1 items-center justify-center"
						>
							<LayoutList size={18} />
							List view
						</TabsTrigger>
						<TabsTrigger
							value="grid"
							className="flex gap-1 items-center justify-center"
						>
							<LayoutGrid size={18} />
							Grid view
						</TabsTrigger>
					</TabsList>
					<TabsContent value="list">
						<div className="pt-8 space-y-4">
							{posts.map((post) => (
								<PostCard
									post={post}
									key={post._id}
									classes="w-full"
									onDelete={handleDeletePost}
									onUpdate={handleUpdatePost}
									onLike={handleLikePost}
									onDislike={handleDislikePost}
								/>
							))}
						</div>
					</TabsContent>
					<TabsContent
						value="grid"
						className="grid grid-cols-2 gap-2 w-full pt-8 pb-4"
					>
						{posts.map((post) => (
							<PostCard
								post={post}
								key={post._id}
								classes="w-full"
								onDelete={handleDeletePost}
								onUpdate={handleUpdatePost}
								onLike={handleLikePost}
								onDislike={handleDislikePost}
							/>
						))}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default Timeline