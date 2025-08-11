import React, { useState } from 'react';
import { App as AppType } from '../types';
import { EditIcon } from '../components/icons/EditIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import AddAppModal from '../components/AddAppModal';

interface AdminPageProps {
    apps: AppType[];
    onAddApp: (newApp: Omit<AppType, 'id' | 'rating' | 'downloads'>) => void;
    onUpdateApp: (updatedApp: AppType) => void;
    onDeleteApp: (appId: number) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ apps, onAddApp, onUpdateApp, onDeleteApp }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appToEdit, setAppToEdit] = useState<AppType | null>(null);

    const handleOpenAddModal = () => {
        setAppToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (app: AppType) => {
        setAppToEdit(app);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-white">لوحة تحكم التطبيقات</h1>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-cyan-500 text-white hover:bg-cyan-600 font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    إضافة تطبيق
                </button>
            </div>

            <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-right">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="py-3 px-6 text-sm font-semibold text-gray-300">الأيقونة</th>
                                <th className="py-3 px-6 text-sm font-semibold text-gray-300">اسم التطبيق</th>
                                <th className="py-3 px-6 text-sm font-semibold text-gray-300">الفئة</th>
                                <th className="py-3 px-6 text-sm font-semibold text-gray-300">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {apps.map(app => (
                                <tr key={app.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-xl object-cover" />
                                    </td>
                                    <td className="py-4 px-6 font-medium text-white">{app.name}</td>
                                    <td className="py-4 px-6 text-gray-300">{app.category}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-4">
                                            <button onClick={() => handleOpenEditModal(app)} className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-gray-600">
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => onDeleteApp(app.id)} className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-600">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddAppModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddApp={onAddApp}
                onUpdateApp={onUpdateApp}
                appToEdit={appToEdit}
            />
        </div>
    );
};

export default AdminPage;