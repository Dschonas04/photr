export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Scrapbook {
  id: number;
  user_id: number;
  title: string;
  description: string;
  cover_color: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  scrapbook_id: number;
  title: string;
  content: string;
  image_url: string;
  page_order: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
