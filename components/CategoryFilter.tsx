
import React from 'react';
import { AppCategory } from '../types';

interface CategoryFilterProps {
  categories: AppCategory[];
  selectedCategory: AppCategory | 'الكل';
  onSelectCategory: (category: AppCategory | 'الكل') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  const allCategories = ['الكل', ...categories];

  return (
    <div className="flex justify-center flex-wrap gap-2 md:gap-3">
      {allCategories.map(category => {
        const isSelected = category === selectedCategory;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category as AppCategory | 'الكل')}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
              isSelected 
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
