

import React from 'react';
import { CompanyProfile } from '../types';

interface PublicHeaderProps {
    companyProfile: CompanyProfile;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ companyProfile }) => {
    return (
        <header className="bg-white dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                {companyProfile.logoUrl ? (
                    <img src={companyProfile.logoUrl} alt={`${companyProfile.name} logo`} className="h-8 w-auto mr-4" />
                ) : (
                    <div className="p-2 bg-primary-600 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                )}
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{companyProfile.name}</h1>
            </div>
        </header>
    );
};

export default PublicHeader;