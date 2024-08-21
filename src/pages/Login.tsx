import { loginUser } from "@/apiService/lib/userRequest";
import { User } from "@/apiService/types/User";
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
import { login } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const Login = () => {
	const user: User | null = useSelector(
		(state: RootState) => state.auth.user
	);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const loginSchema = z.object({
		email: z.string().min(1, "You need to provide an email or username"),
		password: z.string().min(1, "You need to provide a password"),
	});

	function LoginForm() {
		const [showPassword, setShowPassword] = useState(false);
		const form = useForm<z.infer<typeof loginSchema>>({
			resolver: zodResolver(loginSchema),
			defaultValues: {
				email: "",
				password: "",
			},
		});

		return (
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-3"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input
										placeholder="username or email"
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
												setShowPassword((prev) => !prev)
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
					{isLoading ? (
						<Button type="button" disabled className="w-full">
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Please wait
						</Button>
					) : (
						<Button type="submit" className="w-full">
							Login
						</Button>
					)}
				</form>
			</Form>
		);
	}

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		try {
			setIsLoading(true);
			const res = await loginUser(values);
			dispatch(login(res.data));
			setIsLoading(false);
		} catch (error) {
			const errorMessage = handleAxiosError(error);
			if (errorMessage) {
				toast(errorMessage);
			}
			setIsLoading(false);
		}
	}

	useEffect(() => {
		user && navigate("/homepage");
	}, [navigate, user]);
	return (
		<div className="w-1/2 text-sm md:text-base space-y-3 text-foreground">
			<h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
				Welcome back!
			</h1>
			<p>Please log into your account below</p>
			<LoginForm />
			<p className="text-sm">
				Don't have an account?
				<Link
					to="/register"
					className="text-sm text-pretty hover:text-gray-600 transition-colors font-semibold ml-1"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
};

export default Login;
