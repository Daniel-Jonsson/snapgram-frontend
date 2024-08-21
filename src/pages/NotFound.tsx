import Navbar from "@/components/Navbar"
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
		<div>
			<Navbar />
			<div className="flex h-[calc(100vh-80px)] items-start pt-28 justify-center">
				<div className="flex justify-center flex-col items-center space-y-6">
					<h1 className="text-pretty text-4xl font-semibold">
						Sorry, this page isn't available.
					</h1>
					<p>
						The link you followed may be broken, or the page may
						have been removed.{" "}
						<span className="text-[#004d83] dark:text-blue-600 hover:text-[#0c79c7] hover:dark:text-blue-700">
							<Link to="/">Go back to Snapgram.</Link>
						</span>
					</p>
				</div>
			</div>
		</div>
  );
}

export default NotFound