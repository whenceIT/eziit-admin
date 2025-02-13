export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  user_type: string;

  [key: string]: unknown;
}
