import axios from 'axios';
import type { User } from '@/types/user';

const API_BASE_URL = 'https://ezitt.whencefinancesystem.com';

export interface SignUpParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  user_type: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/create-user`, params);
    const { token, user } = response.data;
    localStorage.setItem('auth-token', token);
    return user;
  }

  async signIn(params: SignInParams): Promise<User> {
    try {
      const response = await axios.post(`${API_BASE_URL}/sign-in`, params);
      const { token, user } = response.data;
      localStorage.setItem('auth-token', token);
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.response || 'Failed to sign in');
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async getUser(): Promise<User | null> {
    const token = localStorage.getItem('auth-token');
    if (!token) return null;

    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  signOut(): void {
    localStorage.removeItem('auth-token');
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    const token = localStorage.getItem('auth-token');
    if (!token) throw new Error('No authentication token found');

    try {
      const response = await axios.put(`${API_BASE_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }
}

export const authClient = new AuthClient();