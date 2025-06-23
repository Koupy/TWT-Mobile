import apiService from './apiService';
import { API_CONFIG } from './config';

// Types for badges (items)

export interface Badge {
  id: string; // UUID
  name: string;
  color: string;
  status: string;
  expiration_date: string | null; // Format: YYYY-MM-DD or null
  user_id: string; // UUID of the associated user
  created_at: string;
  updated_at: string;
}

// Request payload for creating a new Badge.
export interface CreateBadgeRequest {
  name: string;
  color: string;
  status: string;
  expiration_date: string | null; // Format: YYYY-MM-DD or null
  user_id: string; // UUID of the user to associate the badge with
}

// Request payload for updating an existing Badge.
export interface UpdateBadgeRequest {
  name?: string;
  color?: string;
  status?: string;
  expiration_date?: string | null; // Format: YYYY-MM-DD or null
}

// Service for managing badges (items)
class BadgeService {
  // Get all badges
  public async getAllBadges(): Promise<Badge[]> {
    try {
      // Always use real API
      const response = await apiService.get<Badge[]>(API_CONFIG.ENDPOINTS.BADGES);
      return response.data; // API data should now directly match Badge[]
    } catch (error) {
      console.error('Error retrieving badges:', error);
      throw error;
    }
  }

  // Get a badge by its ID
  public async getBadgeById(id: string): Promise<Badge> {
    try {
      // Always use real API
      const response = await apiService.get<Badge>(API_CONFIG.ENDPOINTS.BADGE_BY_ID(id));
      return response.data; // API data should now directly match Badge
    } catch (error) {
      console.error(`Error retrieving badge ${id}:`, error);
      throw error;
    }
  }

  // Create a new badge
  public async createBadge(badge: CreateBadgeRequest): Promise<Badge> {
    try {
      // The 'badge' payload should now directly match what the API expects
      const response = await apiService.post<Badge>(API_CONFIG.ENDPOINTS.BADGES, badge);
      return response.data; // API data should now directly match Badge
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  }

  // Update an existing badge
  public async updateBadge(id: string, badge: UpdateBadgeRequest): Promise<Badge> {
    try {
      // The 'badge' payload should now directly match what the API expects for an update
      const response = await apiService.put<Badge>(API_CONFIG.ENDPOINTS.BADGE_BY_ID(id), badge);
      return response.data; // API data should now directly match Badge
    } catch (error) {
      console.error(`Error updating badge ${id}:`, error);
      throw error;
    }
  }

  // Delete a badge
  public async deleteBadge(id: string): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.BADGE_BY_ID(id));
    } catch (error) {
      console.error(`Error deleting badge ${id}:`, error);
      throw error;
    }
  }
}

// Export a single instance of the badge service
export const badgeService = new BadgeService();
export default badgeService;
