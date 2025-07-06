// API Base URL 
// Ne pas ajouter de slash final ni le préfixe /api car ceux-ci seront ajoutés par les endpoints
const API_BASE_URL = 'https://api.twallet.fr';

// API Configuration
export const API_CONFIG = {
  // API base URL
  BASE_URL: API_BASE_URL,
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers for all requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  } as Record<string, string>,

  // Feature flags for API endpoints
  ACTIVITIES_ENABLED: true, // Set to true when activities API is deployed and ready
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/auth/login',
    REFRESH_TOKEN: '/api/auth/refresh',
    
    // Users
    USERS: '/api/users',
    USER_BY_ID: (id: string) => `/api/users/${id}`,
    USERS_BY_ENTITY: (entityId: string) => `/api/users/entity/${entityId}`,
    
    // Association NFC
    NFC_ASSOCIATION: '/api/users/nfc-association',
    NFC_STATUS: '/api/users/nfc-status',
    
    // Entities
    ENTITIES: '/api/entities',
    ENTITY_BY_ID: (id: string) => `/api/entities/${id}`,
    
    // Badges
    BADGES: '/api/badges',
    BADGE_BY_ID: (id: string) => `/api/badges/${id}`,
    BADGES_BY_NFC: (nfcId: string) => `/api/badges/by-nfc/${nfcId}`,
    
    // Activities
    ACTIVITIES: '/api/activities',
    ACTIVITIES_BY_BADGE: (badgeId: string) => `/api/activities/badge/${badgeId}`,
    ACTIVITIES_BY_USER: (userId: string) => `/api/activities/user/${userId}`,
  },
};

// Gestion des tokens d'authentification
export const TOKEN_STORAGE = {
  ACCESS_TOKEN: 'twallet_access_token',
  REFRESH_TOKEN: 'twallet_refresh_token',
};

export default API_CONFIG;
