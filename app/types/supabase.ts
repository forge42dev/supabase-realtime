export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
	public: {
		Tables: {
			rooms: {
				Row: {
					id: string
					created_at: string
					grid_size: 8 | 16 | 32
					status: "waiting" | "playing" | "finished"
					created_by: string
					current_turn: string | null
					winner_id: string | null
				}
				Insert: {
					id?: string
					created_at?: string
					grid_size: 8 | 16 | 32
					status?: "waiting" | "playing" | "finished"
					created_by: string
					current_turn?: string | null
					winner_id?: string | null
				}
				Update: {
					id?: string
					created_at?: string
					grid_size?: 8 | 16 | 32
					status?: "waiting" | "playing" | "finished"
					created_by?: string
					current_turn?: string | null
					winner_id?: string | null
				}
			}
			players: {
				Row: {
					id: string
					name: string
					room_id: string
					score: number
					is_active: boolean
					scroll_position: { x: number; y: number }
					created_at: string
				}
				Insert: {
					id?: string
					name: string
					room_id: string
					score?: number
					is_active?: boolean
					scroll_position?: { x: number; y: number }
					created_at?: string
				}
				Update: {
					id?: string
					name?: string
					room_id?: string
					score?: number
					is_active?: boolean
					scroll_position?: { x: number; y: number }
					created_at?: string
				}
			}
		}
	}
}
