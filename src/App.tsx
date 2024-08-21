import { ThemeProvider } from "./components/theme/theme-provider";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import Following from "./pages/Following";
import { ModeToggle } from "./components/theme/mode-toggle";
import Navbar from "./components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { User } from "./apiService/types/User";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { useState } from "react";
import VisitProfilePage from "./pages/VisitProfilePage";
import Users from "./pages/Users";
import Posts from "./pages/Posts";
import MyProfilePage from "./pages/MyProfilePage";
import SessionAlertDialog from "./components/containers/SessionAlertDialog";
import LoadingScreen from "./components/containers/LoadingScreen";
import NotFound from "./pages/NotFound";
import ViewPost from "./pages/ViewPost";

const BASE_PATH = "/~dajo1903/dt167g/project/dist/public";

function Layout() {
	const location = useLocation();
	const user: User | null = useSelector(
		(state: RootState) => state.auth.user
	);

	return user ? (
		// TODO: fix general app layout here (navbar, sidebars etc)
		<div className="w-full h-screen flex flex-col xl:flex-row bg-background">
			{/* <MobileNavbar /> */}

			<div className="flex-1 overflow-y-auto relative">
				<Navbar />
				<div className="p-4 2xl:px-10">
					<Outlet />
				</div>
			</div>
		</div>
	) : (
		<Navigate to="/login" state={{ from: location }} replace />
	);
}

function LoginLayout() {
	return (
		<div className="w-full h-screen min-h-screen flex bg-background">
			<div className="absolute p-2 w-full h-full flex">
				<div className="h-fit relative">
					<img
						src={`${BASE_PATH}/logo.svg`}
						alt="logo"
						className="object-cover bg-no-repeat hidden dark:block"
					/>
					<img
						src={`${BASE_PATH}/logo_dark.svg`}
						alt="logo dark"
						className="object-cover bg-no-repeat block dark:hidden"
					/>
				</div>
			</div>
			<div className="absolute bottom-0 pb-2 pl-2 z-20">
				<ModeToggle />
			</div>
			<section className="flex flex-1 justify-center gap-3 items-center flex-col py-10 z-10">
				<Outlet />
			</section>
			<img
				src={`${BASE_PATH}/side-img.svg`}
				alt="side image"
				className="hidden xl:block h-screen brightness-50 w-1/2 object-cover bg-no-repeat"
			/>
		</div>
	);
}

function App() {
	const [isLoading, setIsLoading] = useState(true);

	const handleLoadingComplete = () => {
		setIsLoading(false);
	};

	if (isLoading) {
		return <LoadingScreen onComplete={handleLoadingComplete} />
	}
	
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<main className="w-full min-h-screen bg-background">
				<Routes>
					<Route element={<Layout />}>
						<Route
							index
							path="/"
							element={<Navigate to="/homepage" />}
						/>
						<Route path="/homepage" element={<Homepage />} />
						<Route path="/following" element={<Following />} />
						<Route path="/visitprofile/:userId" element={<VisitProfilePage />} />
						<Route path="/users/all" element={<Users/>}/>
						<Route path="/posts/all" element={<Posts/>}/>
						<Route path="/myprofile" element={<MyProfilePage />} />
						<Route path="/posts/:postId" element={<ViewPost />} />
					</Route>
					<Route element={<LoginLayout />}>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
				<Toaster position="top-center" />
				<SessionAlertDialog />
			</main>
		</ThemeProvider>
	);
}

export default App;
