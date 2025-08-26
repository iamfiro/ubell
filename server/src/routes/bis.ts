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

// API 응답 데이터를 Bus 모델에 upsert하고 없어진 버스는 삭제하는 함수
async function upsertBusData(apiData: BusApiResponse, stationId: string) {
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
        
        // 기존 DB에서 해당 정류장의 버스 목록 조회 (arrivalTime도 포함)
        const existingBuses = await prisma.bus.findMany({
            where: { stationId: stationId },
            select: { 
                id: true, 
                arrivalTime: true,
                routeId: true,
                routeNo: true,
                stationName: true,
                routeTp: true,
                vehicleTp: true,
                arrPrevStationCnt: true,
                updatedAt: true
            }
        });
        
        const existingBusIds = new Set(existingBuses.map(bus => bus.id));
        const newBusIds = new Set<string>();
        let updatedCount = 0;
        let skippedCount = 0;
        
        // 노선별로 그룹화하여 arrivalTime이 가장 적은 버스만 선택
        const routeGroups = new Map<string, BusApiItem[]>();
        
        // 노선별로 그룹화
        for (const item of items) {
            const routeKey = `${item.nodeid}-${item.routeno}`;
            if (!routeGroups.has(routeKey)) {
                routeGroups.set(routeKey, []);
            }
            routeGroups.get(routeKey)!.push(item);
        }
        
        // 각 노선 그룹에서 arrivalTime이 가장 적은 버스만 선택
        const selectedBuses: BusApiItem[] = [];
        for (const [routeKey, buses] of routeGroups) {
            // arrivalTime이 가장 적은 버스 선택
            const fastestBus = buses.reduce((min, current) => 
                current.arrtime < min.arrtime ? current : min
            );
            selectedBuses.push(fastestBus);
            console.log(`노선 ${fastestBus.routeno}: ${buses.length}개 중 가장 빠른 버스 선택 (${fastestBus.arrtime}초)`);
        }

        console.log('fuck', selectedBuses)
        
        // 선택된 버스들만 처리
        for (const item of selectedBuses) {
            const busId = `${item.nodeid}-${item.routeno}`;
            newBusIds.add(busId);
            
            // 기존 버스 데이터 찾기
            const existingBus = existingBuses.find(bus => bus.id === busId);
            
            // arrivalTime이 실제로 변경되었는지 확인
            const arrivalTimeChanged = !existingBus || existingBus.arrivalTime !== item.arrtime;
            
            // 디버깅 로그 추가
            console.log(`버스 ${busId} 비교:`, {
                existingBus: existingBus ? {
                    id: existingBus.id,
                    arrivalTime: existingBus.arrivalTime,
                    updatedAt: existingBus.updatedAt
                } : '없음',
                newItem: {
                    nodeid: item.nodeid,
                    routeno: item.routeno,
                    arrtime: item.arrtime
                },
                arrivalTimeChanged: arrivalTimeChanged
            });
            
            if (arrivalTimeChanged) {
                // arrivalTime이 변경된 경우에만 upsert 실행
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
                updatedCount++;
                console.log(`버스 ${busId}의 arrivalTime이 업데이트되었습니다: ${existingBus?.arrivalTime || '신규'} → ${item.arrtime}`);
            } else {
                // arrivalTime이 동일한 경우 updatedAt으로 경과시간을 반영해 arrivalTime을 재계산하여 업데이트
                const now = new Date();
                const lastUpdated = existingBus?.updatedAt ? new Date(existingBus.updatedAt) : null;
                const secondsElapsed = lastUpdated ? Math.floor((now.getTime() - lastUpdated.getTime()) / 1000) : 0;
                const recalculatedArrival = Math.max(0, (existingBus?.arrivalTime ?? item.arrtime) - secondsElapsed);
                const nextArrPrevStationCnt = recalculatedArrival <= 60 ? 1 : (existingBus?.arrPrevStationCnt ?? item.arrprevstationcnt);

                await prisma.bus.update({
                    where: { id: busId },
                    data: {
                        arrivalTime: recalculatedArrival,
                        arrPrevStationCnt: nextArrPrevStationCnt
                    }
                });
                skippedCount++;
                console.log(`버스 ${busId}의 arrivalTime 동일. 경과 ${secondsElapsed}s 반영하여 ${recalculatedArrival}s로 저장.`);
            }
        }
        
        // API 응답에 없는 기존 버스들 삭제
        const busesToDelete = Array.from(existingBusIds).filter(id => !newBusIds.has(id));
        
        if (busesToDelete.length > 0) {
            await prisma.bus.deleteMany({
                where: {
                    id: {
                        in: busesToDelete
                    }
                }
            });
            console.log(`${busesToDelete.length}개의 버스 정보가 삭제되었습니다:`, busesToDelete);
        }
        
        console.log(`총 처리된 버스: ${items.length}개`);
        console.log(`실제 업데이트된 버스: ${updatedCount}개`);
        console.log(`변경 없이 건너뛴 버스: ${skippedCount}개`);
        console.log(`삭제된 버스: ${busesToDelete.length}개`);
        
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

        console.log('fuck', data)
        
        
        // API 응답 데이터를 데이터베이스에 upsert
        if (data.response?.body?.items) {
            await upsertBusData(data, stationId);
        } else {
            console.log('items 데이터가 없습니다.');
        }

        console.log(data.response.body.items)
        
        // API 응답 데이터를 클라이언트에 반환 (데이터베이스는 백그라운드에서만 업데이트)
        // 데이터베이스에서 최신 정보 조회
        const dbBuses = await prisma.bus.findMany({
            where: { stationId: stationId },
            orderBy: { arrivalTime: 'asc' }
        });
        
        // 데이터베이스 데이터를 클라이언트 형식에 맞게 변환
        const formattedBuses = dbBuses.map(bus => ({
            id: bus.id,
            routeId: bus.routeId,
            routeNo: bus.routeNo,
            stationId: bus.stationId,
            stationName: bus.stationName,
            routeTp: bus.routeTp,
            vehicleTp: bus.vehicleTp,
            arrivalTime: bus.arrivalTime,
            arrPrevStationCnt: bus.arrPrevStationCnt,
            updatedAt: bus.updatedAt.toISOString()
        }));
        
        console.log(`데이터베이스에서 조회한 버스 정보: ${formattedBuses.length}개`);
        
        res.json({
            stationId: stationId,
            stationName: formattedBuses[0]?.stationName || '알 수 없음',
            buses: formattedBuses,
            totalCount: formattedBuses.length,
            lastUpdated: new Date().toISOString(),
            source: 'Database' // 데이터 출처를 Database로 변경
        });
        
    } catch (error) {
        console.error('버스 도착 정보 조회 중 오류 발생:', error);
        res.status(500).json({ error: 'Failed to fetch bus arrivals' });
    }
});

export default router;