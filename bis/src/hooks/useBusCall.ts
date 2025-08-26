import { useState } from 'react';
import { StationBusInfo } from '../types';

interface UseBusCallProps {
  stationBusInfo: StationBusInfo | null;
  sendMessage: (message: object) => boolean;
}

export const useBusCall = ({ stationBusInfo, sendMessage }: UseBusCallProps) => {
  const [calledBuses, setCalledBuses] = useState<Set<string>>(new Set());

  const handleBusCall = (routeNo: string, stationId?: string, isCalling: boolean = true) => {
    if (!stationId && stationBusInfo) {
      stationId = stationBusInfo.stationId;
    }

    if (!stationId) {
      alert('정류장 정보를 찾을 수 없습니다.');
      return;
    }

    // isCalling이 true면 호출, false면 취소
    const messageType = isCalling ? 'busCall' : 'busCallDelete';

    const message = {
      type: messageType,
      stationId: stationId,
      routeNo: routeNo
    };

    const success = sendMessage(message);

    if (success) {
      if (isCalling) {
        // 호출
        setCalledBuses(prev => new Set([...prev, routeNo.toLowerCase()]));
        console.log(`버스 ${routeNo} 호출 요청 전송`);
      } else {
        // 호출 취소
        setCalledBuses(prev => {
          const newSet = new Set(prev);
          newSet.delete(routeNo.toLowerCase());
          return newSet;
        });
        console.log(`버스 ${routeNo} 호출 취소 요청 전송`);
      }
    } else {
      alert('버스 호출 요청을 전송할 수 없습니다. 연결을 확인해주세요.');
    }
  };

  const removeBusCall = (routeNo: string) => {
    setCalledBuses(prev => {
      const newSet = new Set(prev);
      newSet.delete(routeNo.toLowerCase());
      return newSet;
    });
  };

  const addBusCall = (routeNo: string) => {
    setCalledBuses(prev => new Set([...prev, routeNo.toLowerCase()]));
  };

  return {
    calledBuses,
    handleBusCall,
    removeBusCall,
    addBusCall,
    setCalledBuses
  };
};
