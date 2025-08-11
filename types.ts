export enum AppCategory {
  Gaming = 'ألعاب',
  Productivity = 'إنتاجية',
  Social = 'تواصل اجتماعي',
  Entertainment = 'ترفيه',
  Education = 'تعليم',
  Health = 'صحة',
}

export interface App {
  id: number;
  name: string;
  category: AppCategory;
  rating: number;
  downloads: string;
  iconUrl: string;
  description: string;
  downloadUrls: string[];
}