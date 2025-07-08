import React, { useEffect, useState } from 'react';
import { SubscriptionInvoice } from '../../types';
import Card from '../shared/Card';
import { supabase } from '../../lib/supabaseClient';

const SubscriptionManagement: React.FC = () => {
    const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.from('subscription_invoices').select('*').order('date', { ascending: false });
            if (error) {
                setError('Failed to load invoices');
                setInvoices([]);
            } else {
                setInvoices(data || []);
            }
            setLoading(false);
        };
        fetchInvoices();
    }, []);

    if (loading) return <div className="text-center py-4">Loading invoices...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Plan</h2>
                <Card className="!bg-primary-50 dark:!bg-primary-900/30 border border-primary-200 dark:border-primary-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-primary-800 dark:text-primary-200">Pro Plan</h3>
                            <p className="text-primary-600 dark:text-primary-400 font-semibold">$249.00 / month</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Billed monthly. Next payment on August 1, 2024.</p>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <button className="bg-primary-100 text-primary-700 dark:bg-primary-700 dark:text-primary-200 font-semibold px-4 py-2 rounded-lg text-sm">Change Plan</button>
                            <button className="text-red-600 dark:text-red-400 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/30">Cancel Subscription</button>
                        </div>
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Billing History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Download</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                    <td className="px-6 py-4">{new Date(invoice.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.planName} Invoice</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold">${invoice.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <a href="#" className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Download</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
