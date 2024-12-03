import { createCookieSessionStorage } from "react-router"
import { initEnv } from "./env.server"

const env = initEnv()

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
	cookie: {
		name: "bolt-session",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		secrets: [env.SESSION_SECRET],
		maxAge: 60 * 60 * 24 * 30, // 30 days
	},
})

export const getServerSession = getSession
export const commitServerSession = commitSession
export const destroyServerSession = destroySession
