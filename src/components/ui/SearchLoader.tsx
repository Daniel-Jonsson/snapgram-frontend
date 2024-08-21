import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";

const PostLoader = () => {

	return (
		<div className="flex items-center w-1/2 m-auto">
			<Card className="flex flex-col w-full">
				<CardHeader>
					<CardTitle>
						<Skeleton className="h-8 w-[125px]" />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-10 w-full rounded-sm" />
				</CardContent>
			</Card>
		</div>
	);
};

export default PostLoader;