export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: any;
  session: any;
  error?: any;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string;
}