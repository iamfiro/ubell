import React from 'react';

interface ReservationCompleteProps {
  reservedBus: string;
  countdown: number;
  onReturn: () => void;
}

const ReservationComplete: React.FC<ReservationCompleteProps> = ({
  reservedBus,
  countdown,
  onReturn
}) => {
  return (
    <div 
      onClick={onReturn}
      style={{ 
        padding: '40px 20px', 
        background: '#ffffff',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        color: '#111827',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 성공 아이콘 */}
      <div style={{
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 40px auto',
        boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <div style={{
          fontSize: '60px',
          fontWeight: '700',
          color: 'white'
        }}>
          ✓
        </div>
      </div>
      
      <h1 style={{
        fontSize: '48px',
        fontWeight: '800',
        marginBottom: '16px',
        margin: '0 0 16px 0',
        color: '#111827'
      }}>
        호출 완료!
      </h1>
      
      <div style={{
        fontSize: '20px',
        marginBottom: '40px',
        opacity: '0.7',
        fontWeight: '500',
        color: '#6b7280'
      }}>
        버스가 성공적으로 호출되었습니다
      </div>
      
      <div style={{
        marginBottom: '40px'
      }}>
        <div style={{
          fontSize: '18px',
          opacity: '0.6',
          marginBottom: '12px',
          fontWeight: '500',
          color: '#6b7280'
        }}>
          호출된 버스
        </div>
        <div style={{
          fontSize: '56px',
          fontWeight: '800',
          color: '#f59e0b',
          marginBottom: '8px'
        }}>
          {reservedBus}번
        </div>
      </div>
      
      <div style={{
        fontSize: '24px',
        marginBottom: '50px',
        lineHeight: '1.6',
        fontWeight: '500',
        color: '#374151'
      }}>
        곧 도착할 예정입니다<br/>
        잠시만 기다려주세요
      </div>
      
      {/* 카운트다운 */}
      <div style={{
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '64px',
            fontWeight: '800',
            color: '#f59e0b'
          }}>
            {countdown}
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#6b7280'
          }}>
            초 후 자동 복귀
          </div>
        </div>
      </div>
      
      <div style={{
        fontSize: '16px',
        opacity: '0.6',
        fontWeight: '500',
        color: '#9ca3af'
      }}>
        화면을 터치하면 즉시 돌아갑니다
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
};

export default ReservationComplete;
