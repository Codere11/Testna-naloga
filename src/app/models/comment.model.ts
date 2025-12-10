export interface Comment {
  id: number; // negative for local-only
  productId: number;
  author: string;
  content: string;
  created_at: string; // ISO
  updated_at: string; // ISO
}