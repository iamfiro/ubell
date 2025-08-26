import { useEffect, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  message?: string;
  routeNo?: string;
  stationId?: string;
}

interface UseWebSocketProps {
  onBusCallEnd?: (routeNo: string) => void;
  onMessage?: (data: WebSocketMessage) => void;
}

export const useWebSocket = ({ onBusCallEnd, onMessage }: UseWebSocketProps = {}) => {
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3000/api/bis/ws');
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('BIS WebSocket 연결됨');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket 메시지 수신:', data);
          
          // 외부에서 전달받은 onMessage 콜백 실행
          onMessage?.(data);
          
          switch (data.type) {
            case 'connection':
              console.log('WebSocket 연결 확인:', data.message);
              break;
            case 'busCall':
              console.log('버스 호출 완료:', data);
              break;
            case 'busCallDelete':
              console.log('버스 호출 취소:', data);
              break;
            case 'busCallEnd':
              console.log('버스 호출 종료:', data);
              // 외부에서 전달받은 onBusCallEnd 콜백 실행
              if (data.routeNo && onBusCallEnd) {
                onBusCallEnd(data.routeNo);
              }
              break;
            case 'error':
              console.error('WebSocket 에러:', data.message);
              break;
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      ws.onclose = () => {
        console.log('BIS WebSocket 연결 해제됨');
        // 3초 후 재연결 시도
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
      };
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
    }
  };

  const sendMessage = (message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('WebSocket 메시지 전송 실패:', error);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    connectWebSocket();

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    wsRef,
    sendMessage,
    connectWebSocket
  };
};
