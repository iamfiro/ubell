import { useCallback, useEffect, useRef, useState } from "react";

import BusArrivalsList from "../components/BusArrivalsList";
import Header from "../components/header";
import LastUpdateTime from "../components/LastUpdateTime";
import News from "../components/news";
import ReservationComplete from "../components/ReservationComplete";
// 커스텀 훅들 import
import { useBusArrivals } from "../hooks/useBusArrivals";
import { useBusCall } from "../hooks/useBusCall";
import { useBusReservation } from "../hooks/useBusReservation";
import { useWebSocket } from "../hooks/useWebSocket";

// ElevenLabs API 직접 호출

function Home() {
  // 커스텀 훅들 사용
  const { stationBusInfo } = useBusArrivals();

  const { wsRef, sendMessage } = useWebSocket({
    onBusCallEnd: (routeNo: string) => {
      removeBusCall(routeNo);
    },
  });

  const { calledBuses, handleBusCall, removeBusCall, addBusCall } = useBusCall({
    stationBusInfo,
    sendMessage,
  });

  const { isReserved, reservedBus, countdown, returnToMain } =
    useBusReservation({
      onBusReserved: (busNumber: string) => {
        addBusCall(busNumber);
      },
    });

  // 음성 지원 모드 상태
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [selectedBusIndex, setSelectedBusIndex] = useState(0);
  const [focusedBusIndex, setFocusedBusIndex] = useState(0); // 일반 모드 포커스
  const [isFocusMode, setIsFocusMode] = useState(false); // 포커스 모드 활성화 여부
  const [isFirstVoiceInput, setIsFirstVoiceInput] = useState(true); // 음성 모드에서 첫 입력인지
  const inputTimerRef = useRef<number | null>(null);
  const focusTimerRef = useRef<number | null>(null); // 포커스 타이머
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef1 = useRef<HTMLAudioElement | null>(null); // 오디오 객체 1
  const audioRef2 = useRef<HTMLAudioElement | null>(null); // 오디오 객체 2
  const useAudioRef1 = useRef<boolean>(true); // 어떤 오디오 객체를 사용할지

  // 중복 제거된 버스 목록 계산 (포커스/선택에서 동일한 배열 사용)
  const uniqueBuses =
    stationBusInfo?.buses
      ?.reduce((uniqueBuses: any[], bus) => {
        const existingBus = uniqueBuses.find(
          (uniqueBus) => uniqueBus.routeNo === bus.routeNo,
        );

        if (!existingBus) {
          uniqueBuses.push(bus);
        } else if (bus.arrivalTime < existingBus.arrivalTime) {
          const index = uniqueBuses.findIndex(
            (uniqueBus) => uniqueBus.routeNo === bus.routeNo,
          );
          uniqueBuses[index] = bus;
        }

        return uniqueBuses;
      }, [])
      ?.sort((a, b) => {
        // 버스 번호를 메인 번호와 서브 번호로 분리해서 정렬
        const parseRouteNo = (routeNo: string) => {
          const match = routeNo.match(/^(\d+)(.*)$/);
          if (match) {
            const mainNum = parseInt(match[1]);
            const subPart = match[2] || "";
            return { mainNum, subPart };
          }
          return { mainNum: 0, subPart: routeNo };
        };

        const routeA = parseRouteNo(a.routeNo);
        const routeB = parseRouteNo(b.routeNo);

        // 메인 번호로 먼저 정렬
        if (routeA.mainNum !== routeB.mainNum) {
          return routeA.mainNum - routeB.mainNum;
        }

        // 메인 번호가 같으면 서브 부분으로 정렬
        return routeA.subPart.localeCompare(routeB.subPart);
      }) || [];

  // uniqueBuses 변경 시 디버깅 정보 출력
  useEffect(() => {
    if (uniqueBuses && uniqueBuses.length > 0) {
      console.log(`🚌 uniqueBuses 배열 순서 (${uniqueBuses.length}개):`);
      uniqueBuses.forEach((bus, idx) => {
        console.log(
          `  [${idx}] ${bus.routeNo}번 - ${Math.ceil(bus.arrivalTime)}분`,
        );
      });
    }
  }, [uniqueBuses]);

  // TTS 초기화
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // 숫자를 한국어 발음으로 변환하는 함수
  const convertNumbersToKorean = useCallback((text: string) => {
    // 복잡한 버스 번호 패턴 (예: "56-1번", "10A번", "123번")
    return (
      text
        .replace(
          /(\d+)([A-Z]?)(-(\d+))?번/g,
          (_, mainNum, alpha, __, subNum) => {
            const convertToKorean = (num: string) => {
              const digits = [
                "",
                "일",
                "이",
                "삼",
                "사",
                "오",
                "육",
                "칠",
                "팔",
                "구",
              ];
              const tens = [
                "",
                "십",
                "이십",
                "삼십",
                "사십",
                "오십",
                "육십",
                "칠십",
                "팔십",
                "구십",
              ];
              const hundreds = [
                "",
                "일백",
                "이백",
                "삼백",
                "사백",
                "오백",
                "육백",
                "칠백",
                "팔백",
                "구백",
              ];

              const n = parseInt(num);
              if (n === 0) return "영";
              if (n < 10) return digits[n];
              if (n < 100) {
                const ten = Math.floor(n / 10);
                const one = n % 10;
                return tens[ten] + (one > 0 ? digits[one] : "");
              }
              if (n < 1000) {
                const hundred = Math.floor(n / 100);
                const remainder = n % 100;
                let result = hundreds[hundred];
                if (remainder >= 10) {
                  const ten = Math.floor(remainder / 10);
                  const one = remainder % 10;
                  result += tens[ten] + (one > 0 ? digits[one] : "");
                } else if (remainder > 0) {
                  result += digits[remainder];
                }
                return result;
              }
              return num; // 1000 이상은 그대로
            };

            const convertAlpha = (letter: string) => {
              const alphaMap: { [key: string]: string } = {
                A: "에이",
                B: "비",
                C: "씨",
                D: "디",
                E: "이",
                F: "에프",
                G: "지",
                H: "에이치",
                I: "아이",
                J: "제이",
                K: "케이",
                L: "엘",
                M: "엠",
                N: "엔",
                O: "오",
                P: "피",
                Q: "큐",
                R: "알",
                S: "에스",
                T: "티",
                U: "유",
                V: "브이",
                W: "더블유",
                X: "엑스",
                Y: "와이",
                Z: "지",
              };
              return alphaMap[letter] || letter;
            };

            let result = convertToKorean(mainNum);

            // 알파벳 처리 (예: 10A → 십에이)
            if (alpha) {
              result += convertAlpha(alpha);
            }

            // 서브 번호 처리 (예: 56-1 → 오십육다시일)
            if (subNum) {
              const subKorean = convertToKorean(subNum);
              result += `다시${subKorean}`;
            }

            return `${result}번`;
          },
        )
        // 일반 숫자도 변환 (분 단위)
        .replace(/(\d+)분/g, (_, num) => {
          const convertToKorean = (num: string) => {
            const digits = [
              "",
              "일",
              "이",
              "삼",
              "사",
              "오",
              "육",
              "칠",
              "팔",
              "구",
            ];
            const tens = [
              "",
              "십",
              "이십",
              "삼십",
              "사십",
              "오십",
              "육십",
              "칠십",
              "팔십",
              "구십",
            ];

            const n = parseInt(num);
            if (n === 0) return "영";
            if (n < 10) return digits[n];
            if (n < 100) {
              const ten = Math.floor(n / 10);
              const one = n % 10;
              return tens[ten] + (one > 0 ? digits[one] : "");
            }
            return num;
          };

          return `${convertToKorean(num)}분`;
        })
    );
  }, []);

  // ElevenLabs TTS 함수
  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

      // 숫자를 한국어 발음으로 변환
      const convertedText = convertNumbersToKorean(text);
      console.log(`TTS 변환: "${text}" → "${convertedText}"`);

      const finalText = convertedText;

      // 브라우저 TTS 중단
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
        console.log("🔇 브라우저 TTS 중단됨");
      }

      // 오디오 객체 2개 번갈아 사용 - 이전 오디오만 중단
      const currentAudioRef = useAudioRef1.current ? audioRef1 : audioRef2;
      const previousAudioRef = useAudioRef1.current ? audioRef2 : audioRef1;

      // 이전 오디오만 중단
      if (previousAudioRef.current) {
        previousAudioRef.current.pause();
        previousAudioRef.current.currentTime = 0;
        previousAudioRef.current = null;
        console.log("🔇 이전 오디오 중단됨");
      }

      // 다음번엔 다른 오디오 객체 사용
      useAudioRef1.current = !useAudioRef1.current;
      console.log(
        `🎛️ 오디오 객체 전환: ${useAudioRef1.current ? "audioRef2 → audioRef1" : "audioRef1 → audioRef2"}`,
      );

      if (!apiKey || apiKey === "your_api_key_here") {
        console.warn("ElevenLabs API 키가 설정되지 않음, 브라우저 TTS 사용");
        // 폴백: 브라우저 TTS
        if (speechSynthRef.current) {
          const utterance = new SpeechSynthesisUtterance(finalText);
          utterance.lang = "ko-KR";
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 1;
          speechSynthRef.current.speak(utterance);
        }
        return;
      }

      try {
        console.log("🎯 ElevenLabs API 요청 시작:", finalText);
        // ElevenLabs API 호출 (Rachel 음성, 한국어 지원)
        const response = await fetch(
          "https://api.elevenlabs.io/v1/text-to-speech/uyVNoMrnUku1dZyVEXwD",
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
            body: JSON.stringify({
              text: finalText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                speed: 0.9,
                style: 0.0,
                use_speaker_boost: true,
              },
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`ElevenLabs API 오류: ${response.status}`);
        }

        // 오디오 데이터를 받아서 재생
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio; // 현재 사용 중인 오디오 객체에 저장

        console.log("🔊 ElevenLabs 오디오 재생 시작");
        audio.play();

        // 재생 완료 후 URL 정리
        audio.addEventListener("ended", () => {
          URL.revokeObjectURL(audioUrl);
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
          console.log("🎵 ElevenLabs 오디오 재생 완료");
        });
      } catch (error: any) {
        console.error("ElevenLabs TTS 오류:", error);
        // 폴백: 브라우저 TTS
        if (speechSynthRef.current) {
          const utterance = new SpeechSynthesisUtterance(finalText);
          utterance.lang = "ko-KR";
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 1;
          speechSynthRef.current.speak(utterance);
          console.log("🔊 브라우저 TTS 폴백 재생 시작");
        }
      }
    },
    [convertNumbersToKorean],
  );

  // 음성 출력 함수 (ElevenLabs 우선 사용)
  const speak = useCallback(
    (text: string) => {
      speakWithElevenLabs(text);
    },
    [speakWithElevenLabs],
  );

  // 입력 타이머 초기화
  const resetInputTimer = useCallback(() => {
    console.log("음성 모드 타이머 리셋");
    if (inputTimerRef.current) {
      clearTimeout(inputTimerRef.current);
      inputTimerRef.current = null;
    }

    inputTimerRef.current = window.setTimeout(() => {
      console.log("음성 모드 3초 타이머 만료로 종료 (테스트용)");
      speak(
        "5초간 입력이 없어 일반 모드로 전환 되었습니다, 다시 하시려면 키패드 0번 버튼을 눌러주세요",
      );
      // 현재 선택된 버스를 포커스로 설정
      setFocusedBusIndex(selectedBusIndex);
      setIsVoiceMode(false);
      setSelectedBusIndex(0);
      setIsFirstVoiceInput(true); // 첫 입력 플래그 초기화
    }, 3000);
  }, [speak, selectedBusIndex]);

  // 포커스 타이머 초기화
  const resetFocusTimer = useCallback(() => {
    console.log("포커스 모드 타이머 리셋");
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }

    focusTimerRef.current = window.setTimeout(() => {
      console.log("포커스 모드 3초 타이머 만료로 종료 (테스트용)");
      setIsFocusMode(false);
    }, 3000);
  }, []);

  // 포커스 모드 시작
  const startFocusMode = useCallback(() => {
    if (!isVoiceMode) {
      // 음성 모드가 아닐 때만
      console.log("포커스 모드 시작 - 3초 타이머 시작 (테스트용)");
      setIsFocusMode(true);
      resetFocusTimer();
    }
  }, [isVoiceMode, resetFocusTimer]);

  // 음성 모드 시작
  const startVoiceMode = useCallback(() => {
    console.log("음성 모드 시작 - 3초 타이머 시작 (테스트용)");

    // 포커스 모드 종료
    setIsFocusMode(false);
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }

    // 음성 모드 시작 - 현재 포커스된 버스를 선택된 버스로 설정
    console.log(
      `🎯 음성 모드 시작: focusedBusIndex=${focusedBusIndex}, uniqueBuses 길이=${uniqueBuses?.length || 0}`,
    );
    if (uniqueBuses && uniqueBuses[focusedBusIndex]) {
      console.log(
        `🚌 포커스된 버스: [${focusedBusIndex}] ${uniqueBuses[focusedBusIndex].routeNo}번`,
      );
    }
    setIsVoiceMode(true);
    setSelectedBusIndex(focusedBusIndex);
    setIsFirstVoiceInput(true); // 첫 입력 플래그 설정

    speak(
      "음성 모드입니다. 플러스, 마이너스 버튼으로 버스를 선택하고 엔터키로 호출하세요.",
    );
    resetInputTimer();
  }, [speak, resetInputTimer, focusedBusIndex, uniqueBuses]);

  // 인덱스 범위 안전 확인 및 수정
  useEffect(() => {
    if (uniqueBuses && uniqueBuses.length > 0) {
      if (selectedBusIndex >= uniqueBuses.length) {
        setSelectedBusIndex(0);
      }
      if (focusedBusIndex >= uniqueBuses.length) {
        setFocusedBusIndex(0);
      }
    }
  }, [uniqueBuses, selectedBusIndex, focusedBusIndex]);

  // 음성 모드 종료
  const exitVoiceMode = useCallback(() => {
    console.log("음성 모드 수동 종료");
    // 현재 선택된 버스를 포커스로 설정
    setFocusedBusIndex(selectedBusIndex);
    setIsVoiceMode(false);
    setSelectedBusIndex(0);
    setIsFirstVoiceInput(true); // 첫 입력 플래그 초기화
    if (inputTimerRef.current) {
      clearTimeout(inputTimerRef.current);
      inputTimerRef.current = null;
    }
  }, [selectedBusIndex]);

  // 현재 선택된 버스 정보 음성 출력 (인덱스를 명시적으로 전달받음)
  const speakCurrentBus = useCallback(
    (targetIndex?: number) => {
      const busIndex =
        targetIndex !== undefined ? targetIndex : selectedBusIndex;
      console.log(
        `🎤 speakCurrentBus 호출 - targetIndex: ${targetIndex}, busIndex: ${busIndex}, selectedBusIndex: ${selectedBusIndex}, uniqueBuses 길이: ${uniqueBuses?.length || 0}`,
      );

      if (!uniqueBuses || uniqueBuses.length === 0) {
        speak("현재 운행 중인 버스가 없습니다.");
        return;
      }

      // 인덱스 범위 체크
      if (busIndex < 0 || busIndex >= uniqueBuses.length) {
        console.error(
          `❌ 잘못된 busIndex: ${busIndex}, 가능한 범위: 0-${uniqueBuses.length - 1}`,
        );
        return;
      }

      const currentBus = uniqueBuses[busIndex];
      console.log(
        `🚌 선택된 버스 [인덱스 ${busIndex}]: ${currentBus?.routeNo}번 (arrivalTime: ${currentBus?.arrivalTime}초)`,
      );
      console.log(
        `🚌 전체 uniqueBuses 배열:`,
        uniqueBuses.map((bus, idx) => `[${idx}]${bus.routeNo}번`),
      );
      console.log(`🚌 현재 버스 상세:`, currentBus);

      if (currentBus) {
        const isCalled = calledBuses.has(currentBus.routeNo.toLowerCase());
        if (isCalled) {
          speak(
            `${currentBus.routeNo}번 호출되었습니다. 취소하시려면 엔터키를 눌러주세요`,
          );
        } else {
          console.log(
            "현재 선택된 버스: ",
            currentBus.routeNo,
            currentBus.arrivalTime,
          );

          const getTimeDisplay = () => {
            const actualTime = currentBus.arrivalTime;

            if (actualTime <= 0) {
              return "곧 도착 예정입니다";
            } else if (actualTime < 60) {
              return `곧 도착 예정입니다`;
            } else {
              const minutes = Math.floor(actualTime / 60);
              return `${minutes}분 남았습니다.`;
            }
          };

          speak(
            `${convertNumbersToKorean(currentBus.routeNo)}번 버스 ${getTimeDisplay()}. 호출하시려면 엔터키를 눌러주세요`,
          );
        }
      }
    },
    [uniqueBuses, calledBuses, speak, convertNumbersToKorean],
  );

  // 다음 버스 선택 (음성 모드)
  const selectNextBus = useCallback(() => {
    if (uniqueBuses && uniqueBuses.length > 0) {
      if (isFirstVoiceInput) {
        // 첫 입력이면 현재 버스 정보만 안내
        console.log(`🎤 첫 입력: 현재 선택된 버스 ${selectedBusIndex} 안내`);
        setIsFirstVoiceInput(false);
        speakCurrentBus(selectedBusIndex);
      } else {
        // 일반적인 다음 버스 선택
        const nextIndex = (selectedBusIndex + 1) % uniqueBuses.length;
        const currentBus = uniqueBuses[selectedBusIndex];
        const nextBus = uniqueBuses[nextIndex];
        console.log(
          `➡️ 다음 버스 선택: ${selectedBusIndex}(${currentBus?.routeNo}번) → ${nextIndex}(${nextBus?.routeNo}번)`,
        );
        setSelectedBusIndex(nextIndex);
        speakCurrentBus(nextIndex);
      }
    }
  }, [uniqueBuses, selectedBusIndex, speakCurrentBus, isFirstVoiceInput]);

  // 이전 버스 선택 (음성 모드)
  const selectPrevBus = useCallback(() => {
    if (uniqueBuses && uniqueBuses.length > 0) {
      if (isFirstVoiceInput) {
        // 첫 입력이면 현재 버스 정보만 안내
        console.log(`🎤 첫 입력: 현재 선택된 버스 ${selectedBusIndex} 안내`);
        setIsFirstVoiceInput(false);
        speakCurrentBus(selectedBusIndex);
      } else {
        // 일반적인 이전 버스 선택
        const prevIndex =
          selectedBusIndex === 0
            ? uniqueBuses.length - 1
            : selectedBusIndex - 1;
        const currentBus = uniqueBuses[selectedBusIndex];
        const prevBus = uniqueBuses[prevIndex];
        console.log(
          `⬅️ 이전 버스 선택: ${selectedBusIndex}(${currentBus?.routeNo}번) → ${prevIndex}(${prevBus?.routeNo}번)`,
        );
        setSelectedBusIndex(prevIndex);
        speakCurrentBus(prevIndex);
      }
    }
  }, [uniqueBuses, selectedBusIndex, speakCurrentBus, isFirstVoiceInput]);

  // 일반 모드 포커스 이동 함수들
  const focusNextBus = useCallback(() => {
    if (uniqueBuses && uniqueBuses.length > 0) {
      if (isFocusMode) {
        console.log("포커스 모드에서 다음 버스로 이동 - 타이머 리셋");
        resetFocusTimer(); // 이미 포커스 모드일 때 타이머 리셋
      } else {
        startFocusMode(); // 포커스 모드 활성화
      }
      const nextIndex = (focusedBusIndex + 1) % uniqueBuses.length;
      console.log(
        `🔍 포커스 다음: ${focusedBusIndex}(${uniqueBuses[focusedBusIndex]?.routeNo}번) → ${nextIndex}(${uniqueBuses[nextIndex]?.routeNo}번) (총 ${uniqueBuses.length}개)`,
      );
      setFocusedBusIndex(nextIndex);
    }
  }, [
    uniqueBuses,
    focusedBusIndex,
    isFocusMode,
    startFocusMode,
    resetFocusTimer,
  ]);

  const focusPrevBus = useCallback(() => {
    if (uniqueBuses && uniqueBuses.length > 0) {
      if (isFocusMode) {
        console.log("포커스 모드에서 이전 버스로 이동 - 타이머 리셋");
        resetFocusTimer(); // 이미 포커스 모드일 때 타이머 리셋
      } else {
        startFocusMode(); // 포커스 모드 활성화
      }
      const prevIndex =
        focusedBusIndex === 0 ? uniqueBuses.length - 1 : focusedBusIndex - 1;
      console.log(
        `🔍 포커스 이전: ${focusedBusIndex}(${uniqueBuses[focusedBusIndex]?.routeNo}번) → ${prevIndex}(${uniqueBuses[prevIndex]?.routeNo}번) (총 ${uniqueBuses.length}개)`,
      );
      setFocusedBusIndex(prevIndex);
    }
  }, [
    uniqueBuses,
    focusedBusIndex,
    isFocusMode,
    startFocusMode,
    resetFocusTimer,
  ]);

  // 포커스된 버스 호출/취소
  const handleFocusedBusAction = useCallback(() => {
    if (isFocusMode && uniqueBuses && uniqueBuses[focusedBusIndex]) {
      const selectedBus = uniqueBuses[focusedBusIndex];
      const isCalled = calledBuses.has(selectedBus.routeNo.toLowerCase());

      if (isCalled) {
        // 호출 취소
        removeBusCall(selectedBus.routeNo);
      } else {
        // 버스 호출
        handleBusCall(selectedBus.routeNo);
      }

      // 포커스 타이머 리셋
      resetFocusTimer();
    }
  }, [
    isFocusMode,
    uniqueBuses,
    focusedBusIndex,
    calledBuses,
    removeBusCall,
    handleBusCall,
    resetFocusTimer,
  ]);

  // 키보드 이벤트 핸들러
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;

      // [0]키로만 음성 모드 활성화 (음성 모드가 아닐 때만)
      if (!isVoiceMode && key === "0") {
        event.preventDefault();
        startVoiceMode();
        return;
      }

      // 일반 모드에서 키패드 조작
      if (!isVoiceMode) {
        switch (key) {
          case "+":
          case "=": // Shift + = 일 때도 처리
            event.preventDefault();
            focusNextBus();
            break;
          case "-":
            event.preventDefault();
            focusPrevBus();
            break;
          case "Enter":
            event.preventDefault();
            if (isFocusMode) {
              console.log("포커스 모드에서 Enter 키 - 타이머 리셋");
              resetFocusTimer(); // 포커스 모드일 때 타이머 리셋
            }
            handleFocusedBusAction();
            break;
        }
        return;
      }

      // 음성 모드일 때 처리
      if (isVoiceMode) {
        event.preventDefault();
        console.log("음성 모드에서 키 입력 - 타이머 리셋");
        resetInputTimer();

        switch (key) {
          case "+":
          case "=": // Shift + = 일 때도 처리
            selectNextBus();
            break;
          case "-":
            selectPrevBus();
            break;
          case "Enter":
            if (uniqueBuses && uniqueBuses[selectedBusIndex]) {
              if (isFirstVoiceInput) {
                // 첫 입력이면 현재 버스 정보만 안내
                console.log(
                  `🎤 첫 입력: 현재 선택된 버스 ${selectedBusIndex} 안내`,
                );
                setIsFirstVoiceInput(false);
                speakCurrentBus(selectedBusIndex);
              } else {
                // 일반적인 호출/취소 처리
                const selectedBus = uniqueBuses[selectedBusIndex];
                const isCalled = calledBuses.has(
                  selectedBus.routeNo.toLowerCase(),
                );

                if (isCalled) {
                  // 호출 취소
                  removeBusCall(selectedBus.routeNo);
                  speak(`${selectedBus.routeNo}번 호출 취소 되었습니다`);
                } else {
                  // 버스 호출
                  handleBusCall(selectedBus.routeNo);
                  const arrivalTimeInMinutes = Math.ceil(
                    selectedBus.arrivalTime / 60,
                  );
                  const arrivalTime =
                    arrivalTimeInMinutes <= 0
                      ? "곧"
                      : `${arrivalTimeInMinutes}분`;
                  speak(
                    `${selectedBus.routeNo}번 버스 호출되었습니다. 도착까지 ${arrivalTime} 남았습니다.`,
                  );
                }
              }
            }
            break;
          case "Escape":
            exitVoiceMode();
            speak("음성 모드를 종료합니다.");
            break;
        }
      }
    },
    [
      isVoiceMode,
      isFocusMode,
      startVoiceMode,
      resetInputTimer,
      resetFocusTimer,
      selectNextBus,
      selectPrevBus,
      focusNextBus,
      focusPrevBus,
      handleFocusedBusAction,
      uniqueBuses,
      selectedBusIndex,
      calledBuses,
      handleBusCall,
      removeBusCall,
      speak,
      exitVoiceMode,
      isFirstVoiceInput,
    ],
  );

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (inputTimerRef.current) {
        clearTimeout(inputTimerRef.current);
        inputTimerRef.current = null;
      }
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
      // 컴포넌트 unmount 시 모든 음성 리소스 정리
      if (audioRef1.current) {
        audioRef1.current.pause();
        audioRef1.current = null;
      }
      if (audioRef2.current) {
        audioRef2.current.pause();
        audioRef2.current = null;
      }
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, [handleKeyPress]);

  // 음성 모드 초기 진입 시에는 안내 메시지만 재생
  // 버스 정보는 [+], [-] 버튼 조작 시에만 재생

  if (isReserved) {
    return (
      <ReservationComplete
        reservedBus={reservedBus}
        countdown={countdown}
        onReturn={returnToMain}
      />
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* 음성 모드 인디케이터 */}
      {isVoiceMode && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#007AFF",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0, 122, 255, 0.3)",
            animation: "pulse 2s infinite",
          }}
        >
          🎤 음성 모드
        </div>
      )}

      {/* Fixed Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Header title={stationBusInfo?.stationName || ""} />
      </div>

      {/* Fixed News */}
      <div
        style={{
          position: "fixed",
          top: "80px", // Header 높이 조정
          left: 0,
          right: 0,
          zIndex: 90,
          background: "#ffffff",
        }}
      >
        <News />
      </div>

      {/* Fixed Banner */}
      <div
        style={{
          position: "fixed",
          top: "170px", // News까지의 높이 조정
          left: 0,
          right: 0,
          zIndex: 80,
          background: "#ffffff",
          padding: "10px 20px 0",
        }}
      >
        <img
          src="/banner.png"
          alt=""
          style={{
            width: "100%",
            height: "100px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />
      </div>

      {/* Scrollable Content Area */}
      <div
        id="scrollable-content"
        style={{
          marginTop: "290px", // Header(80) + News(90) + Banner(120) = 290px
          height: "calc(100vh - 290px)",
          overflowY: "auto",
          padding: "20px",
          paddingBottom: "40px", // 하단 여백 추가
        }}
      >
        {/* 키패드 안내 메시지 */}
        {!isVoiceMode && (
          <div
            style={{
              background: "#F0F0F0",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
            }}
          >
            키패드 [0]번: 음성 안내 모드 | [+][-]: 포커스 선택 (3초
            자동해제-테스트) | [Enter]: 호출/취소
          </div>
        )}

        {/* 실시간 버스 도착 정보 */}
        <BusArrivalsList
          stationBusInfo={stationBusInfo}
          calledBuses={calledBuses}
          onBusCall={handleBusCall}
          wsInstance={wsRef.current}
          focusedBusIndex={focusedBusIndex}
          selectedBusIndex={selectedBusIndex}
          isVoiceMode={isVoiceMode}
          isFocusMode={isFocusMode}
          uniqueBuses={uniqueBuses}
        />

        {/* 디버깅용 버스 순서 표시 */}

        {/* 마지막 업데이트 시간 표시 */}
        {stationBusInfo && (
          <LastUpdateTime lastUpdated={stationBusInfo.lastUpdated} />
        )}
      </div>

      {/* 음성 모드용 CSS 애니메이션 */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Home;
