import apiService from './apiService';
import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_STORAGE } from './config';

/**
 * Authentication types
 */
export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  entity_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: UserResponse;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Authentication service to manage login, logout and token refresh
 */
class AuthService {
  /**
   * User login
   */
  public async login(username_or_email: string, password: string): Promise<UserResponse> {
    try {
      // Préparer les données de connexion
      const loginData: LoginRequest = {
        username_or_email,
        password
      };

      const response = await apiService.post<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, loginData);

      // Store authentication tokens
      await apiService.setAuthTokens(
        response.data.access_token,
        response.data.refresh_token
      );

      // Store user information
      await this.saveUserInfo(response.data.user);

      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * User logout
   */
  public async logout(): Promise<void> {
    try {
      // Remove authentication tokens
      await apiService.clearAuthTokens();

      // Remove user information
      await AsyncStorage.removeItem('user_info');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<string> {
    try {
      const refreshToken = await AsyncStorage.getItem(TOKEN_STORAGE.REFRESH_TOKEN);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshData: RefreshTokenRequest = {
        refresh_token: refreshToken
      };

      const response = await apiService.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.REFRESH_TOKEN,
        refreshData
      );

      // Update authentication tokens
      await apiService.setAuthTokens(
        response.data.access_token,
        response.data.refresh_token
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Save user information
   */
  private async saveUserInfo(user: UserResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('user_info', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user information:', error);
    }
  }

  /**
   * Get user information
   */
  public async getUserInfo(): Promise<UserResponse | null> {
    try {
      // First try to get from AsyncStorage
      const userInfo = await AsyncStorage.getItem('user_info');

      if (userInfo) {
        return JSON.parse(userInfo);
      }

      return null;
    } catch (error) {
      console.error('Error retrieving user information:', error);
      return null;
    }
  }
}

// Export a single instance of the authentication service
export const authService = new AuthService();
export default authService;
