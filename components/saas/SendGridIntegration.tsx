
import React, { useState } from 'react';
import { SaaSSettings } from '../../types';

interface SendGridIntegrationProps {
    settings: SaaSSettings;
    setSettings: React.Dispatch<React.SetStateAction<SaaSSettings>>;
}

const SendGridIntegration: React.FC<SendGridIntegrationProps> = ({ settings, setSettings }) => {
    const [apiKey, setApiKey] = useState(settings.sendgridApiKey);

    const handleSave = () => {
        setSettings({ ...settings, sendgridApiKey: apiKey });
        alert('SendGrid API Key saved!');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">General Settings</h2>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">SendGrid API Integration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">Provide your SendGrid API key to enable sending automated emails from the platform.</p>
                
                <div>
                    <label htmlFor="sendgrid-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                    <div className="flex items-center gap-2">
                         <input 
                            type="password" 
                            id="sendgrid-key" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="flex-grow w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm"
                         />
                         <button onClick={handleSave} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
                             Save
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendGridIntegration;
