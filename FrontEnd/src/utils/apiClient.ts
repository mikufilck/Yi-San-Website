import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * 后端 API 客户端配置
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// 记录是否正在处理 401 状态，防止并发请求导致 toast 刷屏
let isUnauthorized = false;

export const getFileUrl = (path: string | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const assetBase = import.meta.env.VITE_ASSET_BASE_URL;
  if (assetBase) {
    return `${assetBase}${path.startsWith('/') ? path : `/${path}`}`;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  if (apiBase.startsWith('http')) {
    const root = apiBase.replace(/\/api\/?$/, '');
    if (import.meta.env.DEV) {
      // 仅在本地开发环境保留路径推导日志
      console.debug("🛠️ [FileUrl] Derived root:", root);
    }
    return `${root}${path.startsWith('/') ? path : `/${path}`}`;
  }

  return path;
};

// 请求拦截器：自动注入鉴权令牌
apiClient.interceptors.request.use(
  (config) => {
    const { url, method } = config;
    const requestUrl = url || '';

    // 排除公开接口
    const publicPaths = ['/auth/login', '/cases/public', '/products/public', '/client/login'];
    const isPublic = publicPaths.some(p => requestUrl.includes(p));

    if (isPublic) return config;

    // 区分业主端与管理端 Token
    const isClientApi = requestUrl.includes('/client/');
    const tokenKey = isClientApi ? 'client_token' : 'auth_token';
    const token = localStorage.getItem(tokenKey);

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token.trim()}`;
      if (import.meta.env.DEV) {
        console.log(`🚀 [API Request] ${method?.toUpperCase()} ${requestUrl}`);
      }
    } else if (import.meta.env.DEV) {
      console.warn(`⚠️ [API Request] No token for: ${requestUrl}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理数据剥离与安全异常
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回后端 Response 中的 data 层
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.detail || '网络连接异常';

    if (status === 401) {
      if (!isUnauthorized) {
        isUnauthorized = true;
        
        const isClientPage = window.location.pathname.startsWith('/client');
        if (isClientPage) {
          localStorage.removeItem('client_token');
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }

        toast.error(msg);
        
        // 延迟跳转，确保用户看清错误提示
        setTimeout(() => {
          window.location.href = isClientPage ? '/client/login' : '/admin/login';
          isUnauthorized = false;
        }, 1500);
      }
    } else {
      toast.error(msg);
    }
    
    return Promise.reject(error);
  }

);
