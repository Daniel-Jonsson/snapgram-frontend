interface CommentProps {
	username: string;
	content: string;
}

const CommentItem = ({ username, content }: CommentProps) => {
	return (
		<div className="border-b mt-3 shadow-md">
			<p className="mb-2 text-gray-500">{username}</p>
			<p className="mb-2 text-sm">{content}</p>
		</div>
	);
};

export default CommentItem;
