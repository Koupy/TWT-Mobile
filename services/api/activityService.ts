import apiService from './apiService';
import { API_CONFIG } from './config';

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

export interface CreateActivityRequest {
  badge_id: string;
  location: string;
  success: boolean;
  timestamp: string;
  user_id?: string;
  details?: string;
}

/**
 * Service for managing badge usage activities
 * Note: This service anticipates the future implementation of activity endpoints in the API
 */
class ActivityService {
  // Get all activities
  public async getAllActivities(): Promise<Activity[]> {
    try {
      // Always use real API with actual integration
      const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.ACTIVITIES);
      return this.transformActivities(response.data);
    } catch (error) {
      console.error('Error retrieving activities from API:', error);
      throw error;
    }
  }

  /**
   * Get activities for a specific badge
   */
  public async getActivitiesByBadge(badgeId: string): Promise<Activity[]> {
    try {
      // Always use real API
      const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.ACTIVITIES_BY_BADGE(badgeId));
      return this.transformActivities(response.data);
    } catch (error) {
      console.error(`Error retrieving activities for badge ${badgeId} from API:`, error);
      throw error; // Propagate error
    }
  }

  /**
   * Get activities for a specific user
   */
  public async getActivitiesByUser(userId: string): Promise<Activity[]> {
    try {
      // Always use real API
      const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.ACTIVITIES_BY_USER(userId));
      return this.transformActivities(response.data);
    } catch (error) {
      console.error(`Error retrieving activities for user ${userId} from API:`, error);
      throw error; // Propagate error
    }
  }

  /**
   * Create a new activity
   */
  public async createActivity(activity: CreateActivityRequest): Promise<Activity> {
    try {
      // Always use real API
      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.ACTIVITIES, activity);
      return this.transformActivity(response.data);
    } catch (error) {
      console.error('Error creating activity via API:', error);
      throw error; // Propagate error
    }
  }

  /**
   * Transform API activity data
   */
  private transformActivities(data: any[]): Activity[] {
    return data.map(item => this.transformActivity(item));
  }

  /**
   * Transform an API activity
   */
  private transformActivity(item: any): Activity {
    return {
      id: item.id,
      badgeId: item.badge_id || item.badgeId,
      badgeName: item.badge_name || item.badgeName,
      location: item.location,
      timestamp: item.timestamp || item.created_at,
      success: item.success,
      userId: item.user_id || item.userId,
      details: item.details
    };
  }

  /**
   * Fake activity data for development
   */
  private getFakeActivities(): Activity[] {
    return [
      {
        id: '1',
        badgeId: '1',
        badgeName: 'Badge Principal',
        location: 'Entrée Principale',
        timestamp: new Date().toISOString(),
        success: true,
        userId: 'user1'
      },
      {
        id: '2',
        badgeId: '2',
        badgeName: 'Badge Parking',
        location: 'Barrière Entrée',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
        success: true,
        userId: 'user1'
      },
      {
        id: '3',
        badgeId: '3',
        badgeName: 'Badge Bureau',
        location: 'Bureau 42',
        timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
        success: true,
        userId: 'user1'
      },
      {
        id: '4',
        badgeId: '1',
        badgeName: 'Badge Principal',
        location: 'Entrée Secondaire',
        timestamp: new Date(Date.now() - 25 * 60 * 60000).toISOString(), // 25 hours ago
        success: false,
        userId: 'user1',
        details: 'Accès refusé - Badge expiré'
      }
    ];
  }
}

// Export a single instance of the activity service
export const activityService = new ActivityService();
export default activityService;
