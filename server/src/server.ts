import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws';

import BISRoutes from './routes/bis';
import SISRoutes, { addClient, removeClient } from './routes/sis';

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// 전역 WebSocket 서버 인스턴스
export let globalWss: WebSocketServer | null = null;

// CORS 설정
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite 개발 서버
    'http://localhost:3000',  // 다른 포트
    'http://localhost:3001',  // SIS 포트 (필요시)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙
app.use(express.static('public'));

// 라우트
app.use('/api/bis', BISRoutes);
app.use('/api/sis', SISRoutes);

// 기본 라우트
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'U-Bell API에 오신 것을 환영합니다!' });
});

// 에러 핸들링 미들웨어
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 404 핸들러
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 서버 시작
async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('데이터베이스에 성공적으로 연결되었습니다.');
    
    const server = app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      
      // 통합 WebSocket 서버 초기화
      globalWss = new WebSocketServer({ server });
      const wss = globalWss;
      
      wss.on('connection', (ws, req) => {
        const url = req.url;
        console.log(`WebSocket 연결됨: ${url}`);
        
        if (url === '/api/bis/ws') {
          // BIS WebSocket 처리
          console.log('BIS WebSocket 클라이언트 연결됨');
          
          ws.send(JSON.stringify({
            type: 'connection',
            message: 'BIS WebSocket에 연결되었습니다.',
            timestamp: new Date().toISOString()
          }));
          
          ws.on('message', async (message) => {
            try {
              const data = JSON.parse(message.toString());
              console.log('BIS WebSocket 메시지 수신:', data);
              
              switch (data.type) {
                case 'ping':
                  ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString()
                  }));
                  break;
                case 'busCall':
                  const { stationId, routeNo } = data;

                  console.log(stationId, routeNo);

                  const isStationBusExist = await prisma.bus.findMany({
                    where: {
                      stationId: stationId
                    }
                  });
                  if(isStationBusExist.length === 0 || !stationId || !routeNo) {
                    ws.send(JSON.stringify({
                      type: 'error',
                      message: '찾을 수 없는 버스 정보입니다.',
                      timestamp: new Date().toISOString()
                    }));
                    return;
                  }

                  const busData = await prisma.busCall.findMany({
                    where: {
                      busId: `${stationId}-${routeNo}`
                    }
                  });
                  if (busData.length === 0) {
                    await prisma.busCall.create({
                      data: {
                        busId: `${stationId}-${routeNo}`
                      }
                    });
                  }
                  ws.send(JSON.stringify({
                    type: 'busCall',
                    call: true
                  }));
                  break;
                
                case 'busCallDelete':
                  const { stationId: deleteStationId, routeNo: deleteRouteNo } = data;
                  await prisma.busCall.delete({
                    where: {
                      busId: `${deleteStationId}-${deleteRouteNo}`
                    }
                  });
                  ws.send(JSON.stringify({
                    type: 'busCallDelete',
                    call: false
                  }));
                  break;
                default:
                  ws.send(JSON.stringify({
                    type: 'error',
                    message: '알 수 없는 메시지 타입입니다.',
                    timestamp: new Date().toISOString()
                  }));
              }
            } catch (error) {
              console.error('WebSocket 메시지 파싱 오류:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: '잘못된 메시지 형식입니다.',
                timestamp: new Date().toISOString()
              }));
            }
          });
          
        } else if (url === '/api/sis/ws') {
          // SIS WebSocket 처리
          console.log('SIS WebSocket 클라이언트 연결됨');
          
          // SIS 클라이언트 목록에 추가
          addClient(ws);
          
          ws.send(JSON.stringify({
            type: 'connection',
            message: 'SIS WebSocket에 연결되었습니다.',
            timestamp: new Date().toISOString()
          }));
          
          ws.on('message', (message) => {
            console.log('SIS WebSocket 메시지 수신:', message.toString());
            
            try {
              const data = JSON.parse(message.toString());
              
              switch (data.type) {
                case 'callEnd':
                  const { stationId, routeNo } = data;
                  
                  if (stationId && routeNo) {
                    // BusCall 데이터 삭제
                    prisma.busCall.deleteMany({
                      where: {
                        busId: `${stationId}-${routeNo}`
                      }
                    }).then(() => {
                      console.log(`BusCall 삭제 완료: ${stationId}-${routeNo}`);
                      
                      // BIS 클라이언트들에게도 호출 종료 알림 브로드캐스트
                      if (globalWss) {
                        globalWss.clients.forEach((client) => {
                          if (client.readyState === 1) { // WebSocket.OPEN
                            client.send(JSON.stringify({
                              type: 'busCallEnd',
                              stationId: stationId,
                              routeNo: routeNo,
                              timestamp: new Date().toISOString()
                            }));
                          }
                        });
                      }
                    }).catch((error) => {
                      console.error('BusCall 삭제 중 오류:', error);
                    });
                  }
                  break;
                  
                default:
                  console.log('알 수 없는 SIS 메시지 타입:', data.type);
              }
            } catch (error) {
              console.error('SIS WebSocket 메시지 파싱 오류:', error);
            }
          });
          
          ws.on('close', () => {
            // SIS 클라이언트 목록에서 제거
            removeClient(ws);
            console.log('SIS WebSocket 클라이언트 연결 해제됨');
          });
        }
        
        ws.on('close', () => {
          console.log('WebSocket 클라이언트 연결 해제됨');
        });
        
        ws.on('error', (error) => {
          console.error('WebSocket 오류:', error);
        });
      });
      
      console.log('통합 WebSocket 서버가 초기화되었습니다.');
    });
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    process.exit(1);
  }
}

startServer();

// WebSocket을 통해 BIS 클라이언트에게 메시지 브로드캐스트
export function broadcastToBISClients(message: any) {
  if (globalWss) {
    const messageStr = JSON.stringify(message);
    globalWss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
