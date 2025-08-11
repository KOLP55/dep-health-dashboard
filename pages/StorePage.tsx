import React from 'react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import AppGrid from '../components/AppGrid';
import { AppCategory, App } from '../types';

interface StorePageProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: AppCategory[];
  selectedCategory: AppCategory | 'الكل';
  onSelectCategory: (category: AppCategory | 'الكل') => void;
  apps: App[];
  onDownload: (appId: number) => void;
}

const StorePage: React.FC<StorePageProps> = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  apps,
  onDownload
}) => {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">اكتشف تطبيقات رائعة</h1>
        <p className="text-lg text-gray-400">ابحث عن أدواتك وألعابك المفضلة وقم بتنزيلها.</p>
      </div>
      
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>
      
      <div className="mb-8">
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </div>

      <AppGrid apps={apps} onDownload={onDownload} />
    </>
  );
};

export default StorePage;