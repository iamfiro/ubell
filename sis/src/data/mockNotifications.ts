import { CallNotification } from '../types';

export const mockNotifications: CallNotification[] = [
  {
    id: '1',
    busStopName: '숙대입구역',
    busRoute: '150번',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2분 전
    passengerCount: 3,
    priority: 'high',
    stopsRemaining: 2
  },
  {
    id: '2',
    busStopName: '한강진역',
    busRoute: '150번',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5분 전
    passengerCount: 1,
    priority: 'medium',
    stopsRemaining: 4
  },
  {
    id: '3',
    busStopName: '이촌역',
    busRoute: '150번',
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8분 전
    passengerCount: 2,
    priority: 'low',
    stopsRemaining: 6
  },
  {
    id: '4',
    busStopName: '용산역',
    busRoute: '150번',
    timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12분 전
    passengerCount: 5,
    priority: 'high',
    stopsRemaining: 8
  }
];

// 새로운 알림을 시뮬레이션하는 함수
export const generateRandomNotification = (): CallNotification => {
  const busStops = ['숙대입구역', '한강진역', '이촌역', '용산역', '서빙고역', '공덕역'];
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  
  return {
    id: Date.now().toString(),
    busStopName: busStops[Math.floor(Math.random() * busStops.length)],
    busRoute: '150번',
    timestamp: new Date(),
    passengerCount: Math.floor(Math.random() * 5) + 1,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    stopsRemaining: Math.floor(Math.random() * 10) + 1 // 1-10 정류장
  };
};
