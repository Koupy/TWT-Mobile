import apiService from './apiService';
import { API_CONFIG } from './config';
import mockData, { getBadgeById, getActivitiesByBadgeId } from './mockData';

// Flag to use mock data when API is unavailable
const USE_MOCK_DATA = true; // Set to false in production

/**
 * Types for badges (items)
 */
export interface Badge {
  id: string;
  name: string;
  description?: string;
  type: string;
  iconName: string;
  color: string;
  location?: string;
  lastUsed?: string;
  price: number; // Corresponds to the price field in the API
  created_at: string;
  updated_at: string;
}

export interface CreateBadgeRequest {
  name: string;
  description?: string;
  price: number;
  // Custom fields for the mobile application
  type?: string;
  iconName?: string;
  color?: string;
  location?: string;
}

export interface UpdateBadgeRequest {
  name?: string;
  description?: string;
  price?: number;
  // Custom fields for the mobile application
  type?: string;
  iconName?: string;
  color?: string;
  location?: string;
}

/**
 * Service for managing badges (items)
 */
class BadgeService {
  /**
   * Get all badges
   */
  public async getAllBadges(): Promise<Badge[]> {
    try {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for badges');
        // Use mock badges
        return mockData.badges.map(item => this.transformItemToBadge(item));
      } else {
        // Use real API
        const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.BADGES);
        
        // Transform API data to Badge format
        return response.data.map(item => this.transformItemToBadge(item));
      }
    } catch (error) {
      console.error('Error retrieving badges:', error);
      if (USE_MOCK_DATA) {
        console.log('Falling back to mock data after API error');
        return mockData.badges.map(item => this.transformItemToBadge(item));
      }
      throw error;
    }
  }

  /**
   * Get a badge by its ID
   */
  public async getBadgeById(id: string): Promise<Badge> {
    try {
      if (USE_MOCK_DATA) {
        console.log(`Using mock data for badge ${id}`);
        // Use mock badge
        const mockBadge = getBadgeById(id);
        if (!mockBadge) {
          throw new Error(`Badge with ID ${id} not found`);
        }
        return this.transformItemToBadge(mockBadge);
      } else {
        // Use real API
        const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.BADGE_BY_ID(id));
        
        // Transform API data to Badge format
        return this.transformItemToBadge(response.data);
      }
    } catch (error) {
      console.error(`Error retrieving badge ${id}:`, error);
      if (USE_MOCK_DATA) {
        console.log('Falling back to mock data after API error');
        const mockBadge = getBadgeById(id);
        if (mockBadge) {
          return this.transformItemToBadge(mockBadge);
        }
      }
      throw error;
    }
  }

  /**
   * Create a new badge
   */
  public async createBadge(badge: CreateBadgeRequest): Promise<Badge> {
    try {
      // Prepare data for the API
      const itemData = {
        name: badge.name,
        description: badge.description,
        price: badge.price,
        // Store custom fields in the description as JSON
        custom_data: JSON.stringify({
          type: badge.type,
          iconName: badge.iconName,
          color: badge.color,
          location: badge.location,
        })
      };
      
      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.BADGES, itemData);
      
      // Transform API data to Badge format
      return this.transformItemToBadge(response.data);
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  }

  /**
   * Update an existing badge
   */
  public async updateBadge(id: string, badge: UpdateBadgeRequest): Promise<Badge> {
    try {
      // First get the existing badge to obtain custom data
      const existingBadge = await this.getBadgeById(id);
      
      // Prepare data for the API
      const itemData: any = {};
      
      if (badge.name !== undefined) itemData.name = badge.name;
      if (badge.description !== undefined) itemData.description = badge.description;
      if (badge.price !== undefined) itemData.price = badge.price;
      
      // Update custom fields
      const customData = {
        type: badge.type !== undefined ? badge.type : existingBadge.type,
        iconName: badge.iconName !== undefined ? badge.iconName : existingBadge.iconName,
        color: badge.color !== undefined ? badge.color : existingBadge.color,
        location: badge.location !== undefined ? badge.location : existingBadge.location,
      };
      
      // Store custom fields in the description as JSON
      itemData.custom_data = JSON.stringify(customData);
      
      const response = await apiService.put<any>(API_CONFIG.ENDPOINTS.BADGE_BY_ID(id), itemData);
      
      // Transform API data to Badge format
      return this.transformItemToBadge(response.data);
    } catch (error) {
      console.error(`Error updating badge ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a badge
   */
  public async deleteBadge(id: string): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.BADGE_BY_ID(id));
    } catch (error) {
      console.error(`Error deleting badge ${id}:`, error);
      throw error;
    }
  }

  /**
   * Transform an API item into a badge for the mobile application
   */
  private transformItemToBadge(item: any): Badge {
    let customData = {};
    
    // Try to parse custom data from the description
    try {
      if (item.custom_data) {
        customData = JSON.parse(item.custom_data);
      } else if (item.description && item.description.startsWith('{') && item.description.endsWith('}')) {
        // Fallback: try to parse the description as JSON
        customData = JSON.parse(item.description);
      }
    } catch (e) {
      console.warn('Error parsing custom data:', e);
    }
    
    // Default values for custom fields
    const defaultType = 'Bâtiment';
    const defaultIconName = 'business';
    const defaultColor = '#0A84FF';
    
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Custom fields with default values
      type: (customData as any)?.type || defaultType,
      iconName: (customData as any)?.iconName || defaultIconName,
      color: (customData as any)?.color || defaultColor,
      location: (customData as any)?.location,
      lastUsed: (customData as any)?.lastUsed,
    };
  }
}

// Export a single instance of the badge service
export const badgeService = new BadgeService();
export default badgeService;
