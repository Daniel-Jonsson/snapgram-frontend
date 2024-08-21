import React, { useEffect, useState } from "react";
import { Progress } from "../ui/progress";

interface LoadingScreenProps {
	onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				const nextProgress = prev + 10;
				return nextProgress;
			});
		}, 100);

		const timeout = setTimeout(() => {
			clearInterval(interval);
			setProgress(100); // Ensure the progress bar is full
			onComplete();
		}, 2000);

		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
		};
	}, [onComplete]);

	return (
		<div className="w-full h-screen bg-background flex flex-col items-center justify-center">
			<h2 className="text-pretty font-bold text-xl pb-2">Loading...</h2>
			<Progress value={progress} className="w-1/2" />
		</div>
	);
};

export default LoadingScreen;
