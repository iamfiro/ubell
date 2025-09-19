import { Banner, BusArrivalCard, Header, News } from "@/feature/bis/components";
import { VStack } from "@/shared/components";

const NEWS_ITEMS = [
  "김정은 덕에 친해진 이재명·트럼프… 유대감 형성 큰 성과 [美 전문가 평가]",
  "'내란 방조' 한덕수 전 총리, 오늘 구속 기로",
  "[미니 다큐]죽음의 '손배 폭탄' 막을 노란봉투법...20년 만에 국회 통과",
];

export default function BISServicePage() {
  return (
    <VStack>
      <Header stationName="부천범박힐스테이트1.2단지" />
      <News articles={NEWS_ITEMS} />
      <Banner />
      <BusArrivalCard
        id="1"
        name="56-1"
        routeType="일반버스"
        arrivalTime={10}
        remainingStops={10}
        isCalled={false}
      />
      <p>마지막 업데이트: 2025-09-19 10:00:00</p>
    </VStack>
  );
}
