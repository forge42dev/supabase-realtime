import { reactRouter } from "@react-router/dev/vite"
import { reactRouterDevTools } from "react-router-devtools"
import { reactRouterHonoServer } from "react-router-hono-server/dev"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import { iconsSpritesheet } from "vite-plugin-icons-spritesheet"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [
		babel({
			include: ["./app/**/*"],
			filter: (name) => name.endsWith("tsx"),
		}),
		reactRouterDevTools(),
		reactRouter(),
		reactRouterHonoServer({
			dev: {
				exclude: [/^\/(resources)\/.+/],
			},
		}),
		tsconfigPaths(),
		iconsSpritesheet({
			inputDir: "./resources/icons",
			outputDir: "./app/library/icon/icons",
			fileName: "icon.svg",
			withTypes: true,
		}),
	],
	server: {
		open: true,
		// biome-ignore lint/nursery/noProcessEnv: Its ok to use process.env here
		port: Number(process.env.PORT || 4280),
	},
})
