// WebSocket 연결을 위한 유틸리티

// 환경에 따른 WebSocket URL 생성
export function getWebSocketUrl(path: string): string {
  // 개발 환경에서는 환경 변수 사용, 없으면 기본값
  if (import.meta.env.VITE_WS_URL) {
    return `${import.meta.env.VITE_WS_URL}${path}`;
  }
  
  // 프로덕션 환경에서는 현재 도메인 사용
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}${path}`;
  }
  
  // 기본값 (개발 환경)
  return `ws://localhost:3000${path}`;
}

// BIS WebSocket 연결 함수
export function createBisWebSocket(): WebSocket {
  const wsUrl = getWebSocketUrl('/api/bis/ws');
  console.log('BIS WebSocket 연결 시도:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('BIS WebSocket에 연결되었습니다.');
  };
  
  ws.onerror = (error) => {
    console.error('BIS WebSocket 연결 오류:', error);
  };
  
  ws.onclose = (event) => {
    console.log('BIS WebSocket 연결이 종료되었습니다:', event.code, event.reason);
  };
  
  return ws;
}

// SIS WebSocket 연결 함수
export function createSisWebSocket(): WebSocket {
  const wsUrl = getWebSocketUrl('/api/sis/ws');
  console.log('SIS WebSocket 연결 시도:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('SIS WebSocket에 연결되었습니다.');
  };
  
  ws.onerror = (error) => {
    console.error('SIS WebSocket 연결 오류:', error);
  };
  
  ws.onclose = (event) => {
    console.log('SIS WebSocket 연결이 종료되었습니다:', event.code, event.reason);
  };
  
  return ws;
}

// WebSocket 연결 상태 확인
export function isWebSocketConnected(ws: WebSocket): boolean {
  return ws.readyState === WebSocket.OPEN;
}

// WebSocket 메시지 전송 (연결 상태 확인 후)
export function sendWebSocketMessage(ws: WebSocket, message: any): boolean {
  if (isWebSocketConnected(ws)) {
    ws.send(JSON.stringify(message));
    return true;
  }
  console.warn('WebSocket이 연결되지 않았습니다. 메시지를 전송할 수 없습니다.');
  return false;
}
