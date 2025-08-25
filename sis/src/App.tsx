import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert,
  Snackbar
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NotificationHeader from './components/NotificationHeader';
import NotificationCard from './components/NotificationCard';
import { CallNotification } from './types';
import { mockNotifications, generateRandomNotification } from './data/mockNotifications';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const stationId = 'DJB8001793';
  const routeNo = '2';
  const busCallId = `${stationId}-${routeNo}`; // 내 버스 호출 ID

  const [isBusCalled, setIsBusCalled] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  // WebSocket 연결 함수
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3000/api/sis/ws');
      
      ws.onopen = () => {
        console.log('WebSocket 연결됨');
        setWsConnected(true);
        // 재연결 타이머 클리어
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket 메시지 수신:', message);
          
          if (message.type === 'bus_call_list' && message.data && message.data.busCallId) {
            const busCallIds = message.data.busCallId;
            
            // 내 busCallId가 포함되어 있는지 확인
            if (Array.isArray(busCallIds) && busCallIds.includes(busCallId)) {
              console.log('내 버스 호출 감지됨!');
              setIsBusCalled(true);
            } else {
              console.log('내 버스 호출이 아님, 호출 상태 해제');
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
        // 3초 후 재연결 시도
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
      // 연결 실패 시 3초 후 재시도
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  // 컴포넌트 마운트 시 WebSocket 연결
  useEffect(() => {
    connectWebSocket();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div 
        style={{ 
          minHeight: '100vh', 
          backgroundColor: isBusCalled ? '#f00' : '#fff',
          transition: 'background-color 0.3s ease'
        }}
      >
        <NotificationHeader/>
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
      </div>
    </ThemeProvider>
  );
}

export default App;
