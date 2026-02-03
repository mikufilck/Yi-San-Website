import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import {
  Item,
  GetItemsParams,
  CreateItemRequest,
  UpdateItemRequest,
} from '../types/api';
import { CaseStudy, CaseCategory, CaseStyle, CaseStatus } from '../types/case';

// 统一的分页响应接口
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// --- Cases API Hooks (核心业务) ---

export const useCases = (params: any = {}) => {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: async () => {
      // 这里的 params 会被转换为 ?category=xxx&style=xxx
      const response: any = await apiClient.get('/cases', { params });
      return response; // 已经在 interceptor 里处理了 .data
    }
  });
};

export const useCaseDetail = (id: number | string) => {
  return useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      return apiClient.get<CaseStudy>(`/cases/${id}`);
    },
    enabled: !!id,
  });
};

// --- Items API Hooks (原有逻辑) ---

export const useItems = (params?: GetItemsParams) => {
  return useQuery({
    queryKey: ['items', params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Item>>('/items', { params });
      return response.items;
    },
  });
};

// --- Users API Hooks ---

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // 注意：去掉多余的 /api/，因为 apiClient 已经处理了 baseURL
      return apiClient.get('/users');
    },
  });
};