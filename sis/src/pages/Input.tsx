import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
} from '@mui/material';
import { DirectionsBus, Stop } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Input: React.FC = () => {
  const [stationId, setStationId] = useState<string>('');
  const [busNumber, setBusNumber] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stationId.trim() && busNumber.trim()) {
      setIsSubmitted(true);
      // 여기에 API 호출 로직을 추가할 수 있습니다
      console.log('정류장 ID:', stationId);
      console.log('버스 번호:', busNumber);
    }
  };

  const handleReset = () => {
    setStationId('');
    setBusNumber('');
    setIsSubmitted(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        justifyContent="center"
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 3,
            }}
          >
            버스 정보 시스템
          </Typography>

          {isSubmitted && (
            <Alert severity="success" sx={{ mb: 3 }}>
              정류장 ID: {stationId}, 버스 번호: {busNumber}로 조회가 완료되었습니다.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="정류장 아이디"
                variant="outlined"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                placeholder="정류장 아이디를 입력하세요"
                InputProps={{
                  startAdornment: (
                    <Stop sx={{ color: 'action.active', mr: 1 }} />
                  ),
                }}
                required
                helperText="예: 123456"
              />

              <TextField
                fullWidth
                label="버스 번호"
                variant="outlined"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="버스 번호를 입력하세요"
                InputProps={{
                  startAdornment: (
                    <DirectionsBus sx={{ color: 'action.active', mr: 1 }} />
                  ),
                }}
                required
                helperText="예: 101, 마을01"
              />

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                  }}
                  disabled={!stationId.trim() || !busNumber.trim()}
                  onClick={() => navigate(`/service?stationId=${stationId}&busNumber=${busNumber}`)}
                >
                  시작하기
                </Button>
                
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={handleReset}
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                  }}
                >
                  초기화
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Input;


