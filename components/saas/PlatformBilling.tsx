

import React from 'react';

interface PlatformBillingProps {
    isConnected: boolean;
    setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlatformBilling: React.FC<PlatformBillingProps> = ({ isConnected, setConnected }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Billing Integration</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect the main Stripe account for charging SaaS subscriptions to your customers.</p>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {isConnected ? (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <StripeIcon />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stripe is Connected</h3>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Account: saas-billing@adaptiverm.com</p>
                        </div>
                        <button onClick={() => setConnected(false)} className="mt-4 md:mt-0 bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-200">Disconnect</button>
                    </div>
                ) : (
                     <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connect to Stripe</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">Click the button below to connect the primary Stripe account for SaaS billing.</p>
                        <button onClick={() => setConnected(true)} className="inline-flex items-center gap-2 bg-[#635BFF] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#554cfa] transition-colors">
                            <StripeIcon />
                            Connect with Stripe
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StripeIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
        <title>Stripe</title>
        <path d="M18.298 12.383c0 2.48-1.72 4.04-4.555 4.04-3.838 0-5.59-2.36-5.59-5.838C8.153 6.91 10.707 5 14.11 5c2.36 0 3.92 1.077 4.595 1.96l-2.04 1.257c-.556-.758-1.398-1.257-2.555-1.257-1.478 0-2.555.957-2.555 2.48H18.3v1.94zM11.95 18.381h2.555V24h-2.55zM0 18.381h2.555V24H0zM4.04 18.381h2.555V24H4.04z" fill="currentColor"/>
    </svg>
);

export default PlatformBilling;
