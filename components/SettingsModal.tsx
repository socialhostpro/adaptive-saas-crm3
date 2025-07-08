
import React, { useState, useEffect } from 'react';
import { MediaFile, TeamMember, VoiceSettings } from '../types';
import MediaLibraryModal from './MediaLibraryModal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaFiles: MediaFile[];
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}

type Tab = 'profile' | 'notifications' | 'appearance' | 'voice';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, mediaFiles, teamMembers, setTeamMembers }) => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [isMediaLibraryOpen, setMediaLibraryOpen] = useState(false);
    
    const currentUser = teamMembers.find(m => m.id === 'user');

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [currentVoiceSettings, setCurrentVoiceSettings] = useState<VoiceSettings>(currentUser?.voiceSettings || { voiceURI: 'default', rate: 1, pitch: 1 });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
             // Prioritize Google voices
            const sortedVoices = [...availableVoices].sort((a, b) => {
                const aIsGoogle = a.name.toLowerCase().includes('google');
                const bIsGoogle = b.name.toLowerCase().includes('google');
                if (aIsGoogle && !bIsGoogle) return -1;
                if (!aIsGoogle && bIsGoogle) return 1;
                return a.name.localeCompare(b.name);
            });
            setVoices(sortedVoices);
            if (currentVoiceSettings.voiceURI === 'default' && sortedVoices.length > 0) {
                 const defaultGoogleVoice = sortedVoices.find(v => v.name.toLowerCase().includes('google') && v.lang.startsWith('en'));
                 if (defaultGoogleVoice) {
                     setCurrentVoiceSettings(prev => ({...prev, voiceURI: defaultGoogleVoice.voiceURI}));
                 } else if(sortedVoices.length > 0) {
                     setCurrentVoiceSettings(prev => ({...prev, voiceURI: sortedVoices[0].voiceURI}));
                 }
            }
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [currentVoiceSettings.voiceURI]);


    const handleSelectFile = (file: MediaFile) => {
        if (!currentUser) return;
        if (file.type === 'image') {
            const updatedMembers = teamMembers.map(m => m.id === 'user' ? { ...m, avatarUrl: file.url } : m);
            setTeamMembers(updatedMembers);
            setMediaLibraryOpen(false);
        } else {
            alert("Please select an image file for your profile photo.");
        }
    };

    const handleRemovePhoto = () => {
         if (!currentUser) return;
         const defaultAvatar = `https://picsum.photos/seed/user/100/100`;
         const updatedMembers = teamMembers.map(m => m.id === 'user' ? { ...m, avatarUrl: defaultAvatar } : m);
         setTeamMembers(updatedMembers);
    };

    const handleSaveSettings = () => {
        const updatedMembers = teamMembers.map(m => m.id === 'user' ? { ...m, voiceSettings: currentVoiceSettings } : m);
        setTeamMembers(updatedMembers);
        alert('Settings saved!');
        onClose();
    };

    const handleTestVoice = () => {
        if (!currentVoiceSettings) return;
        const utterance = new SpeechSynthesisUtterance("Hello, this is a test of the selected voice settings.");
        const selectedVoice = voices.find(v => v.voiceURI === currentVoiceSettings.voiceURI);
        utterance.voice = selectedVoice || null;
        utterance.rate = currentVoiceSettings.rate;
        utterance.pitch = currentVoiceSettings.pitch;
        window.speechSynthesis.speak(utterance);
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch(activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <img src={currentUser?.avatarUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                                <div className="flex flex-col gap-2">
                                     <button onClick={() => setMediaLibraryOpen(true)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">Change</button>
                                     <button onClick={handleRemovePhoto} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 text-sm font-medium">Remove</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input type="text" id="name" defaultValue={currentUser?.name} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input type="email" id="email" defaultValue={currentUser?.email} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"/>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <label htmlFor="new-task" className="text-sm font-medium text-gray-900 dark:text-gray-200">New task assigned to you</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="new-task" className="sr-only peer" defaultChecked/>
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <label htmlFor="mention" className="text-sm font-medium text-gray-900 dark:text-gray-200">Someone @mentions you</label>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="mention" className="sr-only peer" defaultChecked/>
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                         <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <label htmlFor="invoice-paid" className="text-sm font-medium text-gray-900 dark:text-gray-200">An invoice is paid</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="invoice-paid" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                     <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">Enable Dark Mode</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(prev => !prev)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                );
            case 'voice':
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Voice</label>
                            <select 
                                id="voice-select" 
                                value={currentVoiceSettings.voiceURI} 
                                onChange={e => setCurrentVoiceSettings(prev => ({...prev, voiceURI: e.target.value}))}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                            >
                                {voices.length > 0 ? voices.map(voice => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang}) {voice.default ? '[Default]' : ''}
                                    </option>
                                )) : <option disabled>No voices available</option>}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="rate-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate: <span className="font-bold text-primary-500">{currentVoiceSettings.rate.toFixed(1)}x</span></label>
                            <input type="range" id="rate-slider" min="0.5" max="2" step="0.1" value={currentVoiceSettings.rate} onChange={e => setCurrentVoiceSettings(prev => ({...prev, rate: parseFloat(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 [&::-webkit-slider-thumb]:bg-primary-500"/>
                        </div>
                        <div>
                            <label htmlFor="pitch-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pitch: <span className="font-bold text-primary-500">{currentVoiceSettings.pitch.toFixed(1)}</span></label>
                            <input type="range" id="pitch-slider" min="0" max="2" step="0.1" value={currentVoiceSettings.pitch} onChange={e => setCurrentVoiceSettings(prev => ({...prev, pitch: parseFloat(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 [&::-webkit-slider-thumb]:bg-primary-500"/>
                        </div>
                        <button onClick={handleTestVoice} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Test Voice</button>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                    </header>
                    <div className="flex flex-col md:flex-row flex-grow min-h-0">
                        <nav className="flex-shrink-0 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                            <ul className="flex md:flex-col gap-1">
                                {['profile', 'notifications', 'appearance', 'voice'].map(tab => (
                                    <li key={tab}>
                                        <button onClick={() => setActiveTab(tab as Tab)} className={`capitalize w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                                           {tab.replace('_', ' ')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <main className="flex-grow p-6 overflow-y-auto">
                            {renderContent()}
                        </main>
                    </div>
                    <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="button" onClick={handleSaveSettings} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Save All Settings</button>
                    </footer>
                </div>
            </div>
             <MediaLibraryModal
                isOpen={isMediaLibraryOpen}
                onClose={() => setMediaLibraryOpen(false)}
                mediaFiles={mediaFiles}
                onSelectFile={handleSelectFile}
            />
        </>
    );
};

export default SettingsModal;