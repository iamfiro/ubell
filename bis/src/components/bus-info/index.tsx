import { DirectionsBus } from "@mui/icons-material";
import { useEffect, useState } from "react";

import s from "./style.module.scss";

interface BusInfoProps {
  busNumber: string;
  disablePeople: boolean;
  time: number;
  station: number;
  routeType?: string;
  vehicleType?: string;
  onBusCall?: (busNumber: string, isCalled: boolean) => void;
  stationId?: string;
  wsInstance?: WebSocket | null; // WebSocket 인스턴스 추가
  updatedAt?: Date;
  routeTp?: string;
  isCalled?: boolean; // 호출 상태 추가
  isFocused?: boolean; // 일반 모드 포커스
  isSelected?: boolean; // 음성 모드 선택
  isVoiceMode?: boolean; // 음성 모드 여부
}

export default function BusInfo({
  busNumber,
  disablePeople = false,
  time,
  station,
  onBusCall,
  stationId,
  wsInstance,
  updatedAt,
  routeTp,
  isCalled,
  isFocused = false,
  isSelected = false,
  isVoiceMode = false,
}: BusInfoProps) {
  const [isCalling, setIsCalling] = useState(false);

  // 1초마다 화면 갱신을 위한 상태
  const [, forceUpdate] = useState(0);

  // 1초마다 화면 갱신 (실제 시간 계산은 getActualRemainingTime에서 처리)
  useEffect(() => {
    const timer = setInterval(() => {
      // 강제로 리렌더링하여 시간 표시 업데이트
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 버스 호출 함수
  const handleBusCall = async () => {
    if (!wsInstance || !stationId) {
      console.error("WebSocket이 연결되지 않았거나 stationId가 없습니다.");
      return;
    }

    setIsCalling(true);

    try {
      // WebSocket을 통해 버스 호출 메시지 전송
      const message = {
        type: "busCall",
        stationId: stationId,
        routeNo: busNumber,
      };

      console.log(message);

      if (wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify(message));
        console.log("버스 호출 메시지 전송:", message);

        // 부모 컴포넌트의 onBusCall 콜백 호출 (호출 상태를 true로)
        if (onBusCall) {
          onBusCall(busNumber, true);
        }
      } else {
        console.error("WebSocket이 열려있지 않습니다.");
      }
    } catch (error) {
      console.error("버스 호출 중 오류 발생:", error);
    } finally {
      setIsCalling(false);
    }
  };

  // 버스 호출 취소 함수
  const handleBusCallCancel = async () => {
    if (!wsInstance || !stationId) {
      console.error("WebSocket이 연결되지 않았거나 stationId가 없습니다.");
      return;
    }

    setIsCalling(true);

    try {
      // WebSocket을 통해 버스 호출 취소 메시지 전송
      const message = {
        type: "busCallDelete",
        stationId: stationId,
        routeNo: busNumber,
      };

      console.log(message);

      if (wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify(message));
        console.log("버스 호출 취소 메시지 전송:", message);

        // 부모 컴포넌트의 onBusCall 콜백 호출 (호출 상태를 false로)
        if (onBusCall) {
          onBusCall(busNumber, false);
        }
      } else {
        console.error("WebSocket이 열려있지 않습니다.");
      }
    } catch (error) {
      console.error("버스 호출 취소 중 오류 발생:", error);
    } finally {
      setIsCalling(false);
    }
  };

  // 호출/취소 토글 함수
  const handleBusCallToggle = () => {
    if (isCalled) {
      handleBusCallCancel();
    } else {
      handleBusCall();
    }
  };

  // updatedAt을 기준으로 실제 남은 시간 계산
  const getActualRemainingTime = () => {
    if (!updatedAt) return time;

    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const timeDiff = Math.floor((now.getTime() - updatedTime.getTime()) / 1000); // 초 단위

    // time은 이미 DB에서 계산된 arrivalTime이므로, 경과 시간을 빼서 실제 남은 시간 계산
    const actualTime = Math.max(0, time - timeDiff);

    return actualTime;
  };

  // 시간 표시 함수
  const getTimeDisplay = () => {
    const actualTime = getActualRemainingTime();

    if (actualTime <= 0) {
      return "곧 도착";
    } else if (actualTime < 60) {
      return `곧 도착`;
    } else {
      const minutes = Math.floor(actualTime / 60);
      return `${minutes}분`;
    }
  };

  const isWsConnected = wsInstance && wsInstance.readyState === WebSocket.OPEN;

  // 포커스/선택 상태에 따른 스타일 계산
  const getContainerStyle = () => {
    const baseStyle = {};

    if (isFocused && !isVoiceMode) {
      // 일반 모드 포커스 스타일
      return {
        ...baseStyle,
        outline: "3px solid #007AFF",
        outlineOffset: "2px",
        borderRadius: "8px",
      };
    }

    if (isSelected && isVoiceMode) {
      // 음성 모드 선택 스타일
      return {
        ...baseStyle,
        backgroundColor: "rgba(0, 122, 255, 0.1)",
        border: "2px solid #007AFF",
        borderRadius: "8px",
      };
    }

    return baseStyle;
  };

  return (
    <article className={s.busInfo} style={getContainerStyle()}>
      <div
        className={s.left}
        style={{
          backgroundColor:
            routeTp === "마을버스"
              ? "yellow"
              : routeTp === "광역버스"
                ? "red"
                : "blue",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
          gap: "4px",
        }}
      >
        {/* {(vehicleType === '저상버스') && <AccessibleIcon />} */}
        <DirectionsBus />
        <div>
          <p style={{ margin: 0 }}>{busNumber}</p>
        </div>
      </div>
      <div className={s.center}>
        <p
          className={s.time}
          style={{
            color:
              getActualRemainingTime() <= 30
                ? "#ff4444"
                : getActualRemainingTime() <= 60
                  ? "#ff8800"
                  : "#333",
          }}
        >
          {getTimeDisplay()}
        </p>
        <p className={s.station}>{station} 정거장 남음</p>
      </div>
      <button
        className={s.button}
        onClick={handleBusCallToggle}
        disabled={disablePeople || isCalling || !isWsConnected}
        style={{
          backgroundColor:
            !isWsConnected || disablePeople
              ? "#f00"
              : isCalled
                ? "#ff8800"
                : "#efefef",
          color:
            !isWsConnected || disablePeople
              ? "#fff"
              : isCalled
                ? "#fff"
                : "#333",
        }}
      >
        <p>
          {!isWsConnected
            ? "연결 중..."
            : disablePeople
              ? "호출됨"
              : isCalling
                ? "처리 중..."
                : isCalled
                  ? "취소"
                  : "호출"}
        </p>
      </button>
    </article>
  );
}
