// frontend/src/types/api.ts (简化版本)
export enum CaseCategory {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  HOSPITALITY = 'hospitality',
  CULTURAL = 'cultural',
  MIXED_USE = 'mixed_use'
}

export enum FrontendCategory {
  OFFICE_PUBLIC = 'office-public',
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  OLD_BUILDING_RENOVATION = 'old-building-renovation',
  HOTEL_VACATION = 'hotel-vacation',
  EXHIBITION_HALL = 'exhibition-hall'
}

// 分类映射
export const categoryMapping: Record<FrontendCategory, CaseCategory> = {
  [FrontendCategory.OFFICE_PUBLIC]: CaseCategory.OFFICE,
  [FrontendCategory.RESIDENTIAL]: CaseCategory.RESIDENTIAL,
  [FrontendCategory.COMMERCIAL]: CaseCategory.COMMERCIAL,
  [FrontendCategory.OLD_BUILDING_RENOVATION]: CaseCategory.RESIDENTIAL,
  [FrontendCategory.HOTEL_VACATION]: CaseCategory.HOSPITALITY,
  [FrontendCategory.EXHIBITION_HALL]: CaseCategory.CULTURAL,
};

// 添加更多API参数类型
export interface GetItemsParams {
  page?: number;
  size?: number;
  category?: ItemCategory;
  min_price?: number;
  max_price?: number;
}

export interface GetCasesParams {
  page?: number;
  size?: number;
  category?: string;
  categories?: string;
  styles?: string;
  status?: string;
  year_from?: number;
  year_to?: number;
  area_from?: number;
  area_to?: number;
  featured?: boolean;
  search?: string;
}