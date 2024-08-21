import { dislikePost, getPost, likePost } from '@/apiService/lib/postRequest';
import { Post } from '@/apiService/types/Post';
import CommentSection from '@/components/containers/CommentSection';
import PostCard from '@/components/containers/PostCard';
import { handleAxiosError } from '@/lib/utils';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

const ViewPost = () => {
    const { postId } = useParams<{ postId?: string }>() ?? {};
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        
        const fetchPost = async () => {
            if (!postId) return;

            try {
                const postResponse = await getPost(postId); 
                setPost(postResponse.data);
            } catch (error) {
                const errorMessage = handleAxiosError(error);
                if (errorMessage) {
                    toast(errorMessage);
                }
            }
        };
        fetchPost();
    }, [postId])

    const handleDeletePost = (postId: string) => {
        console.log(postId)
		setPost(null)
	};

	const handleUpdatePost = (updatedPost: Post) => {
		setPost(updatedPost);
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
		<div className="flex flex-col space-y-4 items-center justify-center w-full">
			<div className='w-full items-center justify-center flex'>
				{post && (
					<PostCard
						post={post}
						classes="w-3/5"
						onDelete={handleDeletePost}
						onUpdate={handleUpdatePost}
						onLike={handleLikePost}
						onDislike={handleDislikePost}
					/>
				)}
			</div>
            <div className='w-full flex items-center justify-center'>
                {post?._id && (
                    <CommentSection post={post} />
                )}
            </div>
		</div>
  );
}

export default ViewPost