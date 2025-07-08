
import React from 'react';
import { CompanyProfile } from '../../types';

interface ManageCompaniesProps {
    companies: CompanyProfile[];
}

const ManageCompanies: React.FC<ManageCompaniesProps> = ({ companies }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Company Name</th>
                        <th scope="col" className="px-6 py-3">Website</th>
                        <th scope="col" className="px-6 py-3">Location</th>
                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map(company => (
                        <tr key={company.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                    <img src={company.logoUrl} alt={company.name} className="h-8 w-8 rounded-full bg-gray-200 p-1" />
                                    {company.name}
                                </div>
                            </td>
                            <td className="px-6 py-4">{company.website}</td>
                            <td className="px-6 py-4">{company.city}, {company.state}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Manage</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCompanies;
