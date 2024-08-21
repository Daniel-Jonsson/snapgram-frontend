import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [
		react()
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: path.resolve(
			__dirname,
			"../dt167_project_frontend/dist/public"
		),
		// Other build options...
	},
	base: "https://studenter.miun.se/~dajo1903/dt167g/project/dist/public/",
});