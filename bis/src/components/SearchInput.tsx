import React from 'react';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEnterPress: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onEnterPress 
}) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ 
        fontSize: '24px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        버스 번호 검색
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="버스번호를 입력하세요 (예: 150)"
        style={{ 
          padding: '20px 24px', 
          border: '3px solid #d1d5db', 
          borderRadius: '12px',
          fontSize: '24px',
          outline: 'none',
          textAlign: 'center',
          fontWeight: '600',
          width: '100%',
          boxSizing: 'border-box'
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            if (searchTerm.trim()) {
              onEnterPress(searchTerm.trim());
            }
          }
        }}
        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      />
    </div>
  );
};

export default SearchInput;
