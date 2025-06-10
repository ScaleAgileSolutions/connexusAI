interface NetworkInformation {
  type: string;
  downlink: number;
}

interface Navigator {
  connection?: NetworkInformation;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManager>;
}

interface BatteryManager {
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
} 