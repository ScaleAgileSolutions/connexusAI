export interface CallTrackingData {
  sourceId: string;
  timestamp: number;
  metadata: {
    widgetId?: string;
    userId?: string;
    usageType: string;
    origin: string;
    userAgent: string;
    referrer?: string;
    screenResolution?: string;
    colorDepth?: string;
    timezone?: string;
    language?: string;
    cookiesEnabled?: boolean;
    doNotTrack?: string | null;
    ipAddress: string;
    location: string;
    sessionId?: string;
    timestamp?: string;
    connectionType?: string;
    connectionSpeed?: string;
    memory?: string;
    hardwareConcurrency?: string;
    batteryStatus?: {
      charging: boolean;
      level: number;
      chargingTime: number;
      dischargingTime: number;
    } | string;
    permissions?: {
      microphone: string;
      camera: string;
      notifications: string;
    } | string;
    deviceInfo?: {
      platform: string;
      vendor: string;
      mobile: boolean;
      browser: {
        name: string;
        version: string;
      };
    };
  };
}

export interface TrackingConfig {
  isInternalTesting: boolean;
  userId?: string;
} 