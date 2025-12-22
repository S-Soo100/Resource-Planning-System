/**
 * SSE 연결 상태 표시 컴포넌트 (v3.0)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';

interface SSEConnectionStatusProps {
  isConnected: boolean;
  lastHeartbeat?: Date;
}

const SSEConnectionStatus: React.FC<SSEConnectionStatusProps> = ({
  isConnected,
  lastHeartbeat,
}) => {
  const [isStale, setIsStale] = useState(false);

  // Heartbeat 시간 체크 (60초 이상 없으면 연결 불안정)
  useEffect(() => {
    if (!lastHeartbeat) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = (now.getTime() - lastHeartbeat.getTime()) / 1000;
      setIsStale(diff > 60);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastHeartbeat]);

  if (!isConnected) {
    return (
      <Tag icon={<CloseCircleOutlined />} color="error">
        연결 끊김
      </Tag>
    );
  }

  if (isStale) {
    return (
      <Tag icon={<SyncOutlined spin />} color="warning">
        연결 불안정
      </Tag>
    );
  }

  return (
    <Tag icon={<CheckCircleOutlined />} color="success">
      연결됨
    </Tag>
  );
};

export default SSEConnectionStatus;
