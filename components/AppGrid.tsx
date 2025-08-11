
import React from 'react';
import { App } from '../types';
import AppCard from './AppCard';

interface AppGridProps {
  apps: App[];
  onDownload: (appId: number) => void;
}

const AppGrid: React.FC<AppGridProps> = ({ apps, onDownload }) => {
  if (apps.length === 0) {
    return <div className="text-center py-16 text-gray-500">
        <h2 className="text-2xl font-bold">لا توجد تطبيقات مطابقة</h2>
        <p>حاول تغيير فلتر البحث أو الفئة.</p>
    </div>;
  }
    
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {apps.map(app => (
        <AppCard key={app.id} app={app} onDownload={onDownload} />
      ))}
    </div>
  );
};

export default AppGrid;