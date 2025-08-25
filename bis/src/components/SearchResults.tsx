import React from 'react';
import { BusRoute, BusArrival } from '../types';

interface SearchResultsProps {
  filteredRoutes: BusRoute[];
  mockArrivals: BusArrival[];
  searchTerm: string;
  currentSlide: number;
  selectedRoute: BusRoute | null;
  onRouteSelect: (route: BusRoute) => void;
  formatTime: (minutes: number) => string;
  calledBuses: Set<string>;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  filteredRoutes,
  mockArrivals,
  searchTerm,
  currentSlide,
  selectedRoute,
  onRouteSelect,
  formatTime,
  calledBuses
}) => {
  // 검색어 하이라이트 함수
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: 'rgba(255, 235, 59, 0.5)', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };

  if (filteredRoutes.length === 0) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          transition: 'transform 0.5s ease-in-out',
          transform: `translateX(-${currentSlide * 100}%)`
        }}>
          {Array.from({ length: Math.ceil(filteredRoutes.length / 4) }).map((_, slideIndex) => (
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
              {filteredRoutes
                .slice(slideIndex * 4, (slideIndex + 1) * 4)
                .map((route) => {
                  const routeArrivals = mockArrivals.filter(arrival => arrival.routeNumber === route.routeNumber);
                  const nextArrival = routeArrivals.sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
                  const isCalled = calledBuses.has(route.routeNumber.toLowerCase());
                  
                  return routeArrivals.length > 0 ? (
                    <div
                      key={`${route.id}-search`}
                      onClick={() => onRouteSelect(route)}
                      style={{
                        padding: '20px',
                        background: isCalled ? 'linear-gradient(135deg, #fef3c7, #fbbf24)' : 'white',
                        border: isCalled 
                          ? '4px solid #f59e0b' 
                          : selectedRoute?.id === route.id 
                            ? '4px solid #2563eb' 
                            : '3px solid #e5e7eb',
                        borderRadius: '16px',
                        boxShadow: isCalled 
                          ? '0 8px 25px rgba(245, 158, 11, 0.25)' 
                          : '0 2px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
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
                            background: route.color,
                            color: 'white',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '16px',
                            minWidth: '60px',
                            textAlign: 'center'
                          }}>
                            {highlightSearchTerm(route.routeNumber, searchTerm)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', marginBottom: '6px', color: '#111827', fontSize: '16px' }}>
                              {highlightSearchTerm(route.routeName, searchTerm)}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                              다음 버스: {nextArrival.busNumber}
                              {nextArrival.busType === 'lowFloor' && ' • 저상버스'}
                              {nextArrival.busType === 'articulated' && ' • 굴절버스'}
                              {nextArrival.isLast && ' • 막차'}
                              {nextArrival.isFull && ' • 만차'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                              {nextArrival.previousStop} → 숙대입구 → {nextArrival.nextStop}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontSize: '22px', 
                            fontWeight: '700', 
                            color: nextArrival.arrivalTime <= 3 ? '#dc2626' : '#059669',
                            marginBottom: '2px'
                          }}>
                            {formatTime(nextArrival.arrivalTime)}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                            {nextArrival.remainingStops}정거장 전
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={route.id}
                      onClick={() => onRouteSelect(route)}
                      style={{
                        padding: '20px',
                        background: isCalled ? 'linear-gradient(135deg, #fef3c7, #fbbf24)' : 'white',
                        border: isCalled 
                          ? '4px solid #f59e0b' 
                          : selectedRoute?.id === route.id 
                            ? '4px solid #2563eb' 
                            : '3px solid #e5e7eb',
                        borderRadius: '16px',
                        boxShadow: isCalled 
                          ? '0 8px 25px rgba(245, 158, 11, 0.25)' 
                          : '0 2px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          background: route.color,
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '16px',
                          minWidth: '60px',
                          textAlign: 'center'
                        }}>
                          {highlightSearchTerm(route.routeNumber, searchTerm)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', marginBottom: '6px', color: '#111827', fontSize: '16px' }}>
                            {highlightSearchTerm(route.routeName, searchTerm)}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                            {route.company} • 배차간격 {route.interval}분
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
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

export default SearchResults;
