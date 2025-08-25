import { Router } from "express";
import prisma from "../lib/prisma";
import { calculateDistance, calculateEstimatedTime, calculateRemainingStops } from "../lib/utils";
import { globalWss } from "../server";

const router = Router();

// WebSocket을 통해 BIS 클라이언트에게 메시지 브로드캐스트
function broadcastToBISClients(message: any) {
  if (globalWss) {
    const messageStr = JSON.stringify(message);
    globalWss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }
}

// API 응답 데이터 타입 정의
interface BusApiItem {
    arrprevstationcnt: number;
    arrtime: number;
    nodeid: string;
    nodenm: string;
    routeid: string;
    routeno: number;
    routetp: string;
    vehicletp: string;
}

interface BusApiResponse {
    response: {
    body: {
        items: {
                item: BusApiItem[];
            };
        };
    }
}

// API 응답 데이터를 Bus 모델에 upsert하는 함수
async function upsertBusData(apiData: BusApiResponse) {
    try {
        let items: BusApiItem[] = [];
        
        // items 구조 확인 및 안전한 데이터 추출
        if (apiData.response?.body?.items) {
            const itemsData = apiData.response.body.items;
            
            // item이 배열인 경우
            if (Array.isArray(itemsData.item)) {
                items = itemsData.item;
            }
            // item이 단일 객체인 경우 배열로 변환
            else if (itemsData.item && typeof itemsData.item === 'object') {
                items = [itemsData.item];
            }
        }
        
        if (items.length === 0) {
            console.log('처리할 버스 정보가 없습니다.');
            return 0;
        }
        
        for (const item of items) {
            const busId = `${item.nodeid}-${item.routeno}`;
            
            await prisma.bus.upsert({
                where: { id: busId },
                update: {
                    routeId: item.routeid,
                    routeNo: item.routeno.toString(),
                    stationId: item.nodeid,
                    stationName: item.nodenm,
                    routeTp: item.routetp,
                    vehicleTp: item.vehicletp,
                    arrivalTime: item.arrtime,
                    arrPrevStationCnt: item.arrprevstationcnt,
                    updatedAt: new Date()
                },
                create: {
                    id: busId,
                    routeId: item.routeid,
                    routeNo: item.routeno.toString(),
                    stationId: item.nodeid,
                    stationName: item.nodenm,
                    routeTp: item.routetp,
                    vehicleTp: item.vehicletp,
                    arrivalTime: item.arrtime,
                    arrPrevStationCnt: item.arrprevstationcnt
                }
            });
        }
        
        console.log(`${items.length}개의 버스 정보가 upsert되었습니다.`);
        return items.length;
    } catch (error) {
        console.error('Bus 데이터 upsert 중 오류 발생:', error);
        throw error;
    }
}

router.get('/bus-stops/:cityCode/:stationId/arrivals', async (req, res) => {
    const { cityCode, stationId } = req.params;
        
    try {
        const response = await fetch(`http://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList?serviceKey=${process.env.BUS_API_KEY}&cityCode=${cityCode}&nodeId=${stationId}&_type=json`);
        const data = await response.json() as BusApiResponse;
        
        console.log('전체 API 응답 데이터:', JSON.stringify(data, null, 2));
        
        // API 응답 데이터를 데이터베이스에 upsert
        if (data.response?.body?.items) {
            console.log('items 구조:', JSON.stringify(data.response.body.items, null, 2));
            await upsertBusData(data);
        } else {
            console.log('items 데이터가 없습니다.');
        }
        
        // 데이터베이스에서 해당 정류장의 버스 정보 조회
        const dbBusData = await prisma.bus.findMany({
            where: {
                stationId: stationId
            },
            orderBy: [
                { arrivalTime: 'asc' },
                { arrPrevStationCnt: 'asc' }
            ]
        });
        
        console.log(`데이터베이스에서 조회된 버스 정보: ${dbBusData.length}개`);
        
        res.json({
            stationId: stationId,
            stationName: dbBusData[0]?.stationName || '알 수 없음',
            buses: dbBusData,
            totalCount: dbBusData.length,
            lastUpdated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('버스 도착 정보 조회 중 오류 발생:', error);
        res.status(500).json({ error: 'Failed to fetch bus arrivals' });
    }
});

export default router;