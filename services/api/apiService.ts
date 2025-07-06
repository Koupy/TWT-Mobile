import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, TOKEN_STORAGE } from './config';
import logger from '../../utils/logger';

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
      logger.error('API', 'Error retrieving access token:', error);
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
   * Performs an HTTP request with error handling, timeout, and fallback mode
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      // Log pour débuggage
      logger.info('API', `Début requête ${endpoint} ${method}`);
      
      // Construire l'URL finale en s'assurant que le préfixe /api est présent
      const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
        ? API_CONFIG.BASE_URL.slice(0, -1)
        : API_CONFIG.BASE_URL;
      
      let finalEndpoint = endpoint;
      // Normaliser l'endpoint en retirant le slash initial pour éviter les doublons
      if (finalEndpoint.startsWith('/')) {
        finalEndpoint = finalEndpoint.substring(1);
      }
      // S'assurer que l'endpoint commence par 'api/'
      if (!finalEndpoint.startsWith('api/')) {
        finalEndpoint = `api/${finalEndpoint}`;
      }
      
      const url = `${baseUrl}/${finalEndpoint}`;
      logger.info('API', `URL complète: ${url} (${method})`);
      logger.debug('API', `Détails: BASE_URL=${API_CONFIG.BASE_URL}, endpoint=${endpoint}`);
      
      const headers = { ...await this.getAuthHeaders(), ...customHeaders };
      
      // Options avancées pour la requête fetch
      const options: RequestInit = {
        method,
        headers,
        mode: 'cors' as RequestMode,
        cache: 'no-cache' as RequestCache,
        credentials: 'same-origin' as RequestCredentials,
        redirect: 'follow' as RequestRedirect,
        referrerPolicy: 'no-referrer' as ReferrerPolicy,
        ...(data && { body: JSON.stringify(data) })
      };
      
      // Create timeout promise with longer timeout (15s)
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject({
          message: 'Délai de connexion dépassé',
          status: 408,
          data: null
        }), 15000); // 15 secondes au lieu de la config
      });
      
      // Race between fetch and timeout with better error handling
      let response;
      try {
        response = await Promise.race([
          fetch(url, options),
          timeoutPromise
        ]);
        logger.info('API', `Réponse reçue pour ${endpoint}`);
      } catch (error) {
        logger.error('API', `${endpoint} Error: ${method} [${error}]`);
        throw {
          message: 'Network request failed',
          status: 0,
          data: error
        };
      }
      
      // Parse response data
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as unknown as T;
      }
      
      // Handle error responses
      if (!response.ok) {
        throw {
          message: this.getErrorMessage(response.status, responseData),
          status: response.status,
          data: responseData
        };
      }
      
      logger.info('API', `${method} Response: ${url}`, {
        status: response.status,
        dataPreview: JSON.stringify(responseData).substring(0, 100) + '...'
      });
      
      return {
        data: responseData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      logger.error('API', `${method} Error: ${endpoint}`, error);
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
    
    return this.request<T>('GET', url);
  }

  /**
   * Performs a POST request
   */
  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * Performs a PUT request
   */
  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  /**
   * Performs a DELETE request
   */
  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Stores authentication tokens
   */
  public async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(TOKEN_STORAGE.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      logger.error('API', 'Error storing tokens:', error);
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
      logger.error('API', 'Error clearing tokens:', error);
      throw error;
    }
  }

  /**
   * Maps HTTP status codes to user-friendly error messages
   */
  private getErrorMessage(status: number, data: any): string {
    switch (status) {
      case 400:
        return 'Requête invalide';
      case 401:
        return 'Non autorisé - Veuillez vous reconnecter';
      case 403:
        return 'Accès refusé';
      case 404:
        return 'Ressource introuvable';
      case 408:
        return 'Délai de connexion dépassé';
      case 500:
        return 'Erreur serveur interne';
      case 502:
      case 503:
      case 504:
        return 'Service temporairement indisponible';
      default:
        // Try to extract message from response data if available
        if (data && typeof data === 'object') {
          if (data.message) return data.message;
          if (data.error) return data.error;
        }
        return `Erreur (${status})`;
    }
  }
}

// Export a single instance of the API service
export const apiService = new ApiService();
export default apiService;
