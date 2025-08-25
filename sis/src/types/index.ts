export interface CallNotification {
  id: string;
  busStopName: string;
  busRoute: string;
  timestamp: Date;
  passengerCount?: number;
  location?: {
    lat: number;
    lng: number;
  };
  priority: 'low' | 'medium' | 'high';
  stopsRemaining: number;
}

export interface BusDriver {
  id: string;
  name: string;
  busNumber: string;
  route: string;
  status: 'active' | 'inactive' | 'break';
}
