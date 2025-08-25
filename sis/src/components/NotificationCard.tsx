import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Avatar
} from '@mui/material';
import { 
  NotificationsActive, 
  LocationOn, 
  AccessTime,
  DirectionsBus
} from '@mui/icons-material';
import { CallNotification } from '../types';

interface NotificationCardProps {
  notification: CallNotification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        border: `2px solid ${getPriorityColor(notification.priority)}`,
        backgroundColor: '#ffffff',
        boxShadow: 3
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar 
              sx={{ 
                bgcolor: getPriorityColor(notification.priority), 
                width: 40, 
                height: 40, 
                mr: 2 
              }}
            >
              <NotificationsActive />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" fontWeight="bold">
                승객 호출 알림
              </Typography>
              <Chip 
                label={notification.priority.toUpperCase()} 
                size="small"
                sx={{ 
                  bgcolor: getPriorityColor(notification.priority),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>

        </Box>

        <Box sx={{ ml: 7 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ mr: 1, color: '#ff4444' }} />
            <Typography variant="body1" fontWeight="bold">
              {notification.busStopName}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <AccessTime sx={{ mr: 1, color: '#666' }} />
            <Typography variant="body2" color="text.secondary">
              {formatTime(notification.timestamp)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <DirectionsBus sx={{ mr: 1, color: '#2196F3' }} />
            <Typography variant="body2" fontWeight="bold" color="primary">
              {notification.stopsRemaining}정류장 남음
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
