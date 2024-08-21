import { Comment } from "./Comment";
import { User } from "./User";

export type Post = {
    author: User;  //TODO: change this to specific type if possible, don't know how at the moment. Using Schema.Types.ObjectId results in error.
    _id: string;
    body: string;
    image: string,
    createdAt: string;
    likes: User[]
    dislikes: User[]
    comments: Comment[];
}