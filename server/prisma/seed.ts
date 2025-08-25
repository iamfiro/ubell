import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const prisma = new PrismaClient();

// 성능 측정을 위한 유틸리티
class PerformanceTracker {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor() {
    this.startTime = performance.now();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, performance.now());
    const elapsed = this.checkpoints.get(name)! - this.startTime;
    console.log(`✅ ${name}: ${elapsed.toFixed(2)}ms`);
  }

  finish(): void {
    const totalTime = performance.now() - this.startTime;
    console.log(`\n🚀 전체 시드 완료: ${totalTime.toFixed(2)}ms`);
  }
}

// 실제 서울 버스 노선 데이터
const REAL_BUS_ROUTES = [
  {
    name: "강남역 ↔ 숙대입구",
    stops: [
      { name: "강남역", code: "GANGNAM", latitude: 37.498095, longitude: 127.027610, address: "서울특별시 강남구 강남대로 396", order: 0 },
      { name: "역삼역", code: "YEOCKSAM", latitude: 37.500622, longitude: 127.036456, address: "서울특별시 강남구 강남대로 420", order: 1 },
      { name: "선릉역", code: "SEONLEUNG", latitude: 37.504610, longitude: 127.049188, address: "서울특별시 강남구 테헤란로 427", order: 2 },
      { name: "삼성역", code: "SAMSEONG", latitude: 37.508844, longitude: 127.063161, address: "서울특별시 강남구 영동대로 513", order: 3 },
      { name: "종합운동장역", code: "SPORTS", latitude: 37.510980, longitude: 127.073642, address: "서울특별시 송파구 올림픽로 25", order: 4 },
      { name: "잠실역", code: "JAMSIL", latitude: 37.513280, longitude: 127.100147, address: "서울특별시 송파구 올림픽로 240", order: 5 },
      { name: "잠실나루역", code: "JAMSILNARU", latitude: 37.520390, longitude: 127.103789, address: "서울특별시 송파구 올림픽로 240", order: 6 },
      { name: "강변역", code: "GANGBYEON", latitude: 37.535095, longitude: 127.094681, address: "서울특별시 광진구 능동로 120", order: 7 },
      { name: "건대입구역", code: "KONKUK", latitude: 37.540705, longitude: 127.089246, address: "서울특별시 광진구 능동로 120", order: 8 },
      { name: "구의역", code: "GUI", latitude: 37.544018, longitude: 127.085909, address: "서울특별시 광진구 능동로 120", order: 9 },
      { name: "아차산역", code: "ACHASAN", latitude: 37.551622, longitude: 127.089188, address: "서울특별시 광진구 능동로 120", order: 10 },
      { name: "광나루역", code: "GWANGNARU", latitude: 37.545303, longitude: 127.103248, address: "서울특별시 광진구 능동로 120", order: 11 },
      { name: "천호역", code: "CHEONHO", latitude: 37.538397, longitude: 127.123572, address: "서울특별시 강동구 천호대로 1000", order: 12 },
      { name: "강동역", code: "GANGDONG", latitude: 37.535815, longitude: 127.132481, address: "서울특별시 강동구 천호대로 1000", order: 13 },
      { name: "고덕역", code: "GODEOK", latitude: 37.555004, longitude: 127.151907, address: "서울특별시 강동구 천호대로 1000", order: 14 },
      { name: "상일동역", code: "SANGIL", latitude: 37.556762, longitude: 127.168485, address: "서울특별시 강동구 천호대로 1000", order: 15 },
      { name: "강일역", code: "GANGIL", latitude: 37.557192, longitude: 127.175548, address: "서울특별시 강동구 천호대로 1000", order: 16 },
      { name: "미사역", code: "MISA", latitude: 37.563015, longitude: 127.192475, address: "서울특별시 하남시 미사대로 520", order: 17 },
      { name: "하남풍산역", code: "HANAM", latitude: 37.551353, longitude: 127.203866, address: "서울특별시 하남시 미사대로 520", order: 18 },
      { name: "하남시청역", code: "HANAMCITY", latitude: 37.539519, longitude: 127.214866, address: "서울특별시 하남시 미사대로 520", order: 19 },
      { name: "하남검단산역", code: "GEOMDAN", latitude: 37.547519, longitude: 127.221866, address: "서울특별시 하남시 미사대로 520", order: 20 },
      { name: "둔촌동역", code: "DUNCHON", latitude: 37.527066, longitude: 127.136248, address: "서울특별시 강동구 천호대로 1000", order: 21 },
      { name: "올림픽공원역", code: "OLYMPIC", latitude: 37.516073, longitude: 127.130848, address: "서울특별시 송파구 올림픽로 25", order: 22 },
      { name: "방이역", code: "BANGI", latitude: 37.508838, longitude: 127.126248, address: "서울특별시 송파구 올림픽로 25", order: 23 },
      { name: "오금역", code: "OGEUM", latitude: 37.502066, longitude: 127.128248, address: "서울특별시 송파구 올림픽로 25", order: 24 },
      { name: "가락시장역", code: "GARAK", latitude: 37.492838, longitude: 127.118248, address: "서울특별시 송파구 올림픽로 25", order: 25 },
      { name: "문정역", code: "MUNJEONG", latitude: 37.485838, longitude: 127.108248, address: "서울특별시 송파구 올림픽로 25", order: 26 },
      { name: "장지역", code: "JANGJI", latitude: 37.478838, longitude: 127.098248, address: "서울특별시 송파구 올림픽로 25", order: 27 },
      { name: "복정역", code: "BOKJEONG", latitude: 37.471838, longitude: 127.088248, address: "서울특별시 송파구 올림픽로 25", order: 28 },
      { name: "남한산성입구역", code: "NAMHAN", latitude: 37.464838, longitude: 127.078248, address: "서울특별시 송파구 올림픽로 25", order: 29 },
      { name: "단대오거리역", code: "DANDAE", latitude: 37.457838, longitude: 127.068248, address: "서울특별시 송파구 올림픽로 25", order: 30 },
      { name: "신흥역", code: "SINHEUNG", latitude: 37.450838, longitude: 127.058248, address: "서울특별시 송파구 올림픽로 25", order: 31 },
      { name: "수진역", code: "SUJIN", latitude: 37.443838, longitude: 127.048248, address: "서울특별시 송파구 올림픽로 25", order: 32 },
      { name: "모란역", code: "MORAN", latitude: 37.436838, longitude: 127.038248, address: "서울특별시 송파구 올림픽로 25", order: 33 },
      { name: "야탑역", code: "YATAP", latitude: 37.429838, longitude: 127.028248, address: "서울특별시 성남시 분당구 성남대로 34", order: 34 },
      { name: "이매역", code: "IMAE", latitude: 37.422838, longitude: 127.018248, address: "서울특별시 성남시 분당구 성남대로 34", order: 35 },
      { name: "서현역", code: "SEOHEON", latitude: 37.415838, longitude: 127.008248, address: "서울특별시 성남시 분당구 성남대로 34", order: 36 },
      { name: "수내역", code: "SUNAE", latitude: 37.408838, longitude: 126.998248, address: "서울특별시 성남시 분당구 성남대로 34", order: 37 },
      { name: "정자역", code: "JEONGJA", latitude: 37.401838, longitude: 126.988248, address: "서울특별시 성남시 분당구 성남대로 34", order: 38 },
      { name: "미금역", code: "MIGEUM", latitude: 37.394838, longitude: 126.978248, address: "서울특별시 성남시 분당구 성남대로 34", order: 39 },
      { name: "오리역", code: "ORI", latitude: 37.387838, longitude: 126.968248, address: "서울특별시 성남시 분당구 성남대로 34", order: 40 },
      { name: "죽전역", code: "JUKJEON", latitude: 37.380838, longitude: 126.958248, address: "서울특별시 성남시 분당구 성남대로 34", order: 41 },
      { name: "보정역", code: "BOJEONG", latitude: 37.373838, longitude: 126.948248, address: "서울특별시 성남시 분당구 성남대로 34", order: 42 },
      { name: "구성역", code: "GUSEONG", latitude: 37.366838, longitude: 126.938248, address: "서울특별시 성남시 분당구 성남대로 34", order: 43 },
      { name: "신갈역", code: "SINGAL", latitude: 37.359838, longitude: 126.928248, address: "서울특별시 성남시 분당구 성남대로 34", order: 44 },
      { name: "기흥역", code: "GIHUNG", latitude: 37.352838, longitude: 126.918248, address: "서울특별시 성남시 분당구 성남대로 34", order: 45 },
      { name: "강남대역", code: "GANGNAMDAE", latitude: 37.345838, longitude: 126.908248, address: "서울특별시 성남시 분당구 성남대로 34", order: 46 },
      { name: "지석역", code: "JISEOK", latitude: 37.338838, longitude: 126.898248, address: "서울특별시 성남시 분당구 성남대로 34", order: 47 },
      { name: "어정역", code: "EOJEONG", latitude: 37.331838, longitude: 126.888248, address: "서울특별시 성남시 분당구 성남대로 34", order: 48 },
      { name: "동백역", code: "DONGBAEK", latitude: 37.324838, longitude: 126.878248, address: "서울특별시 성남시 분당구 성남대로 34", order: 49 },
      { name: "초당역", code: "CHODANG", latitude: 37.317838, longitude: 126.868248, address: "서울특별시 성남시 분당구 성남대로 34", order: 50 },
      { name: "삼가역", code: "SAMGA", latitude: 37.310838, longitude: 126.858248, address: "서울특별시 성남시 분당구 성남대로 34", order: 51 },
      { name: "시청·용인대역", code: "YONGIN", latitude: 37.303838, longitude: 126.848248, address: "서울특별시 성남시 분당구 성남대로 34", order: 52 },
      { name: "명지대역", code: "MYONGJI", latitude: 37.296838, longitude: 126.838248, address: "서울특별시 성남시 분당구 성남대로 34", order: 53 },
      { name: "김량장역", code: "KIMRYANG", latitude: 37.289838, longitude: 126.828248, address: "서울특별시 성남시 분당구 성남대로 34", order: 54 },
      { name: "운동장·송담대역", code: "SUNGDAM", latitude: 37.282838, longitude: 126.818248, address: "서울특별시 성남시 분당구 성남대로 34", order: 55 },
      { name: "고진역", code: "GOJIN", latitude: 37.275838, longitude: 126.808248, address: "서울특별시 성남시 분당구 성남대로 34", order: 56 },
      { name: "보평역", code: "BOPYEONG", latitude: 37.268838, longitude: 126.798248, address: "서울특별시 성남시 분당구 성남대로 34", order: 57 },
      { name: "둔전역", code: "DUNJEON", latitude: 37.261838, longitude: 126.788248, address: "서울특별시 성남시 분당구 성남대로 34", order: 58 },
      { name: "전대·에버랜드역", code: "EVERLAND", latitude: 37.254838, longitude: 126.778248, address: "서울특별시 성남시 분당구 성남대로 34", order: 59 },
      { name: "발곡역", code: "BALGOK", latitude: 37.247838, longitude: 126.768248, address: "서울특별시 성남시 분당구 성남대로 34", order: 60 },
      { name: "범계역", code: "BEOMGYE", latitude: 37.240838, longitude: 126.758248, address: "서울특별시 성남시 분당구 성남대로 34", order: 61 },
      { name: "평촌역", code: "PYEONGCHON", latitude: 37.233838, longitude: 126.748248, address: "서울특별시 성남시 분당구 성남대로 34", order: 62 },
      { name: "인덕원역", code: "INDEOKWON", latitude: 37.226838, longitude: 126.738248, address: "서울특별시 성남시 분당구 성남대로 34", order: 63 },
      { name: "과천역", code: "GWACHEON", latitude: 37.219838, longitude: 126.728248, address: "서울특별시 성남시 분당구 성남대로 34", order: 64 },
      { name: "대공원역", code: "DAEGONGWON", latitude: 37.212838, longitude: 126.718248, address: "서울특별시 성남시 분당구 성남대로 34", order: 65 },
      { name: "경마공원역", code: "GYEONGMA", latitude: 37.205838, longitude: 126.708248, address: "서울특별시 성남시 분당구 성남대로 34", order: 66 },
      { name: "대청역", code: "DAECHEONG", latitude: 37.198838, longitude: 126.698248, address: "서울특별시 성남시 분당구 성남대로 34", order: 67 },
      { name: "서초역", code: "SEOCHO", latitude: 37.191838, longitude: 126.688248, address: "서울특별시 성남시 분당구 성남대로 34", order: 68 },
      { name: "방배역", code: "BANGBAE", latitude: 37.184838, longitude: 126.678248, address: "서울특별시 성남시 분당구 성남대로 34", order: 69 },
      { name: "서빙고역", code: "SEOBINGGO", latitude: 37.177838, longitude: 126.668248, address: "서울특별시 성남시 분당구 성남대로 34", order: 70 },
      { name: "한강진역", code: "HANGANGJIN", latitude: 37.170838, longitude: 126.658248, address: "서울특별시 성남시 분당구 성남대로 34", order: 71 },
      { name: "이태원역", code: "ITAEWON", latitude: 37.163838, longitude: 126.648248, address: "서울특별시 성남시 분당구 성남대로 34", order: 72 },
      { name: "녹사평역", code: "NOKSAPYEONG", latitude: 37.156838, longitude: 126.638248, address: "서울특별시 성남시 분당구 성남대로 34", order: 73 },
      { name: "용산역", code: "YONGSAN", latitude: 37.149838, longitude: 126.628248, address: "서울특별시 성남시 분당구 성남대로 34", order: 74 },
      { name: "숙대입구역", code: "SOOKDAE", latitude: 37.142838, longitude: 126.618248, address: "서울특별시 성남시 분당구 성남대로 34", order: 75 }
    ]
  },
  {
    name: "홍대입구 ↔ 강남역",
    stops: [
      { name: "홍대입구역", code: "HONGDAE", latitude: 37.557192, longitude: 126.923191, address: "서울특별시 마포구 양화로 160", order: 0 },
      { name: "합정역", code: "HAPJEONG", latitude: 37.549192, longitude: 126.913191, address: "서울특별시 마포구 양화로 160", order: 1 },
      { name: "당산역", code: "DANGSAN", latitude: 37.541192, longitude: 126.903191, address: "서울특별시 마포구 양화로 160", order: 2 },
      { name: "영등포구청역", code: "YEONGDEUNGPO", latitude: 37.533192, longitude: 126.893191, address: "서울특별시 마포구 양화로 160", order: 3 },
      { name: "문래역", code: "MUNRAE", latitude: 37.525192, longitude: 126.883191, address: "서울특별시 마포구 양화로 160", order: 4 },
      { name: "신도림역", code: "SINDORIM", latitude: 37.517192, longitude: 126.873191, address: "서울특별시 마포구 양화로 160", order: 5 },
      { name: "대림역", code: "DAERIM", latitude: 37.509192, longitude: 126.863191, address: "서울특별시 마포구 양화로 160", order: 6 },
      { name: "구로디지털단지역", code: "GURO", latitude: 37.501192, longitude: 126.853191, address: "서울특별시 마포구 양화로 160", order: 7 },
      { name: "신대방역", code: "SINDAEBANG", latitude: 37.493192, longitude: 126.843191, address: "서울특별시 마포구 양화로 160", order: 8 },
      { name: "신림역", code: "SINLIM", latitude: 37.485192, longitude: 126.833191, address: "서울특별시 마포구 양화로 160", order: 9 },
      { name: "봉천역", code: "BONGCHEON", latitude: 37.477192, longitude: 126.823191, address: "서울특별시 마포구 양화로 160", order: 10 },
      { name: "서울대입구역", code: "SEOULDAE", latitude: 37.469192, longitude: 126.813191, address: "서울특별시 마포구 양화로 160", order: 11 },
      { name: "낙성대역", code: "NAKSEONGDAE", latitude: 37.461192, longitude: 126.803191, address: "서울특별시 마포구 양화로 160", order: 12 },
      { name: "사당역", code: "SADANG", latitude: 37.453192, longitude: 126.793191, address: "서울특별시 마포구 양화로 160", order: 13 },
      { name: "교대역", code: "GYODAE", latitude: 37.445192, longitude: 126.783191, address: "서울특별시 마포구 양화로 160", order: 14 },
      { name: "강남역", code: "GANGNAM", latitude: 37.498095, longitude: 127.027610, address: "서울특별시 강남구 강남대로 396", order: 15 }
    ]
  }
];

// 실제 버스 차량 데이터
const REAL_BUSES = [
  { number: "150번", licensePlate: "서울70사1234", latitude: 37.498095, longitude: 127.027610, status: "ACTIVE", currentStopIndex: 0 },
  { number: "150번", licensePlate: "서울70사5678", latitude: 37.500622, longitude: 127.036456, status: "ACTIVE", currentStopIndex: 1 },
  { number: "150번", licensePlate: "서울70사9012", latitude: 37.504610, longitude: 127.049188, status: "ACTIVE", currentStopIndex: 2 },
  { number: "2호선", licensePlate: "서울70사3456", latitude: 37.557192, longitude: 126.923191, status: "ACTIVE", currentStopIndex: 0 },
  { number: "2호선", licensePlate: "서울70사7890", latitude: 37.549192, longitude: 126.913191, status: "ACTIVE", currentStopIndex: 1 }
];

// 배치 처리를 위한 유틸리티
async function batchInsert<T>(
  model: any,
  data: T[],
  batchSize: number = 100
): Promise<any[]> {
  const results: any[] = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const created = await Promise.all(
      batch.map(item => model.create({ data: item }))
    );
    results.push(...created);
  }
  
  return results;
}

// 메인 시드 함수
async function main() {
  const tracker = new PerformanceTracker();
  
  try {
    console.log('🌱 데이터베이스 시드 시작...\n');

    // 1. 기존 데이터 정리
    console.log('🧹 기존 데이터 정리 중...');
    await prisma.callRequest.deleteMany();
    await prisma.routeStop.deleteMany();
    await prisma.bus.deleteMany();
    await prisma.busStop.deleteMany();
    await prisma.route.deleteMany();
    tracker.checkpoint('데이터 정리');

    // 2. 정류장 데이터 삽입
    console.log('🚏 정류장 데이터 삽입 중...');
    const allStops = REAL_BUS_ROUTES.flatMap(route => route.stops);
    const uniqueStops = allStops.filter((stop, index, self) => 
      index === self.findIndex(s => s.code === stop.code)
    );
    
    // order 필드를 제거하고 정류장 데이터만 사용
    const stopsForInsert = uniqueStops.map(stop => ({
      name: stop.name,
      code: stop.code,
      latitude: stop.latitude,
      longitude: stop.longitude,
      address: stop.address
    }));
    
    const createdStops = await batchInsert(prisma.busStop, stopsForInsert);
    tracker.checkpoint('정류장 삽입');

    // 3. 노선 데이터 삽입
    console.log('🚌 노선 데이터 삽입 중...');
    const routes = await Promise.all(
      REAL_BUS_ROUTES.map(routeData => 
        prisma.route.create({
          data: { name: routeData.name }
        })
      )
    );
    tracker.checkpoint('노선 삽입');

    // 4. 노선별 정류장 연결 데이터 삽입
    console.log('🔗 노선별 정류장 연결 데이터 삽입 중...');
    const routeStops: Array<{routeId: string, stopId: string, order: number}> = [];
    
    for (const routeData of REAL_BUS_ROUTES) {
      const route = routes.find(r => r.name === routeData.name);
      if (!route) continue;
      
      for (const stopData of routeData.stops) {
        const stop = createdStops.find(s => s.code === stopData.code);
        if (!stop) continue;
        
        routeStops.push({
          routeId: route.id,
          stopId: stop.id,
          order: stopData.order
        });
      }
    }
    
    await batchInsert(prisma.routeStop, routeStops);
    tracker.checkpoint('노선별 정류장 연결');

    // 5. 버스 차량 데이터 삽입
    console.log('🚗 버스 차량 데이터 삽입 중...');
    const buses: Array<{routeId: string, number: string, licensePlate: string, latitude: number, longitude: number, status: string, currentStopIndex: number}> = [];
    
    for (const busData of REAL_BUSES) {
      const route = routes.find(r => r.name.includes(busData.number === "150번" ? "강남역" : "홍대입구"));
      if (!route) continue;
      
      buses.push({
        ...busData,
        routeId: route.id
      });
    }
    
    const createdBuses = await batchInsert(prisma.bus, buses);
    tracker.checkpoint('버스 차량 삽입');

    // 6. 샘플 승차벨 요청 데이터 삽입
    console.log('🔔 샘플 승차벨 요청 데이터 삽입 중...');
    const sampleRequests: Array<{busId: string, stopId: string, status: string, expiresAt: Date}> = [];
    
    for (let i = 0; i < 50; i++) {
      const randomStop = createdStops[Math.floor(Math.random() * createdStops.length)];
      const randomBus = createdBuses[Math.floor(Math.random() * createdBuses.length)];
      
      sampleRequests.push({
        busId: randomBus.id,
        stopId: randomStop.id,
        status: ['PENDING', 'ACCEPTED', 'COMPLETED', 'EXPIRED'][Math.floor(Math.random() * 4)],
        expiresAt: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000) // 24시간 내 랜덤
      });
    }
    
    await batchInsert(prisma.callRequest, sampleRequests);
    tracker.checkpoint('승차벨 요청 삽입');

    // 7. 데이터 검증
    console.log('✅ 데이터 검증 중...');
    const stats = await Promise.all([
      prisma.route.count(),
      prisma.busStop.count(),
      prisma.routeStop.count(),
      prisma.bus.count(),
      prisma.callRequest.count()
    ]);
    
    console.log(`\n📊 시드 완료 통계:`);
    console.log(`   노선: ${stats[0]}개`);
    console.log(`   정류장: ${stats[1]}개`);
    console.log(`   노선별 정류장: ${stats[2]}개`);
    console.log(`   버스: ${stats[3]}개`);
    console.log(`   승차벨 요청: ${stats[4]}개`);

    tracker.finish();

  } catch (error) {
    console.error('❌ 시드 실행 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 시드가 성공적으로 완료되었습니다!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 시드 실행 실패:', error);
      process.exit(1);
    });
}

export { main as seed };
