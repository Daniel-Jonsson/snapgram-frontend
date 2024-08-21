import { RegisterUser } from "@/apiService/lib/userRequest";
import { userRegister } from "@/apiService/types/User";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleAxiosError } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const Register = () => {
	const [isLoading, setIsLoading] = useState(false);
	const passwordValidation = (regex: string) => new RegExp(regex);
	const user = useSelector((state: RootState) => state.auth.user);
	const navigate = useNavigate();

	const registerSchema = z
		.object({
			firstname: z.string().min(2, { message: "Name is too short." }),
			lastname: z.string().min(2, { message: "Name is too short." }),
			username: z
				.string()
				.min(4, { message: "Username must be at least 4 characters." })
				.max(10, {
					message: "Username must not be over 10 characters.",
				}),
			email: z.string().email({ message: "Invalid email." }),

			password: z
				.string()
				.min(8, { message: "Password must be at least 8 characters." })
				.regex(passwordValidation(`(?=.*?[A-Z])`), {
					message:
						"Password must have at least one uppercase letter.",
				})
				.regex(passwordValidation(`(?=.*?[a-z])`), {
					message:
						"Password must contain at least one lowercase letter.",
				})
				.regex(passwordValidation(`(?=.*?[0-9])`), {
					message: "Password must contain a digit.",
				})
				.regex(passwordValidation(`(?=.*?[#?!@$%^&*-])`), {
					message:
						"Password must contain at least one special character.",
				}),
			confirmPassword: z.string(),
		})
		.superRefine(({ confirmPassword, password }, ctx) => {
			if (confirmPassword !== password) {
				ctx.addIssue({
					code: "custom",
					message: "The passwords don't match",
					path: ["confirmPassword"],
				});
			}
		});

	function onSubmit(values: z.infer<typeof registerSchema>) {
		setIsLoading(true); // Set loading state while querying database
		const user: userRegister = {
			...values,
			admin: false, // Set admin to false, can be changed in mongodb if wanted.
		};
		RegisterUser(user)
			.then(() => {
				setIsLoading(false);
				toast("User successfully created", {
					description: "Navigating to login page...",
					position: "bottom-right",
					duration: 3000,
					onAutoClose: () => navigate("/login"),
				});
			})
			.catch((err) => {
				const errorMessage = handleAxiosError(err);
				if (errorMessage) {
					toast(errorMessage, {
						position: "bottom-right",
						duration: 3000,
					});
				}
				setIsLoading(false);
			});
	}

	function RegisterForm() {
		const [showPassword, setShowPassword] = useState(false);
		const form = useForm<z.infer<typeof registerSchema>>({
			resolver: zodResolver(registerSchema),
			defaultValues: {
				firstname: "",
				lastname: "",
				username: "",
				email: "",
				password: "",
				confirmPassword: "",
			},
		});

		return (
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-3"
				>
					<div className="flex flex-row gap-4 w-full bg-background">
						<div className="w-1/2">
							<FormField
								control={form.control}
								name="firstname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input
												placeholder="John"
												className="shad-input"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="w-1/2">
							<FormField
								control={form.control}
								name="lastname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Doe"
												className="shad-input"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input
										placeholder="JohnDoe21"
										className="shad-input"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="john@doe.example.com"
										className="shad-input"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col xl:flex-row gap-4 w-full bg-background">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="password"
												{...field}
												type={
													showPassword
														? "text"
														: "password"
												}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute
											right-0 top-0 h-full px-3 py-3
											hover:bg-transparent"
												onClick={() =>
													setShowPassword(
														(prev) => !prev
													)
												}
											>
												{showPassword ? (
													<Eye
														className="h-4 w-4"
														aria-hidden="true"
													/>
												) : (
													<EyeOff
														className="h-4 w-4"
														aria-hidden="true"
													/>
												)}
												<span className="sr-only">
													{showPassword
														? "Hide password"
														: "Show password"}
												</span>
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="password"
												{...field}
												type={
													showPassword
														? "text"
														: "password"
												}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute
											right-0 top-0 h-full px-3 py-3
											hover:bg-transparent"
												onClick={() =>
													setShowPassword(
														(prev) => !prev
													)
												}
											>
												{showPassword ? (
													<Eye
														className="h-4 w-4"
														aria-hidden="true"
													/>
												) : (
													<EyeOff
														className="h-4 w-4"
														aria-hidden="true"
													/>
												)}
												<span className="sr-only">
													{showPassword
														? "Hide password"
														: "Show password"}
												</span>
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{isLoading ? (
						<Button type="button" disabled className="w-full">
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Please wait
						</Button>
					) : (
						<Button type="submit" className="w-full">
							Register
						</Button>
					)}
				</form>
			</Form>
		);
	}
	useEffect(() => {
		user && navigate("/homepage");
	}, [navigate, user]);
	return (
		<div className="w-1/2 text-sm md:text-base space-y-3 text-foreground">
			<h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
				Create new account.
			</h1>
			<p>Please provide details below to create account</p>
			<RegisterForm />
			<p className="text-sm">
				Already have an account?
				<Link
					to="/login"
					className="text-sm text-pretty hover:text-gray-600 transition-colors font-semibold ml-1"
				>
					Log in
				</Link>
			</p>
		</div>
	);
};

export default Register;
