import { BusRoute, BusArrival } from '../types';

export const mockRoutes: BusRoute[] = [
  {
    id: '1',
    routeNumber: '150',
    routeName: '강남역 ↔ 숙대입구',
    color: '#0066CC',
    company: '서울버스',
    interval: 8,
    firstBusTime: '05:30',
    lastBusTime: '23:30'
  },
  {
    id: '2',
    routeNumber: '402',
    routeName: '홍대입구 ↔ 숙대입구',
    color: '#33CC33',
    company: '대한운수',
    interval: 12,
    firstBusTime: '05:00',
    lastBusTime: '24:00'
  },
  {
    id: '3',
    routeNumber: '271',
    routeName: '이태원 ↔ 숙대입구',
    color: '#FF6600',
    company: '서울교통',
    interval: 15,
    firstBusTime: '06:00',
    lastBusTime: '22:30'
  },
  {
    id: '4',
    routeNumber: '4212',
    routeName: '사당역 ↔ 강남역',
    color: '#33CC33',
    company: '경기운수',
    interval: 10,
    firstBusTime: '05:20',
    lastBusTime: '23:50'
  },
  {
    id: '5',
    routeNumber: '1002',
    routeName: '김포공항 ↔ 강남역',
    color: '#8B4513',
    company: '공항버스',
    interval: 20,
    firstBusTime: '05:40',
    lastBusTime: '22:00'
  },
  {
    id: '6',
    routeNumber: '간선101',
    routeName: '서울역 ↔ 잠실역',
    color: '#0066CC',
    company: '서울시내버스',
    interval: 6,
    firstBusTime: '05:00',
    lastBusTime: '24:00'
  },
  {
    id: '7',
    routeNumber: '506',
    routeName: '강남터미널 ↔ 숙대입구',
    color: '#33CC33',
    company: '대원운수',
    interval: 10,
    firstBusTime: '05:30',
    lastBusTime: '23:00'
  },
  {
    id: '8',
    routeNumber: '643',
    routeName: '신촌 ↔ 숙대입구',
    color: '#FF6600',
    company: '신성운수',
    interval: 12,
    firstBusTime: '06:00',
    lastBusTime: '22:30'
  },
  {
    id: '9',
    routeNumber: 'N16',
    routeName: '강남역 ↔ 홍대입구',
    color: '#8B4513',
    company: '심야버스',
    interval: 30,
    firstBusTime: '23:30',
    lastBusTime: '04:30'
  },
  {
    id: '10',
    routeNumber: '7016',
    routeName: '수원 ↔ 강남역',
    color: '#DC143C',
    company: '경기버스',
    interval: 15,
    firstBusTime: '05:00',
    lastBusTime: '23:30'
  }
];

export const mockArrivals: BusArrival[] = [
  {
    routeNumber: '150',
    routeName: '강남역 ↔ 숙대입구',
    arrivalTime: 3,
    remainingStops: 2,
    busType: 'regular',
    isLast: false,
    isFull: false,
    busNumber: '서울70사1234',
    previousStop: '한강진역',
    nextStop: '이촌역'
  },
  {
    routeNumber: '150',
    routeName: '강남역 ↔ 숙대입구',
    arrivalTime: 8,
    remainingStops: 5,
    busType: 'lowFloor',
    isLast: false,
    isFull: false,
    busNumber: '서울70사5678',
    previousStop: '용산역',
    nextStop: '한강진역'
  },
  {
    routeNumber: '402',
    routeName: '홍대입구 ↔ 숙대입구',
    arrivalTime: 5,
    remainingStops: 3,
    busType: 'regular',
    isLast: false,
    isFull: true,
    busNumber: '서울70사9012',
    previousStop: '공덕역',
    nextStop: '신용산역'
  },
  {
    routeNumber: '271',
    routeName: '이태원 ↔ 숙대입구',
    arrivalTime: 12,
    remainingStops: 7,
    busType: 'articulated',
    isLast: true,
    isFull: false,
    busNumber: '서울70사3456',
    previousStop: '남영역',
    nextStop: '용산역'
  },
  {
    routeNumber: '506',
    routeName: '강남터미널 ↔ 숙대입구',
    arrivalTime: 6,
    remainingStops: 4,
    busType: 'regular',
    isLast: false,
    isFull: false,
    busNumber: '서울70사7890',
    previousStop: '서빙고역',
    nextStop: '한강진역'
  },
  {
    routeNumber: '643',
    routeName: '신촌 ↔ 숙대입구',
    arrivalTime: 15,
    remainingStops: 8,
    busType: 'lowFloor',
    isLast: false,
    isFull: true,
    busNumber: '서울70사2468',
    previousStop: '효창공원앞',
    nextStop: '용산역'
  },
  {
    routeNumber: 'N16',
    routeName: '강남역 ↔ 홍대입구',
    arrivalTime: 25,
    remainingStops: 12,
    busType: 'regular',
    isLast: false,
    isFull: false,
    busNumber: '서울70사1357',
    previousStop: '이태원역',
    nextStop: '한강진역'
  },
  {
    routeNumber: '7016',
    routeName: '수원 ↔ 강남역',
    arrivalTime: 18,
    remainingStops: 6,
    busType: 'regular',
    isLast: false,
    isFull: false,
    busNumber: '경기70사9753',
    previousStop: '노량진역',
    nextStop: '용산역'
  }
];
