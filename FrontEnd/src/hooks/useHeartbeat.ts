import { useEffect } from 'react';
import { apiClient } from '../utils/apiClient'; // 使用封装好的客户端

export const useHeartbeat = (isLoggedIn: boolean) => {
  useEffect(() => {
    if (!isLoggedIn) return;

    const pulse = () => {
      // 使用 apiClient 以确保带上 Token
      // 备注：如果 Token 过期导致 401，apiClient 的拦截器会处理自动登出
      apiClient.get('/auth/me').catch(() => {
          if (import.meta.env.DEV) {
              console.debug("💓 Heartbeat silent failure (expected if logged out)");
          }
      });
    };

    pulse(); 
    const timer = setInterval(pulse, 60000); 

    return () => clearInterval(timer);
  }, [isLoggedIn]);
};