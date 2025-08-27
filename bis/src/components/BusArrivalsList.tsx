import { StationBusInfo } from '../types';
import BusInfo from './bus-info';
import { useEffect, useRef } from 'react';

interface BusArrivalsListProps {
  stationBusInfo: StationBusInfo | null;
  calledBuses: Set<string>;
  onBusCall: (routeNo: string, stationId: string, isCalling: boolean) => void;
  wsInstance: WebSocket | null;
  focusedBusIndex?: number;
  selectedBusIndex?: number;
  isVoiceMode?: boolean;
  isFocusMode?: boolean;
  uniqueBuses?: any[];
}

function BusArrivalsList({ 
  stationBusInfo, 
  calledBuses, 
  onBusCall, 
  wsInstance,
  focusedBusIndex = 0,
  selectedBusIndex = 0,
  isVoiceMode = false,
  isFocusMode = false,
  uniqueBuses = []
}: BusArrivalsListProps) {
  const busRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 포커스된 아이템으로 스크롤 (포커스 모드일 때)
  useEffect(() => {
    if (isFocusMode && !isVoiceMode && busRefs.current[focusedBusIndex] && uniqueBuses.length > 0) {
      console.log(`포커스 모드 스크롤: 인덱스 ${focusedBusIndex}로 이동`);
      // 약간의 지연을 주어 DOM 업데이트 후 스크롤
      setTimeout(() => {
        const element = busRefs.current[focusedBusIndex];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 50);
    }
  }, [focusedBusIndex, isFocusMode, isVoiceMode, uniqueBuses.length]);

  // 선택된 아이템으로 스크롤 (음성 모드일 때)
  useEffect(() => {
    if (isVoiceMode && busRefs.current[selectedBusIndex] && uniqueBuses.length > 0) {
      console.log(`음성 모드 스크롤: 인덱스 ${selectedBusIndex}로 이동`);
      // 약간의 지연을 주어 DOM 업데이트 후 스크롤
      setTimeout(() => {
        const element = busRefs.current[selectedBusIndex];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 50);
    }
  }, [selectedBusIndex, isVoiceMode, uniqueBuses.length]);

  // Early return은 모든 hooks 이후에 위치
  if (!stationBusInfo || !uniqueBuses || uniqueBuses.length === 0) {
    return null;
  }

  // 디버깅: 렌더링 순서 확인
  console.log('🔍 BusArrivalsList 렌더링 순서:');
  uniqueBuses.forEach((bus, idx) => {
    const focusMarker = (!isVoiceMode && isFocusMode && idx === focusedBusIndex) ? ' ← 포커스' : '';
    const selectMarker = (isVoiceMode && idx === selectedBusIndex) ? ' ← 음성선택' : '';
    console.log(`  [${idx}] ${bus.routeNo}번${focusMarker}${selectMarker}`);
  });
  
  console.log(`📍 현재 상태: focusedBusIndex=${focusedBusIndex}, selectedBusIndex=${selectedBusIndex}, isVoiceMode=${isVoiceMode}, isFocusMode=${isFocusMode}`);

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {uniqueBuses.map((bus, index) => (
        <div
          key={bus.id}
          ref={(el) => {
            busRefs.current[index] = el;
          }}
        >
          <BusInfo
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
            isFocused={!isVoiceMode && isFocusMode && index === focusedBusIndex}
            isSelected={isVoiceMode && index === selectedBusIndex}
            isVoiceMode={isVoiceMode}
          />
        </div>
      ))}
    </div>
  );
}

export default BusArrivalsList;
