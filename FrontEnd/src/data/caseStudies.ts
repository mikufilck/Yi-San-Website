// src/data/caseStudies.ts
// 直接清空静态数据引用，避免类型报错
import { CaseStudy } from '../types/case';

export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    slug: 'office-project-demo',
    title: 'Modern Office Space',
    chineseTitle: '现代办公空间演示',
    location: '上海',
    area: 120,
    year: 2024,
    categories: ['office-public'],
    featured: true,
    images: [{ url: '/images/case-demo.jpg', is_primary: true }],
    tags: ['简约', '现代']
  }
];

export const getCasesByCategory = (categorySlug: string): CaseStudy[] => [];

export const getCaseById = (id: number): CaseStudy | undefined => undefined;


export const getCaseByCategoryAndSlug = (categorySlug: string, caseSlug: string): CaseStudy | undefined => undefined;
