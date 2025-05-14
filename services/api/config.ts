// API Configuration
export const API_CONFIG = {
  // API base URL
  BASE_URL: 'http://localhost:8080',
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers for all requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  } as Record<string, string>,
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh',
    
    // Users
    USERS: '/users',
    USER_BY_ID: (id: string) => `/users/${id}`,
    USERS_BY_ENTITY: (entityId: string) => `/users/by-entity/${entityId}`,
    
    // Entities
    ENTITIES: '/entities',
    ENTITY_BY_ID: (id: string) => `/entities/${id}`,
    
    // Badges (items)
    BADGES: '/items',
    BADGE_BY_ID: (id: string) => `/items/${id}`,
    
    // Activities (to be implemented in the API)
    ACTIVITIES: '/activities',
    ACTIVITIES_BY_BADGE: (badgeId: string) => `/activities/badge/${badgeId}`,
    ACTIVITIES_BY_USER: (userId: string) => `/activities/user/${userId}`,
  },
};

// Gestion des tokens d'authentification
export const TOKEN_STORAGE = {
  ACCESS_TOKEN: 'twallet_access_token',
  REFRESH_TOKEN: 'twallet_refresh_token',
};

export default API_CONFIG;
