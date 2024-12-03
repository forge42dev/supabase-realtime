import { createClient } from "@supabase/supabase-js"
import type { db } from "~/db.server"

// biome-ignore lint/nursery/noProcessEnv: <explanation>
const polyEnv = typeof process !== "undefined" ? process.env : window.env

const { SUPABASE_KEY, SUPABASE_URL } = polyEnv

export const supabase = createClient<typeof db>(SUPABASE_URL, SUPABASE_KEY)
