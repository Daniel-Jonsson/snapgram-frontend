import clsx from 'clsx';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Skeleton } from './skeleton';

const PostLoader = ({classes}: {classes: string}) => {

  return (
		<div className="w-full flex flex-col xl:flex-row items-center justify-center pb-4">
			<Card className={clsx("w-1/2 pt-2 pb-2", classes)}>
				<CardHeader>
					<CardTitle>
						<div className="flex flex-col xl:flex-row items-center gap-2">
							<Skeleton className="w-10 h-10 rounded-full" />
							<div className="w-full space-y-2">
								<div className="flex flex-col xl:flex-row gap-1 items-center">
									<Skeleton className={`h-4 w-[100px]`} />
									<Skeleton className={`h-4 w-[75px]`} />
									<Skeleton className="h-4 w-[50px] flex ml-auto" />
								</div>
								<div className="flex">
									<Skeleton className="h-4 w-[100px]" />
								</div>
							</div>
							<div></div>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="text-pretty text-sm space-y-2">
					<Skeleton className={`h-4 w-full`} />
					<Skeleton className={`h-4 w-full`} />
					<Skeleton className={`h-4 w-full`} />
				</CardContent>
			</Card>
		</div>
  );
}

export default PostLoader