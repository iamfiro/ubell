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
