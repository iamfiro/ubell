import React from 'react';

interface CurrentTimeProps {
  currentTime: Date;
}

const CurrentTime: React.FC<CurrentTimeProps> = ({ currentTime }) => {
  return (
    <div style={{ 
      marginBottom: '32px',
      padding: '20px',
      background: '#f0f9ff',
      border: '3px solid #0ea5e9',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '20px', 
        color: '#0369a1',
        marginBottom: '8px',
        fontWeight: '600'
      }}>
        현재 시각
      </div>
      <div style={{ 
        fontSize: '32px',
        fontWeight: '700',
        color: '#0c4a6e'
      }}>
        {currentTime.toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default CurrentTime;
