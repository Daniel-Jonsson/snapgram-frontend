import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { User } from "@/apiService/types/User";
import { X } from "lucide-react";

interface DropzoneProps {
	onChange: React.Dispatch<React.SetStateAction<File | null>>;
	onRemove: () => void; // New prop to handle removal
	className?: string;
	user: User | null;
}

export function Dropzone({
	onChange,
	onRemove,
	className,
	user,
	...props
}: DropzoneProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [fileInfo, setFileInfo] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [toggledRemove, setToggledRemove] = useState<boolean>(false);
	const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];
	const ACCEPTED_IMAGE_MIME_TYPES = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
	];

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const { files } = e.dataTransfer;
		handleFiles(files);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { files } = e.target;
		if (files) {
			handleFiles(files);
		}
	};

	const handleFiles = (files: FileList) => {
		const uploadFile = files[0];

		if (
			!(
				ACCEPTED_IMAGE_TYPES.includes(uploadFile.type) ||
				ACCEPTED_IMAGE_MIME_TYPES.includes(uploadFile.type)
			)
		) {
			setError("Only .jpg, .jpeg, .png and .webp formats are supported.");
			return;
		}
		if (uploadFile.size / (1024 * 1024) > 5) {
			setError("Max image size is 5MB.");
			return;
		}
		const fileSizeInKB = Math.round(uploadFile.size / 1024);
		onChange(uploadFile);
		setFileInfo(`Uploaded file: ${uploadFile.name} (${fileSizeInKB} KB)`);
		setError(null);
		setUploadedFile(files[0]);
		setToggledRemove(false);
	};

	const handleButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<Card
			className={`border-2 min-h-96 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50 ${className}`}
			{...props}
		>
			<CardContent
				className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs h-full"
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="flex items-center justify-center text-muted-foreground">
					<span className="font-medium">Drag Files to Upload or</span>
					<Button
						variant="ghost"
						size="sm"
						className="ml-auto flex h-8 space-x-2 px-0 pl-1 text-xs"
						onClick={handleButtonClick}
					>
						Click Here
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept={"image/*"}
						onChange={(e) => {
							handleFileInputChange(e);
						}}
						className="hidden"
						multiple
					/>
				</div>
				<div className="relative w-full" hidden={toggledRemove}>
					{uploadedFile ? (
						<div className="w-full">
							<AspectRatio
								ratio={16 / 9}
								className="rounded-sm bg-muted-foreground"
							>
								<img
									src={URL.createObjectURL(uploadedFile)}
									alt="uploaded"
									className="w-full h-full"
								/>
							</AspectRatio>
						</div>
					) : (
						user?.profilePicture &&
						!toggledRemove && (
							<div className="w-full">
								<AspectRatio
									ratio={16 / 9}
									className="rounded-sm bg-muted-foreground"
								>
									<img
										src={user?.profilePicture}
										alt="current"
										className="w-full h-full"
									/>
								</AspectRatio>
							</div>
						)
					)}
					{user?.profilePicture ? (
						<div className="absolute w-10 h-10 rounded-full top-1 right-1 flex items-center justify-center">
							<Button
								variant="secondary"
								className="w-full h-full rounded-full flex items-center justify-center p-0"
								onClick={() => {
									setToggledRemove(true);
									onRemove();
								}}
							>
								<X className="w-6 h-6" />
							</Button>
						</div>
					) : uploadedFile && (
						<div className="absolute w-10 h-10 rounded-full top-1 right-1 flex items-center justify-center">
							<Button
								variant="secondary"
								className="w-full h-full rounded-full flex items-center justify-center p-0"
								onClick={() => {
									setToggledRemove(true);
									onRemove();
								}}
							>
								<X className="w-6 h-6" />
							</Button>
						</div>
					)}
				</div>
				{fileInfo && !toggledRemove && (
					<p className="text-muted-foreground">{fileInfo}</p>
				)}
				{error && <span className="text-red-500">{error}</span>}
			</CardContent>
		</Card>
	);
}