export type Track = 'week' | 'month';

// Mirrors the `items` table.
export interface Item {
  id: string;
  user_id: string;
  text: string;
  done: boolean;
  created_at: string;
  position_x: number | null;
  position_y: number | null;
  claimed_track: Track | null;
  claimed_at: string | null;
  claimed_due_by: string | null;
}

// Mirrors the `memories` table.
export interface Memory {
  item_id: string;
  user_id: string;
  note: string | null;
  rating: number | null;
  photo_path: string | null;
  created_at: string;
}
