import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { addPost } from "@/apiService/lib/postRequest";
import clsx from "clsx";
import { Post } from "@/apiService/types/Post";
import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { AspectRatio } from "./ui/aspect-ratio";
import { handleFileUpload } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { User } from "@/apiService/types/User";
import { getInitials } from "@/utils";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];
const ACCEPTED_IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];
const AddPostSchema = z.object({
	desc: z.string().min(1, {
		message: "The post needs to contain a description",
	}),
	image: z
		.instanceof(FileList)
		.optional()
		.refine(
			(files) => !files?.length || files?.[0]?.size <= MAX_FILE_SIZE,
			{ message: "Max image size is 5MB." }
		)
		.refine(
			(files) =>
				!files?.length ||
				ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type) ||
				ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
			{
				message:
					"Only .jpg, .jpeg, .png and .webp formats are supported.",
			}
		),
});
export type AddPostFormData = z.infer<typeof AddPostSchema>;

const CreatePost = ({
	classes,
	onPostCreated,
}: {
	classes: string;
	onPostCreated: (post: Post) => void;
}) => {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const user: User | null = useSelector((state: RootState) => state.auth.user);

	const form = useForm<AddPostFormData>({
		resolver: zodResolver(AddPostSchema),
		defaultValues: {
			desc: "",
			image: undefined,
		},
	});

	const onSubmit = async (data: AddPostFormData) => {
		try {
			setLoading(true);
			console.log(data.image)
			const uri = data.image && (await handleFileUpload(data.image?.[0]));
			const newPost = await addPost(data.desc, uri);
			onPostCreated(newPost.data);
			setLoading(false);
			setSelectedImage(null);
			toast.success("Your post is published");
			form.reset({
				desc: "",
				image: undefined,
			});
		} catch (error) {
			console.error("Error adding the post:", error);
			toast.error("Failed to add the post. Please try again later.");
			setLoading(false);
		}
	};

	const handleFileButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleReset = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
			fileInputRef.current.type = "text";
			fileInputRef.current.type = "file";
		}
	}
	const { isDirty } = form.formState;

	// const PostForm = () => {
	//     const form = useForm<z.infer<typeof AddPostSchema>>({
	//         resolver: zodResolver(AddPostSchema)
	//     });

	//     useEffect(() => {
	// 		form.reset();
	// 	}, [form]);

	//     const onSubmit = async (data: z.infer<typeof AddPostSchema>) => {
	// 		try {
	//             data.image = selectedImage
	// 			// const resp = await addPost(data.desc);
	// 			// onPostCreated(resp.data);
	// 			toast.success("Your post is published");
	// 		} catch (error) {
	// 			console.error("Error adding the post:", error);
	// 			toast.error("Failed to add the post. Please try again later.");
	// 		}
	// 	};
	// }
	return (
		<div className="w-full">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full flex"
				>
					<Card
						className={clsx(
							"w-full bg-primary-foreground/40 rounded-md",
							classes
						)}
					>
						<CardHeader>
							<div className="flex gap-3">
								<Avatar className="hidden xl:flex">
									<AvatarImage
										src={user?.profilePicture}
										className="w-10 h-10"
									/>
									<AvatarFallback>
										{getInitials(
											user?.firstname ?? "",
											user?.lastname ?? ""
										)}
									</AvatarFallback>
								</Avatar>
								<div className="w-full">
									<FormField
										control={form.control}
										name="desc"
										render={({ field }) => (
											<FormItem>
												<FormControl className="">
													<Textarea
														placeholder="What's on your mind..."
														className="h-fit focus-visible:ring-0"
														{...field}
														rows={5}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent className="w-full pr-0 pl-0 pt-4">
							{selectedImage && (
								<div className="w-full flex items-center justify-center pb-4">
									<Card className="bg-primary-foreground/20 w-4/5 p ring-0 ring-accent rounded-sm flex flex-col items-center">
										<CardHeader className="flex items-end w-full p-0 relative"></CardHeader>
										<CardContent className="w-full pt-6 relative">
											<div className="absolute z-10 top-7 right-7">
												<Button
													className="w-12 h-12 rounded-full bg-[#474949]/85 hover:bg-[#525455]/85 text-primary"
													onClick={() => {
														setSelectedImage(null);
														handleReset();
														form.resetField("image", {keepDirty: false})
													}
													}
												>
													<X className="text-white" />
												</Button>
											</div>
											<AspectRatio
												ratio={16 / 9}
												className="bg-muted rounded-md z-0"
											>
												<img
													src={URL.createObjectURL(
														selectedImage
													)}
													alt="Selected image"
													className="rounded-md object-fill w-full h-full"
												/>
											</AspectRatio>
										</CardContent>
									</Card>
								</div>
							)}
							<Separator />
						</CardContent>
						<CardFooter>
							<div className="flex items-center w-full">
								<div className="flex flex-1 gap-4">
									<FormField
										control={form.control}
										name="image"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Button
														variant="secondary"
														className="hover:cursor-pointer flex items-center gap-2"
														type="button"
														onClick={
															handleFileButtonClick
														}
													>
														<Input
															type="file"
															className="hidden"
															id="fileInput"
															accept="image/*"
															onBlur={
																field.onBlur
															}
															name={field.name}
															onChange={(e) => {
																field.onChange(
																	e.target
																		.files
																);
																setSelectedImage(
																	e.target
																		.files?.[0] ||
																		null
																);
															}}
															ref={fileInputRef}
														/>
														<Image />
														<span className="whitespace-nowrap">
															Choose an image
														</span>
													</Button>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								{loading ? (
									<Button
										type="button"
										variant="secondary"
										disabled
									>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Please wait
									</Button>
								) : (
									<Button
										variant="secondary"
										type="submit"
										disabled={!isDirty}
									>
										Post
									</Button>
								)}
							</div>
						</CardFooter>
					</Card>
				</form>
			</Form>
		</div>
	);
};

export default CreatePost;