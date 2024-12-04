import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useTranslation } from "react-i18next"
import {
	Form,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	redirect,
	useActionData,
	useLoaderData,
} from "react-router"
import type { LinksFunction } from "react-router"
import { useChangeLanguage } from "remix-i18next/react"
import type { Route } from "./+types/root"
import { getUserFromRequest } from "./queries/user.server"
import { commitServerSession, getServerSession } from "./session.server"
import tailwindcss from "./tailwind.css?url"
// Create a client
export const queryClient = new QueryClient()
export async function loader({ context, request }: Route.LoaderArgs) {
	const { lang, clientEnv } = context
	const player = await getUserFromRequest(request)
	const searchParams = new URL(request.url).searchParams
	const redirectTo = searchParams.get("redirectTo") ?? undefined

	return { lang, clientEnv, player, redirectTo }
}

export const action = async ({ context: { db }, request }: Route.ActionArgs) => {
	const formData = await request.formData()
	const name = formData.get("name") as string | null
	const redirectTo = formData.get("redirectTo") as string | null

	if (!name)
		return {
			error: "Name is required",
		}
	const newPlayer = await db.player.create({
		data: {
			name,
		},
	})
	const session = await getServerSession()
	session.set("id", newPlayer.id)
	if (redirectTo) {
		const roomId = redirectTo.split("/")[1]
		await db.activePlayer.create({
			data: {
				playerId: newPlayer.id,
				roomId,
			},
		})
	}
	throw redirect(redirectTo ?? "/", {
		headers: new Headers({
			"Set-Cookie": await commitServerSession(session),
		}),
	})
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: tailwindcss }]

export const handle = {
	i18n: "common",
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
	const { i18n } = useTranslation()
	return (
		<html className="overflow-y-auto overflow-x-hidden" lang={i18n.language} dir={i18n.dir()}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="w-full h-full">
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

function NameForm() {
	const data = useActionData<typeof action>()
	const loaderData = useLoaderData<typeof loader>()
	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="mx-auto max-w-2xl">
				<Form method="post" className="space-y-4">
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">
							Your Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							className="mt-1 px-4 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						/>
						<p className="text-sm text-red-500">{data?.error}</p>
					</div>
					<input type="hidden" name="redirectTo" value={loaderData.redirectTo} />

					<button
						type="submit"
						className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Sign up
					</button>
				</Form>
			</div>
		</div>
	)
}

export default function App({ loaderData }: Route.ComponentProps) {
	const { lang, clientEnv, player } = loaderData
	useChangeLanguage(lang)

	return (
		<>
			{player !== null ? <Outlet /> : <NameForm />}
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: We set the window.env variable to the client env */}
			<script dangerouslySetInnerHTML={{ __html: `window.env = ${JSON.stringify(clientEnv)}` }} />
		</>
	)
}
