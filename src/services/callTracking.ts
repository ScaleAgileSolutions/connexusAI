import { getWidgetConfig, Key } from '../constants/config';

interface CallLimit {
  userId: string;
  widgetId: string;
  totalCalls: number;
  maxCalls: number;
  lastResetDate: string;
}

class CallTrackingService {
  private static instance: CallTrackingService;
  private apiBaseUrl: string;
  private widgetConfig: any;

  private constructor() {
    // You can make this configurable through your widget config
    this.apiBaseUrl = 'http://localhost:3000/widget';
    this.widgetConfig = getWidgetConfig();
  }

  static getInstance(): CallTrackingService {
    if (!CallTrackingService.instance) {
      CallTrackingService.instance = new CallTrackingService();
    }
    return CallTrackingService.instance;
  }

  async getCallLimit(userId: string, widgetId: string): Promise<CallLimit> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/call-limits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Key}` // Add your auth token
        },
        body: JSON.stringify({ userId, widgetId })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch call limit');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching call limit:', error);
      throw error;
    }
  }

  async canMakeCall(userId: string, widgetId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/call-limits/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Key}`
        },
        body: JSON.stringify({ userId, widgetId })
      });

      if (!response.ok) {
        throw new Error('Failed to check call limit');
      }

      const { canMakeCall } = await response.json();
      return canMakeCall;
    } catch (error) {
      console.error('Error checking call limit:', error);
      throw error;
    }
  }

  async incrementCallCount(userId: string, widgetId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/call-limits/increment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Key}`
        },
        body: JSON.stringify({ userId, widgetId })
      });

      if (!response.ok) {
        throw new Error('Failed to increment call count');
      }
    } catch (error) {
      console.error('Error incrementing call count:', error);
      throw error;
    }
  }

  async getRemainingCalls(userId: string, widgetId: string): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/call-limits/remaining`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Key}`
        },
        body: JSON.stringify({ userId, widgetId })
      });

      if (!response.ok) {
        throw new Error('Failed to get remaining calls');
      }

      const { remainingCalls } = await response.json();
      return remainingCalls;
    } catch (error) {
      console.error('Error getting remaining calls:', error);
      throw error;
    }
  }
}

export const callTrackingService = CallTrackingService.getInstance(); 