import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Estimate, EstimateStatus, Contact, CompanyProfile } from '../types';

const EstimateStatusBadge: React.FC<{ status: EstimateStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-block uppercase tracking-wider";
  let colorClasses = "";
  switch (status) {
    case EstimateStatus.Accepted:
    case EstimateStatus.Invoiced:
        colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
    case EstimateStatus.Sent:
        colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
    case EstimateStatus.Draft:
        colorClasses = "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100"; break;
    case EstimateStatus.Declined:
        colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const PublicEstimatePage: React.FC<{ estimates: Estimate[], setEstimates?: React.Dispatch<React.SetStateAction<Estimate[]>>, contacts: Contact[], companyProfile?: CompanyProfile }> = ({ estimates, setEstimates = () => {}, contacts, companyProfile = { name: '', address: '', city: '', state: '', zip: '', country: '', phone: '', website: '' } }) => {
    const { estimateId } = useParams<{ estimateId: string }>();
    const [estimate, setEstimate] = useState(() => estimates.find(est => est.id === estimateId));
    const contact = contacts.find(c => c.id === estimate?.contactId);

    const handleUpdateStatus = (status: EstimateStatus.Accepted | EstimateStatus.Declined) => {
        if (!estimate) return;

        const updatedEstimate = { ...estimate, status };
        setEstimate(updatedEstimate);

        setEstimates(prevEstimates =>
            prevEstimates.map(est => est.id === estimateId ? updatedEstimate : est)
        );
    };

    if (!estimate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Estimate Not Found</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">The estimate you are looking for does not exist or could not be loaded.</p>
                </div>
            </div>
        );
    }
    
    const isActionable = estimate.status === EstimateStatus.Sent;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
            <main className="py-10">
                <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">ESTIMATE</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{estimate.estimateNumber}</p>
                            <div className="mt-4">
                                <EstimateStatusBadge status={estimate.status} />
                            </div>
                        </div>
                        <div className="text-left sm:text-right mt-4 sm:mt-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{companyProfile.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{companyProfile.address}<br/>{companyProfile.city}, {companyProfile.state} {companyProfile.zip}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-sm font-semibold uppercase text-gray-400 dark:text-gray-500 mb-2">Prepared For</h4>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{contact?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{contact?.company}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{contact?.email}</p>
                        </div>
                        <div className="text-left sm:text-right">
                             <dl className="grid grid-cols-2 gap-x-4">
                                <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Issue Date:</dt>
                                <dd className="text-sm text-gray-800 dark:text-gray-200">{new Date(estimate.issueDate).toLocaleDateString()}</dd>
                                <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Valid Until:</dt>
                                <dd className="text-sm text-gray-800 dark:text-gray-200">{new Date(estimate.expiryDate).toLocaleDateString()}</dd>
                            </dl>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-8">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Description</th>
                                    <th scope="col" className="px-4 py-3 text-center">Qty</th>
                                    <th scope="col" className="px-4 py-3 text-right">Unit Price</th>
                                    <th scope="col" className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {estimate.lineItems?.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.description}</td>
                                        <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">${item.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex justify-end">
                        <dl className="flex justify-between font-bold text-lg w-full max-w-sm">
                            <dt className="text-gray-900 dark:text-white">Estimate Total:</dt>
                            <dd className="text-primary-600 dark:text-primary-500">${estimate.amount.toFixed(2)}</dd>
                        </dl>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 no-print">
                        {isActionable ? (
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ready to proceed?</p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleUpdateStatus(EstimateStatus.Declined)} className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">Decline</button>
                                    <button onClick={() => handleUpdateStatus(EstimateStatus.Accepted)} className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">Accept Estimate</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thank You!</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">This estimate has been {estimate.status.toLowerCase()}. We will be in touch shortly.</p>
                            </div>
                        )}
                    </div>
                     <div className="mt-6 flex justify-end">
                         <button onClick={() => window.print()} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors no-print">Download PDF</button>
                    </div>
                </div>
            </main>
            
            {/* Powered by footer */}
            <footer className="pb-6 no-print">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <span>Powered by</span>
                        <div className="flex items-center gap-1">
                            <div className="p-1 bg-primary-600 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Imagine Capital AI</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicEstimatePage;