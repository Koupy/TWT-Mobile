import { Ionicons } from '@expo/vector-icons';

/**
 * Types for badges
 */
export interface Badge {
  id: string;
  name: string;
  type: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  location?: string;
  description?: string;
  lastUsed?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Types for activities
 */
export interface Activity {
  id: string;
  badgeId: string;
  badgeName: string;
  location: string;
  timestamp: string;
  success: boolean;
  userId?: string;
  details?: string;
}

/**
 * Types for user
 */
export interface User {
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

/**
 * Types for authentication
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user?: User;
  setUser?: (user: User | undefined) => void;
}
