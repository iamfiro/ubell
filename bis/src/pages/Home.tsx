
import Header from '../components/header';
import ReservationComplete from '../components/ReservationComplete';
import News from '../components/news';
import BusArrivalsList from '../components/BusArrivalsList';
import LastUpdateTime from '../components/LastUpdateTime';

// 커스텀 훅들 import
import { useBusArrivals } from '../hooks/useBusArrivals';
import { useWebSocket } from '../hooks/useWebSocket';
import { useBusCall } from '../hooks/useBusCall';
import { useBusReservation } from '../hooks/useBusReservation';

function Home() {
  // 커스텀 훅들 사용
  const { stationBusInfo } = useBusArrivals();
  
  const { wsRef, sendMessage } = useWebSocket({
    onBusCallEnd: (routeNo: string) => {
      removeBusCall(routeNo);
    }
  });
  
  const { calledBuses, handleBusCall, removeBusCall, addBusCall } = useBusCall({
    stationBusInfo,
    sendMessage
  });
  
  const { isReserved, reservedBus, countdown, returnToMain } = useBusReservation({
    onBusReserved: (busNumber: string) => {
      addBusCall(busNumber);
    }
  });

  // 훅에서 처리하므로 제거

  // WebSocket 연결은 useWebSocket 훅에서 처리

  // 자동 슬라이드 기능은 필요시 구현

  // 버스 호출 기능은 useBusCall 훅에서 처리

  // 버스 예약 기능은 useBusReservation 훅에서 처리

  if (isReserved) {
    return (
      <ReservationComplete
        reservedBus={reservedBus}
        countdown={countdown}
        onReturn={returnToMain}
      />
    );
  }

  return (
    <div style={{ 
      padding: '0', 
      background: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header title={stationBusInfo?.stationName || ''} />
      <News />

      <div style={{padding: '0 20px', marginTop: '10px'}}>
        <img src="/banner.png" alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
      </div>
      
      <div style={{ padding: '20px' }}>
        {/* <SearchInput
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEnterPress={handleReservation}
          onFocus={handleSearchClick}
        /> */}

        {/* 실시간 버스 도착 정보 */}
        <BusArrivalsList
          stationBusInfo={stationBusInfo}
          calledBuses={calledBuses}
          onBusCall={handleBusCall}
          wsInstance={wsRef.current}
        />

        {/* 마지막 업데이트 시간 표시 */}
        {stationBusInfo && (
          <LastUpdateTime lastUpdated={stationBusInfo.lastUpdated} />
        )}
      </div>
    </div>
  );
}

export default Home;
