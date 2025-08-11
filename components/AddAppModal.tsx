import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { App as AppType, AppCategory } from '../types';
import { CATEGORIES } from '../constants';
import { TrashIcon } from './icons/TrashIcon';

interface AddAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddApp: (newApp: Omit<AppType, 'id' | 'rating' | 'downloads'>) => void;
    onUpdateApp: (updatedApp: AppType) => void;
    appToEdit: AppType | null;
}

const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose, onAddApp, onUpdateApp, appToEdit }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<AppCategory>(CATEGORIES[0]);
    const [iconUrl, setIconUrl] = useState('');
    const [description, setDescription] = useState('');
    const [downloadUrls, setDownloadUrls] = useState<string[]>(['']);

    useEffect(() => {
        if (isOpen) {
            if (appToEdit) {
                setName(appToEdit.name);
                setCategory(appToEdit.category);
                setIconUrl(appToEdit.iconUrl);
                setDescription(appToEdit.description);
                setDownloadUrls(appToEdit.downloadUrls && appToEdit.downloadUrls.length > 0 ? appToEdit.downloadUrls : ['']);
            } else {
                // Reset form when opening for adding a new app
                setName('');
                setCategory(CATEGORIES[0]);
                setIconUrl('');
                setDescription('');
                setDownloadUrls(['']);
            }
        }
    }, [appToEdit, isOpen]);

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...downloadUrls];
        newUrls[index] = value;
        setDownloadUrls(newUrls);
    };

    const handleAddUrl = () => {
        setDownloadUrls([...downloadUrls, '']);
    };

    const handleRemoveUrl = (index: number) => {
        if (downloadUrls.length > 1) {
            const newUrls = downloadUrls.filter((_, i) => i !== index);
            setDownloadUrls(newUrls);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUrls = downloadUrls.filter(url => url.trim() !== '');
        if (finalUrls.length === 0) {
            alert('يرجى تقديم رابط تحميل واحد على الأقل.');
            return;
        }

        const appData = { name, category, iconUrl, description, downloadUrls: finalUrls };

        if (appToEdit) {
            onUpdateApp({ ...appToEdit, ...appData });
        } else {
            onAddApp(appData as Omit<AppType, 'id' | 'rating' | 'downloads'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={appToEdit ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-gray-300 mb-1">اسم التطبيق</label>
                    <input type="text" id="appName" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="appCategory" className="block text-sm font-medium text-gray-300 mb-1">الفئة</label>
                    <select id="appCategory" value={category} onChange={(e) => setCategory(e.target.value as AppCategory)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="appIcon" className="block text-sm font-medium text-gray-300 mb-1">رابط الأيقونة</label>
                    <input type="url" id="appIcon" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label htmlFor="appDescription" className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
                    <textarea id="appDescription" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">روابط التحميل</label>
                    {downloadUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleUrlChange(index, e.target.value)}
                                placeholder="https://example.com/download"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            {downloadUrls.length > 1 && (
                                <button type="button" onClick={() => handleRemoveUrl(index)} className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-gray-600 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddUrl} className="text-sm font-medium text-cyan-400 hover:underline mt-1">
                        + إضافة رابط آخر
                    </button>
                </div>
                <button type="submit" className="w-full bg-cyan-500 text-white hover:bg-cyan-600 font-bold py-2.5 px-4 rounded-lg transition-colors">
                    {appToEdit ? 'حفظ التغييرات' : 'إضافة التطبيق'}
                </button>
            </form>
        </Modal>
    );
};

export default AddAppModal;