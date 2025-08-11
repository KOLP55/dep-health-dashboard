import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import StorePage from './pages/StorePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { APPS as initialApps, CATEGORIES } from './constants';
import { AppCategory, App as AppType } from './types';

const App: React.FC = () => {
  const [apps, setApps] = useState<AppType[]>(initialApps);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'الكل'>('الكل');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [downloadedAppIds, setDownloadedAppIds] = useState<number[]>([]);

  const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);
  const [view, setView] = useState<'store' | 'profile' | 'admin'>('store');

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesCategory = selectedCategory === 'الكل' || app.category === selectedCategory;
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [apps, searchTerm, selectedCategory]);

  const downloadedApps = useMemo(() => {
    return apps.filter(app => downloadedAppIds.includes(app.id));
  }, [apps, downloadedAppIds]);
  
  const handleDownload = (appId: number) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
        alert(`بدء تحميل ${app.name}...`);
        if (!downloadedAppIds.includes(appId)) {
            setDownloadedAppIds(prev => [...prev, appId]);
        }
    }
  };

  const handleLogin = (user: string, userEmail: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setEmail(userEmail);
    setActiveModal(null);
    setView('store'); 
  };

  const handleSignup = (user: string, userEmail: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    setEmail(userEmail);
    setActiveModal(null);
    setView('store');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setEmail(null);
    setProfilePicture(null);
    setDownloadedAppIds([]);
    setView('store');
  };

  const handleUpdateProfile = (newUsername: string, newPicture: string | null) => {
    setUsername(newUsername);
    if(newPicture) {
        setProfilePicture(newPicture);
    }
  };

  const handleAddApp = (newApp: Omit<AppType, 'id' | 'rating' | 'downloads'>) => {
    setApps(prevApps => [
        ...prevApps,
        {
            ...newApp,
            id: Date.now(), // simple unique id
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // random rating 3.0-5.0
            downloads: `${Math.floor(Math.random() * 10)} ألف`
        }
    ]);
  };

  const handleUpdateApp = (updatedApp: AppType) => {
    setApps(prevApps => prevApps.map(app => app.id === updatedApp.id ? updatedApp : app));
  };

  const handleDeleteApp = (appId: number) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا التطبيق؟')) {
        setApps(prevApps => prevApps.filter(app => app.id !== appId));
    }
  };

  const renderPage = () => {
    switch(view) {
        case 'store':
            return <StorePage
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categories={CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                apps={filteredApps}
                onDownload={handleDownload}
            />;
        case 'profile':
            return <ProfilePage
                username={username!}
                email={email!}
                profilePicture={profilePicture}
                downloadedApps={downloadedApps}
                onUpdateProfile={handleUpdateProfile}
                onDownload={handleDownload}
                onNavigateToAdmin={() => setView('admin')}
            />;
        case 'admin':
            return <AdminPage 
                apps={apps}
                onAddApp={handleAddApp}
                onUpdateApp={handleUpdateApp}
                onDeleteApp={handleDeleteApp}
            />;
        default:
            return null;
    }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        isLoggedIn={isLoggedIn}
        username={username}
        onLogout={handleLogout}
        onLoginClick={() => setActiveModal('login')}
        onSignupClick={() => setActiveModal('signup')}
        onProfileClick={() => setView('profile')}
        onStoreClick={() => setView('store')}
        currentView={view}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      <Footer />

      <LoginModal 
        isOpen={activeModal === 'login'}
        onClose={() => setActiveModal(null)}
        onLogin={handleLogin}
        onSwitchToSignup={() => setActiveModal('signup')}
      />

      <SignupModal
        isOpen={activeModal === 'signup'}
        onClose={() => setActiveModal(null)}
        onSignup={handleSignup}
        onSwitchToLogin={() => setActiveModal('login')}
      />
    </div>
  );
};

export default App;