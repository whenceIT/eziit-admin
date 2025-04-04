export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  user_type: string;

  [key: string]: unknown;
}

export interface Transaction {
  id: number;
  paid_by: string;
  paid_to: string;
  store: number | null; 
  paid_by_type: string | null;
  paid_to_type: string | null;
  amount: number;
  time_stamp: string;
  transaction_type: string | null;
  paid_by_user: User | null;
  paid_to_user: User | null;
}


export interface Employer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}