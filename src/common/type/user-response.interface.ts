export interface User {
  id: number;
  email: string;
  username: string;
  image: string | null;
  bio: string | null;
  password?: string;
}

export interface UserResponse {
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
    token: string;
  };
}
