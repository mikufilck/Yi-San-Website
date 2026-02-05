// src/types/case.ts

// 1. 显式导出 CaseCategory，解决 Uncaught SyntaxError
export type CaseStyle = string;
export type CaseStatus = 'completed' | 'designing' | 'construction';

// 2. 导出旧代码可能引用的 CaseCategory 对象（兼容静态数据）
export const CaseCategoryConstants = {
  RESIDENTIAL: 'residential'，
  OFFICE: 'office-public'，
  COMMERCIAL: 'commercial'
};

export interface Case {
  id: number;
  title: string;
  chinese_title?: string;
  slug: string;
  description?: string;
  categories: string[]; 
  styles: string[];
  location?: string;
  area?: string;
  featured: boolean;
  images: { url: string; caption?: string }[];
  created_at: string;
}

// 3. 极其健壮的 CaseStudy 定义，容纳所有新旧字段
export interface CaseStudy extends Partial<Case> {
  id: number;
  title: string;
  chineseTitle?: string;
  category?: string;
  categories: string[];
  styles: string[];
  status: any;
  标签?: string[];
}

export enum CaseCategory {
  RESIDENTIAL = 'residential'，
  COMMERCIAL = 'commercial'，
  OFFICE = 'office-public'，
  HOSPITALITY = 'hotel-vacation'，
  RENOVATION = 'old-building-renovation'，
  CULTURAL = 'cultural'
}

export interface CaseFilter {
  categories?: string[];
  featured?: boolean;
  search?: string;
}
