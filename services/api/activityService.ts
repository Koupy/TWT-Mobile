import apiService from './apiService';
import { API_CONFIG } from './config';
import mockData, { getActivitiesByBadgeId, getActivitiesByUserId } from './mockData';

// Flag to use mock data when API is unavailable
const USE_MOCK_DATA = true; // Set to false in production

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
  badgeId: string;
  location: string;
  success: boolean;
  userId?: string;
  details?: string;
}

/**
 * Service for managing badge usage activities
 * Note: This service anticipates the future implementation of activity endpoints in the API
 */
class ActivityService {
  /**
   * Get all activities
   */
  public async getAllActivities(): Promise<Activity[]> {
    try {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for activities');
        // Use mock activities
        return mockData.activities.map(activity => this.transformActivity(activity));
      } else {
        // Try to use real API
        try {
          const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.ACTIVITIES);
          return this.transformActivities(response.data);
        } catch (error) {
          console.warn('Activities endpoint not available, using test data');
          return this.getFakeActivities();
        }
      }
    } catch (error) {
      console.error('Error retrieving activities:', error);
      // Fallback to fake activities in case of error
      return this.getFakeActivities();
    }
  }

  /**
   * Get activities for a specific badge
   */
  public async getActivitiesByBadge(badgeId: string): Promise<Activity[]> {
    try {
      if (USE_MOCK_DATA) {
        console.log(`Using mock data for badge ${badgeId} activities`);
        // Use mock activities filtered by badge ID
        const mockBadgeActivities = getActivitiesByBadgeId(badgeId);
        return mockBadgeActivities.map(activity => this.transformActivity(activity));
      } else {
        // Try to use real API
        try {
          const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.ACTIVITIES_BY_BADGE(badgeId));
          return this.transformActivities(response.data);
        } catch (error) {
          console.warn(`Badge activities endpoint not available, filtering test data for badge ${badgeId}`);
          return this.getFakeActivities().filter(activity => activity.badgeId === badgeId);
        }
      }
    } catch (error) {
      console.error(`Error retrieving activities for badge ${badgeId}:`, error);
      // Fallback to fake activities in case of error
      return this.getFakeActivities().filter(activity => activity.badgeId === badgeId);
    }
  }

  /**
   * Get activities for a specific user
   */
  public async getActivitiesByUser(userId: string): Promise<Activity[]> {
    try {
      if (USE_MOCK_DATA) {
        console.log(`Using mock data for user ${userId} activities`);
        // Use mock activities filtered by user ID
        const mockUserActivities = getActivitiesByUserId(userId);
        return mockUserActivities.map(activity => this.transformActivity(activity));
      } else {
        // Try to use real API
        try {
          const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.ACTIVITIES_BY_USER(userId));
          return this.transformActivities(response.data);
        } catch (error) {
          console.warn(`User activities endpoint not available, filtering test data for user ${userId}`);
          return this.getFakeActivities().filter(activity => activity.userId === userId);
        }
      }
    } catch (error) {
      console.error(`Error retrieving activities for user ${userId}:`, error);
      // Fallback to fake activities in case of error
      return this.getFakeActivities().filter(activity => activity.userId === userId);
    }
  }

  /**
   * Create a new activity
   */
  public async createActivity(activity: CreateActivityRequest): Promise<Activity> {
    try {
      if (USE_MOCK_DATA) {
        console.log('Using mock data to simulate activity creation');
        
        // Get badge information to create a realistic activity
        const badge = mockData.badges.find(b => b.id === activity.badgeId);
        
        // Create a new mock activity
        const newActivity: Activity = {
          id: (mockData.activities.length + 1).toString(),
          badgeId: activity.badgeId,
          badgeName: badge ? JSON.parse(badge.custom_data).type : 'Badge',
          location: activity.location,
          timestamp: new Date().toISOString(),
          success: activity.success,
          userId: activity.userId || '1', // Default to first user if not specified
          details: activity.details
        };
        
        // In a real implementation, we would add this to the database
        // For testing, we just return the simulated activity
        return newActivity;
      } else {
        // Try to use real API
        try {
          const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.ACTIVITIES, activity);
          return this.transformActivity(response.data);
        } catch (error) {
          console.warn('Activity creation endpoint not available, simulating creation');
          // Simulate activity creation
          const newActivity: Activity = {
            id: Math.random().toString(36).substring(2, 11),
            badgeId: activity.badgeId,
            badgeName: 'Badge Simulé', // Fictitious name
            location: activity.location,
            timestamp: new Date().toISOString(),
            success: activity.success,
            userId: activity.userId,
            details: activity.details
          };
          return newActivity;
        }
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      // Even in case of error, return a simulated activity to allow the app to continue
      const fallbackActivity: Activity = {
        id: 'error-' + Math.random().toString(36).substring(2, 7),
        badgeId: activity.badgeId,
        badgeName: 'Badge (Error)',
        location: activity.location,
        timestamp: new Date().toISOString(),
        success: activity.success,
        userId: activity.userId,
        details: 'Error creating activity: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
      return fallbackActivity;
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
