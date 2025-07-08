

import React, { useState } from 'react';
import { CompanyProfile, TeamMember } from '../types';
import Card from './shared/Card';
import ManageCompanies from './saas/ManageCompanies';
import ManageUsers from './saas/ManageUsers';

interface SystemManagementProps {
    companies: CompanyProfile[];
    users: TeamMember[];
}

type Tab = 'companies' | 'users';

const TABS: { id: Tab, label: string }[] = [
    { id: 'companies', label: 'Companies' },
    { id: 'users', label: 'Users' },
];

const SystemManagement: React.FC<SystemManagementProps> = ({ companies, users }) => {
    const [activeTab, setActiveTab] = useState<Tab>('companies');

    const renderContent = () => {
        switch (activeTab) {
            case 'companies':
                return <ManageCompanies companies={companies} />;
            case 'users':
                return <ManageUsers users={users} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">System Management</h1>
            <div className="flex-grow flex flex-col">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-4">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-primary-600 border-primary-600'
                                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex-grow min-w-0">
                    <Card className="h-full !p-0">
                        {renderContent()}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SystemManagement;
