import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, TOKEN_STORAGE } from './config';

/**
 * Types for API requests and responses
 */
export type ApiResponse<T> = {
  data: T;
  status: number;
  headers?: Record<string, string>;
};

export type ApiError = {
  message: string;
  status: number;
  data?: any;
};

/**
 * Base API service that provides methods for making HTTP requests
 */
class ApiService {
  /**
   * Retrieves the access token from storage
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  /**
   * Adds authentication headers if a token is available
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers = { ...API_CONFIG.HEADERS };
    const token = await this.getAccessToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Performs an HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    customHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;
      const headers = customHeaders || await this.getAuthHeaders();
      
      const config: RequestInit = {
        method,
        headers,
        ...(data && method !== 'GET' ? { body: JSON.stringify(data) } : {}),
      };
      
      // Add a timeout to the request
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${API_CONFIG.TIMEOUT}ms`));
        }, API_CONFIG.TIMEOUT);
      });
      
      // Perform the request with a timeout
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]) as Response;
      
      // Check if the response is OK (status 2xx)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || `Erreur ${response.status}: ${response.statusText}`,
          status: response.status,
          data: errorData
        };
      }
      
      // Parse the JSON response
      const responseData = await response.json() as T;
      
      console.log(`[API] ${method} Response: ${url}`, {
        status: response.status,
        dataPreview: JSON.stringify(responseData).substring(0, 100) + '...'
      });
      
      return {
        data: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      console.log(`[API] ${method} Error: ${endpoint}`, error);
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 0
        };
      }
      throw error;
    }
  }

  /**
   * Performs a GET request
   */
  public async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    // Add query parameters if they exist
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url = `${endpoint}?${queryString}`;
    }
    
    return this.request<T>(url, 'GET');
  }

  /**
   * Performs a POST request
   */
  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data);
  }

  /**
   * Performs a PUT request
   */
  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data);
  }

  /**
   * Performs a DELETE request
   */
  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }

  /**
   * Stores authentication tokens
   */
  public async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(TOKEN_STORAGE.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Removes authentication tokens (logout)
   */
  public async clearAuthTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_STORAGE.ACCESS_TOKEN,
        TOKEN_STORAGE.REFRESH_TOKEN
      ]);
    } catch (error) {
      console.error('Error removing tokens:', error);
      throw error;
    }
  }
}

// Export a single instance of the API service
export const apiService = new ApiService();
export default apiService;
