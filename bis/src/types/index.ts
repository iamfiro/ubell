export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  color: string;
  company: string;
  interval: number;
  firstBusTime: string;
  lastBusTime: string;
}

// 기존 BusArrival (호환성을 위해 유지)
export interface BusArrival {
  routeNumber: string;
  routeName: string;
  arrivalTime: number;
  remainingStops: number;
  busType: 'regular' | 'lowFloor' | 'articulated';
  isLast: boolean;
  isFull: boolean;
  busNumber: string;
  previousStop: string;
  nextStop: string;
}

// 새로운 API 응답 타입
export interface Bus {
  id: string;
  routeId: string;
  routeNo: string;
  stationId: string;
  stationName: string;
  routeTp: string;
  vehicleTp: string;
  arrivalTime: number;
  arrPrevStationCnt: number;
  createdAt: string;
  updatedAt: string;
}

export interface StationBusInfo {
  stationId: string;
  stationName: string;
  buses: Bus[];
  totalCount: number;
  lastUpdated: string;
}
