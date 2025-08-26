import { useState, useEffect } from 'react';
import { BusArrival, StationBusInfo } from '../types';
import { mockArrivals } from '../data/mockData';

export const useBusArrivals = () => {
  const [busArrivals, setBusArrivals] = useState<BusArrival[]>(mockArrivals);
  const [stationBusInfo, setStationBusInfo] = useState<StationBusInfo | null>(null);

  const fetchBusArrivals = async () => {
    try {
      // URL에서 stationId 가져오기, 없으면 기본값 사용
      const params = new URLSearchParams(window.location.search);
      const stationId = params.get('stationId') || 'DJB8001793'; // 기본 정류장 ID
      const cityCode = params.get('cityCode') || '11'; // 기본 도시 코드
      
      const response = await fetch(`/api/bis/bus-stops/${cityCode}/${stationId}/arrivals`);
      if (response.ok) {
        const data: StationBusInfo = await response.json();
        setStationBusInfo(data);
        
        // 기존 BusArrival 형식으로 변환 (기존 컴포넌트 호환성 유지)
        const convertedArrivals: BusArrival[] = data.buses.map(bus => ({
          routeNumber: bus.routeNo,
          routeName: `${bus.stationName} 방면`,
          arrivalTime: bus.arrivalTime,
          remainingStops: bus.arrPrevStationCnt,
          busType: bus.vehicleTp === '저상버스' ? 'lowFloor' : 'regular',
          isLast: false,
          isFull: false,
          busNumber: bus.id,
          previousStop: '이전정류장',
          nextStop: bus.stationName
        }));
        setBusArrivals(convertedArrivals);
      } else {
        console.error('버스 도착 정보를 가져오는데 실패했습니다.');
        setBusArrivals(mockArrivals);
      }
    } catch (error) {
      console.error('버스 도착 정보 fetch 에러:', error);
      // 에러 발생시 mock 데이터 사용
      setBusArrivals(mockArrivals);
      setStationBusInfo(null);
    }
  };

  // 20초마다 버스 도착 정보 fetch
  useEffect(() => {
    // 첫 로드시 즉시 실행
    fetchBusArrivals();

    // 20초마다 실행
    const interval = setInterval(fetchBusArrivals, 20000);

    return () => clearInterval(interval);
  }, []);

  return {
    busArrivals,
    stationBusInfo,
    setBusArrivals,
    setStationBusInfo,
    fetchBusArrivals
  };
};
