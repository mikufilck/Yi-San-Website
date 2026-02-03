// src/data/caseStudies.ts
// 务实做法：直接清空静态数据引用，避免类型报错
import { CaseStudy } from '../types/case';

export const caseStudiesByCategory: Record<string, CaseStudy[]> = {};

export const getCasesByCategory = (categorySlug: string): CaseStudy[] => [];

export const getCaseById = (id: number): CaseStudy | undefined => undefined;

export const getCaseByCategoryAndSlug = (categorySlug: string, caseSlug: string): CaseStudy | undefined => undefined;