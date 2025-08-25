import React from 'react';
import { BusRoute, BusArrival } from '../types';

interface BusArrivalInfoProps {
  mockRoutes: BusRoute[];
  mockArrivals: BusArrival[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  formatTime: (minutes: number) => string;
  calledBuses: Set<string>;
}

const BusArrivalInfo: React.FC<BusArrivalInfoProps> = ({
  mockRoutes,
  mockArrivals,
  currentSlide,
  setCurrentSlide,
  formatTime,
  calledBuses
}) => {
  // 중복 제거된 버스 목록
  const uniqueArrivals = mockArrivals.reduce((unique: BusArrival[], bus) => {
    const existingBus = unique.find(b => b.routeNumber === bus.routeNumber);
    if (!existingBus || bus.arrivalTime < existingBus.arrivalTime) {
      return unique.filter(b => b.routeNumber !== bus.routeNumber).concat(bus);
    }
    return unique;
  }, []);

  return (
    <div>
      <div style={{ 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          transition: 'transform 0.5s ease-in-out',
          transform: `translateX(-${currentSlide * 100}%)`
        }}>
          {Array.from({ length: Math.ceil(uniqueArrivals.length / 4) }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              style={{
                minWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '0 10px',
                boxSizing: 'border-box'
              }}
            >
              {uniqueArrivals
                .slice(slideIndex * 4, (slideIndex + 1) * 4)
                .map((bus, index) => {
                  const isCalled = calledBuses.has(bus.routeNumber.toLowerCase());
                  
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '20px',
                        background: isCalled ? 'linear-gradient(135deg, #fef3c7, #fbbf24)' : 'white',
                        border: isCalled ? '4px solid #f59e0b' : '3px solid #e5e7eb',
                        borderRadius: '16px',
                        boxShadow: isCalled 
                          ? '0 8px 25px rgba(245, 158, 11, 0.25)' 
                          : '0 2px 4px rgba(0,0,0,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* 호출 벨 아이콘 */}
                      {isCalled && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#f59e0b',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '700',
                          animation: 'ring 1s ease-in-out infinite'
                        }}>
                          🔔
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          background: mockRoutes.find(r => r.routeNumber === bus.routeNumber)?.color || '#666',
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '16px',
                          minWidth: '60px',
                          textAlign: 'center'
                        }}>
                          {bus.routeNumber}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', marginBottom: '6px', color: '#111827', fontSize: '16px' }}>
                            {bus.routeName}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                            {bus.busNumber}
                            {bus.busType === 'lowFloor' && ' • 저상버스'}
                            {bus.busType === 'articulated' && ' • 굴절버스'}
                            {bus.isLast && ' • 막차'}
                            {bus.isFull && ' • 만차'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                            {bus.previousStop} → 숙대입구 → {bus.nextStop}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '22px', 
                          fontWeight: '700', 
                          color: bus.arrivalTime <= 3 ? '#dc2626' : '#059669',
                          marginBottom: '2px'
                        }}>
                          {formatTime(bus.arrivalTime)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                          {bus.remainingStops}정거장 전
                        </div>
                      </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        
        {/* 슬라이드 인디케이터 */}
        {uniqueArrivals.length > 4 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px'
          }}>
            {Array.from({ length: Math.ceil(uniqueArrivals.length / 4) }).map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: currentSlide === index ? '#059669' : '#d1d5db',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes ring {
            0%, 100% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BusArrivalInfo;
