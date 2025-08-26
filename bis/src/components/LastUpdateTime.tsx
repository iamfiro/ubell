interface LastUpdateTimeProps {
  lastUpdated: string;
}

function LastUpdateTime({ lastUpdated }: LastUpdateTimeProps) {
  return (
    <div style={{ 
      margin: '20px 0 10px 0', 
      fontSize: '12px', 
      color: '#666',
      textAlign: 'center' 
    }}>
      마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
    </div>
  );
}

export default LastUpdateTime;
