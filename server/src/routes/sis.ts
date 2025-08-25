import { Router } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cron from 'node-cron';
import { Server } from 'http';
import prisma from '../lib/prisma';

const router = Router();

// WebSocket 서버 인스턴스
let wss: WebSocketServer;
export let connectedClients: WebSocket[] = [];

// 클라이언트 추가 함수
export function addClient(ws: WebSocket) {
  connectedClients.push(ws);
  console.log(`SIS WebSocket 클라이언트 추가됨. 총 ${connectedClients.length}개`);
}

// 클라이언트 제거 함수
export function removeClient(ws: WebSocket) {
  connectedClients = connectedClients.filter(client => client !== ws);
  console.log(`SIS WebSocket 클라이언트 제거됨. 총 ${connectedClients.length}개`);
}

// WebSocket 서버 초기화 함수 (더 이상 사용하지 않음)
export function initializeWebSocket(server: Server) {
  console.log('SIS WebSocket은 server.ts에서 통합 관리됩니다.');
}

// 모든 연결된 클라이언트에게 브로드캐스트하는 함수
function broadcastToAll(message: any) {
  const messageStr = JSON.stringify(message);
  console.log(`브로드캐스트 메시지: ${messageStr}, 연결된 클라이언트: ${connectedClients.length}개`);
  
  if (connectedClients.length === 0) {
    console.log('연결된 WebSocket 클라이언트가 없습니다.');
    return;
  }
  
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// cronjob 설정 - 매분마다 실행
cron.schedule('* * * * *', async () => {
  console.log('Cronjob 실행 중...');
  
  try {
    await checkCondition();
  } catch (error) {
    console.error('Cronjob 실행 중 오류 발생:', error);
  }
});

// 조건 체크 함수 - Bus와 BusCall을 대조하여 조건 확인
async function checkCondition(): Promise<boolean> {
  try {
    console.log('=== checkCondition 시작 ===');
    
    // 모든 Bus 데이터 조회
    const allBuses = await prisma.bus.findMany({
      select: {
        id: true,
        stationId: true,
        routeNo: true,
        arrivalTime: true,
        arrPrevStationCnt: true,
        updatedAt: true
      }
    });

    console.log(`전체 Bus 데이터 ${allBuses.length}개 조회 완료`);
    
    if (allBuses.length === 0) {
      console.log('Bus 데이터가 없습니다.');
      return false;
    }

    const now = new Date();
    console.log(`현재 시간: ${now.toISOString()}`);
    
    // updatedAt을 기준으로 현재 시간과의 차이를 계산하여 arrivalTime 업데이트
    const eligibleBuses = allBuses.filter(bus => {
      const timeDiff = Math.floor((now.getTime() - bus.updatedAt.getTime()) / 1000); // 초 단위
      const currentArrivalTime = Math.max(0, bus.arrivalTime - timeDiff); // 0 이하면 0으로 처리
      
      console.log(`버스 ${bus.id} (${bus.stationId}-${bus.routeNo}):`);
      console.log(`  - 원본 arrivalTime: ${bus.arrivalTime}초`);
      console.log(`  - updatedAt: ${bus.updatedAt.toISOString()}`);
      console.log(`  - 시간 차이: ${timeDiff}초`);
      console.log(`  - 계산된 arrivalTime: ${currentArrivalTime}초 (0 이하면 0으로 처리)`);
      console.log(`  - arrPrevStationCnt: ${bus.arrPrevStationCnt}`);
      
      // arrivalTime이 1-60초 사이이고, arrPrevStationCnt가 1인 경우
      const isEligible = currentArrivalTime >= 1 && currentArrivalTime <= 60 && bus.arrPrevStationCnt === 1;
      console.log(`  - 조건 만족 여부: ${isEligible ? '✅' : '❌'}`);
      
      return isEligible;
    });

    console.log(`조건을 만족하는 버스: ${eligibleBuses.length}개`);
    
    if (eligibleBuses.length === 0) {
      console.log('조건을 만족하는 버스가 없습니다.');

      const message = {
        type: 'bus_call_list',
        data: {
            busCallId: []
        }
      }

    broadcastToAll(message);
    
      return false;
    }

    console.log('조건을 만족하는 버스 목록:');
    eligibleBuses.forEach(bus => {
      console.log(`  - ${bus.stationId}-${bus.routeNo} (ID: ${bus.id})`);
    });

    // BusCall과 대조하여 매칭되는 버스 확인
    // BusCall의 busId는 ${stationId}-${routeNo} 형태
    const busCallIds = eligibleBuses.map(bus => `${bus.stationId}-${bus.routeNo}`);
    console.log(`검색할 BusCall ID들: ${busCallIds.join(', ')}`);
    
    const matchingBusCalls = await prisma.busCall.findMany({
      where: {
        busId: {
          in: busCallIds
        }
      }
    });

    console.log(`매칭되는 BusCall: ${matchingBusCalls.length}개`);
    
    if (matchingBusCalls.length > 0) {
      console.log('매칭되는 BusCall 목록:');
      matchingBusCalls.forEach(call => {
        console.log(`  - ${call.busId}`);
      });

      const message = {
        type: 'bus_call_list',
        data: {
            busCallId: matchingBusCalls.map(call => call.busId)
        }
      }

      broadcastToAll(message);
      
      console.log(`총 ${matchingBusCalls.length}개의 매칭된 버스 호출을 개별적으로 전송했습니다.`);
      
      console.log('=== checkCondition 완료: true 반환 ===');
      return true;
    }

    console.log('매칭되는 BusCall이 없습니다.');
    console.log('=== checkCondition 완료: false 반환 ===');
    return false;
  } catch (error) {
    console.error('=== checkCondition 오류 발생 ===');
    console.error('오류 내용:', error);
    return false;
  }
}

// REST API 엔드포인트들
router.get('/status', (req, res) => {
  res.json({
    status: 'SIS 서비스가 정상적으로 실행 중입니다.',
    connectedClients: connectedClients.length,
    timestamp: new Date().toISOString()
  });
});

export default router;