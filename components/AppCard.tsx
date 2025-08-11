import React from 'react';
import { App } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { StarIcon } from './icons/StarIcon';

interface AppCardProps {
  app: App;
  onDownload: (appId: number) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onDownload }) => {
  
  const handleDownloadClick = () => {
    onDownload(app.id); // For tracking downloads
    if (app.downloadUrls && app.downloadUrls.length > 0) {
      app.downloadUrls.forEach(url => {
        if (url.trim()) { // Ensure url is not an empty string
          window.open(url, '_blank');
        }
      });
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/20 border border-gray-700/50 transition-all duration-300 ease-in-out transform hover:-translate-y-2 group">
      <div className="p-5 flex flex-col items-center text-center">
        <img
          src={app.iconUrl}
          alt={`${app.name} icon`}
          className="w-24 h-24 rounded-3xl mb-4 shadow-md border-2 border-gray-700 group-hover:border-cyan-500 transition-all"
        />
        <h3 className="text-lg font-bold text-white mb-1 truncate w-full">{app.name}</h3>
        <p className="text-sm text-cyan-400 mb-2">{app.category}</p>
        <div className="flex items-center text-amber-400 mb-4">
          <StarIcon className="w-5 h-5" />
          <span className="ml-1 font-bold">{app.rating}</span>
          <span className="text-gray-400 text-xs mx-2">|</span>
          <span className="text-xs text-gray-400">{app.downloads} تحميل</span>
        </div>
        <button
          onClick={handleDownloadClick}
          className="w-full flex items-center justify-center bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors duration-300 group-hover:bg-cyan-600"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          <span>تحميل</span>
        </button>
      </div>
    </div>
  );
};

export default AppCard;