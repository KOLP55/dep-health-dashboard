import React, { useState, useRef } from 'react';
import { App as AppType } from '../types';
import AppGrid from '../components/AppGrid';
import { UserIcon } from '../components/icons/UserIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { DashboardIcon } from '../components/icons/DashboardIcon';

interface ProfilePageProps {
  username: string;
  email: string;
  profilePicture: string | null;
  downloadedApps: AppType[];
  onUpdateProfile: (newUsername: string, newPicture: string | null) => void;
  onDownload: (appId: number) => void;
  onNavigateToAdmin: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username, email, profilePicture, downloadedApps, onUpdateProfile, onDownload, onNavigateToAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempPicture, setTempPicture] = useState<string | null>(profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempPicture(e.target?.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleSave = () => {
    onUpdateProfile(tempUsername, tempPicture);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempUsername(username);
    setTempPicture(profilePicture);
    setIsEditing(false);
  };

  const isAdmin = email === 'ayoub.laasry82@gmail.com';

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">ملفك الشخصي</h1>
        <div className="bg-gray-800/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 border border-gray-700/50">
            <div className="relative group">
                {tempPicture || profilePicture ? (
                    <img src={tempPicture || profilePicture!} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 group-hover:border-cyan-500 transition-all" />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                        <UserIcon className="w-16 h-16 text-gray-500" />
                    </div>
                )}
                {isEditing && (
                    <button
                        onClick={() => fileInputRef.current?.click()} 
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <CameraIcon className="w-8 h-8 text-white" />
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePictureChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
            <div className="text-center md:text-right flex-grow">
                {isEditing ? (
                    <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="text-3xl font-bold text-white bg-gray-700 rounded-lg px-3 py-1 mb-2 text-center md:text-right focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                ) : (
                    <h2 className="text-3xl font-bold text-white">{username}</h2>
                )}
                <p className="text-gray-400 mt-1">{email}</p>
                 <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">حفظ التغييرات</button>
                            <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">إلغاء</button>
                        </>
                    ) : (
                        <>
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gray-700 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <EditIcon className="w-5 h-5"/>
                            <span>تعديل الملف الشخصي</span>
                        </button>
                        {isAdmin && (
                            <button onClick={onNavigateToAdmin} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                <DashboardIcon className="w-5 h-5" />
                                <span>لوحة التحكم</span>
                            </button>
                        )}
                        </>
                    )}
                 </div>
            </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">تطبيقاتي</h2>
        {downloadedApps.length > 0 ? (
            <AppGrid apps={downloadedApps} onDownload={onDownload} />
        ) : (
            <div className="text-center py-16 text-gray-500 bg-gray-800/40 rounded-2xl">
                <h3 className="text-2xl font-bold">لم تقم بتنزيل أي تطبيقات بعد</h3>
                <p>استكشف المتجر وابدأ في تنزيل تطبيقاتك المفضلة!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;