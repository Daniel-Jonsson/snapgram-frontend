import { Post } from "./Post";
import { User } from "./User";

enum notiType {
    Like = 'like',
    Dislike = 'dislike',
    Follow = 'follow',
    Comment = 'comment',
    LikeComment = 'like_comment',
    DislikeComment = 'dislike_comment',
    ReplyComment = 'reply_comment',
    FriendRequest = 'friend_request',
}

export type notificationType = {
	_id: string;
	user: User;
	type: notiType;
	initiator: User;
	post?: Post;
	read: boolean;
	createdAt: string;
	updatedAt: string;
};

export type NotificationStatus = "accepted" | "declined";
