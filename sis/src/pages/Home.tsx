import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  IconButton
} from '@mui/material';
import { Settings, History } from '@mui/icons-material';
import NotificationHeader from '../components/NotificationHeader';

function Home() {
  const stationId = new URLSearchParams(window.location.search).get('stationId');
  const routeNo = new URLSearchParams(window.location.search).get('busNumber');
  const busCallId = `${stationId}-${routeNo}`;

  const [isBusCalled, setIsBusCalled] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const prevBusCalledRef = useRef<boolean>(false); // 이전 호출 상태를 추적하기 위한 ref

  // WebSocket 연결 함수
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3000/api/sis/ws');
      
      ws.onopen = () => {
        console.log('WebSocket 연결됨');
        setWsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket 메시지 수신:', message);
          
          if (message.type === 'bus_call_list' && message.data && message.data.eligibleBuses) {
            const eligibleBuses = message.data.eligibleBuses;
            
            // 현재 정류장과 버스 번호에 해당하는 버스가 있는지 확인
            const isEligible = eligibleBuses.some((bus: any) => 
              bus.stationId === stationId && bus.routeNo === routeNo
            );
            
            if (isEligible) {
              console.log('내 버스 호출 감지됨!');
              setIsBusCalled(true);
            } else {
              // console.log('내 버스 호출이 아님, 호출 상태 해제');
              setIsBusCalled(false);
            }
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket 연결 끊어짐');
        setWsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('WebSocket 재연결 시도...');
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        ws.close();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket 연결 오류:', error);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // 정류장 호출이 끝났을 때 callEnd 이벤트 전송
  useEffect(() => {
    // 이전 상태가 true였고, 현재 상태가 false로 변경되었을 때만 callEnd 이벤트 전송
    if (prevBusCalledRef.current && !isBusCalled && wsRef.current && wsConnected) {
      const message = {
        type: 'callEnd',
        stationId: stationId,
        routeNo: routeNo
      };
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        console.log('callEnd 이벤트 전송:', message);
      }
    }
    
    // 현재 상태를 이전 상태로 저장
    prevBusCalledRef.current = isBusCalled;
  }, [isBusCalled, wsConnected, stationId, routeNo]);

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: isBusCalled ? '#f00' : '#fff',
        transition: 'background-color 0.3s ease',
        position: 'relative'
      }}
    >
      <NotificationHeader />
      
      {isBusCalled && (
        <h1 style={{ 
          color: '#fff', 
          textAlign: 'center', 
          marginTop: '50px',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          정류장 호출됨
        </h1>
      )}

      {/* 연결 상태 표시 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 1000
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: wsConnected ? 'green' : 'red',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}
        >
          {wsConnected ? '연결됨' : '연결 끊어짐'}
        </Typography>
      </Box>
    </div>
  );
}

export default Home;
