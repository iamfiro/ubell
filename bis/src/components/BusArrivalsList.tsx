import { StationBusInfo } from '../types';
import BusInfo from './bus-info';

interface BusArrivalsListProps {
  stationBusInfo: StationBusInfo | null;
  calledBuses: Set<string>;
  onBusCall: (routeNo: string, stationId: string, isCalling: boolean) => void;
  wsInstance: WebSocket | null;
}

function BusArrivalsList({ 
  stationBusInfo, 
  calledBuses, 
  onBusCall, 
  wsInstance 
}: BusArrivalsListProps) {
  if (!stationBusInfo || stationBusInfo.buses.length === 0) {
    return null;
  }

  // 중복 제거 및 정렬 로직
  const uniqueBuses = stationBusInfo.buses
    .reduce((uniqueBuses: any[], bus) => {
      // 같은 routeNo가 이미 있는지 확인
      const existingBus = uniqueBuses.find(uniqueBus => uniqueBus.routeNo === bus.routeNo);
      
      if (!existingBus) {
        // 새로운 routeNo면 추가
        uniqueBuses.push(bus);
      } else if (bus.arrivalTime < existingBus.arrivalTime) {
        // 같은 routeNo가 있지만 arrivalTime이 더 적으면 교체
        const index = uniqueBuses.findIndex(uniqueBus => uniqueBus.routeNo === bus.routeNo);
        uniqueBuses[index] = bus;
      }
      
      return uniqueBuses;
    }, [])
    .sort((a, b) => {
      // routeNo를 숫자로 변환하여 정렬
      const routeA = parseInt(a.routeNo) || 0;
      const routeB = parseInt(b.routeNo) || 0;
      return routeA - routeB;
    });

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {uniqueBuses.map((bus) => (
        <BusInfo
          key={bus.id}
          busNumber={bus.routeNo}
          time={Math.ceil(bus.arrivalTime)}
          station={bus.arrPrevStationCnt}
          disablePeople={calledBuses.has(bus.routeNo.toLowerCase())}
          routeType={bus.routeTp}
          vehicleType={bus.vehicleTp}
          onBusCall={(routeNo, isCalling) => onBusCall(routeNo, stationBusInfo.stationId, isCalling)}
          stationId={stationBusInfo.stationId}
          wsInstance={wsInstance}
          updatedAt={new Date(bus.updatedAt)}
          routeTp={bus.routeTp}
          isCalled={calledBuses.has(bus.routeNo.toLowerCase())}
        />
      ))}
    </div>
  );
}

export default BusArrivalsList;
