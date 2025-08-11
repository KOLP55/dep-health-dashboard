import React from 'react';
import { UserIcon } from './icons/UserIcon';

const CubeIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

interface HeaderProps {
    isLoggedIn: boolean;
    username: string | null;
    currentView: 'store' | 'profile' | 'admin';
    onLogout: () => void;
    onLoginClick: () => void;
    onSignupClick: () => void;
    onProfileClick: () => void;
    onStoreClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, currentView, onLogout, onLoginClick, onSignupClick, onProfileClick, onStoreClick }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg shadow-cyan-500/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onStoreClick} className="flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-1">
             <CubeIcon className="h-8 w-8 text-cyan-400" />
            <span className="font-bold text-2xl text-white ml-3">متجر التطبيقات</span>
          </button>
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {(currentView === 'profile' || currentView === 'admin') && (
                     <button 
                        onClick={onStoreClick} 
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        العودة للمتجر
                    </button>
                )}
                <button 
                  onClick={onProfileClick}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                    <UserIcon className="h-6 w-6 text-gray-300" />
                    <span className="text-white font-medium">{username}</span>
                </button>
                <button 
                  onClick={onLogout} 
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <>
                <button onClick={onLoginClick} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">تسجيل الدخول</button>
                <button onClick={onSignupClick} className="bg-cyan-500 text-white hover:bg-cyan-600 px-4 py-2 rounded-md text-sm font-bold ml-4">إنشاء حساب</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;