export interface User {
  id: number;
  email: string;
  username: string;
  image: string | null;
  bio: string | null;
  password?: string;
}

export interface UserResponse {
  user: Omit<User, 'id'> & { token: string };
}
