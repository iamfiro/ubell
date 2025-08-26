import { useState } from 'react';
import { mockRoutes } from '../data/mockData';

interface UseBusReservationProps {
  onBusReserved?: (busNumber: string) => void;
  onResetSearch?: () => void;
}

export const useBusReservation = ({ onBusReserved, onResetSearch }: UseBusReservationProps = {}) => {
  const [isReserved, setIsReserved] = useState(false);
  const [reservedBus, setReservedBus] = useState<string>('');
  const [countdown, setCountdown] = useState(5);

  const handleReservation = (busNumber: string) => {
    const isValidBus = mockRoutes.some(route => 
      route.routeNumber.toLowerCase() === busNumber.toLowerCase()
    );
    
    if (!isValidBus) {
      alert('등록되지 않은 버스 번호입니다.\n다시 확인해주세요.');
      return;
    }
    
    setReservedBus(busNumber);
    setIsReserved(true);
    setCountdown(5);
    
    // 콜백 함수 실행
    onBusReserved?.(busNumber);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsReserved(false);
          setReservedBus('');
          onResetSearch?.();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const returnToMain = () => {
    setIsReserved(false);
    setReservedBus('');
    setCountdown(5);
    onResetSearch?.();
  };

  return {
    isReserved,
    reservedBus,
    countdown,
    handleReservation,
    returnToMain
  };
};
