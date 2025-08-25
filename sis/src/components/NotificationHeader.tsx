import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography,
  Box,
} from '@mui/material';
import { 
  DirectionsBus, 
} from '@mui/icons-material';

const NotificationHeader: React.FC = () => {
  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        <DirectionsBus sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            버스 기사 알림 시스템
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NotificationHeader;
