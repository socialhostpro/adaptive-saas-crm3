

import React, { useState, useMemo } from 'react';
import { Invoice, Payment, InvoiceStatus } from '../types';
import ShareLinkModal from './ShareLinkModal';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    onRecordPayment: (invoiceId: string, payment: Omit<Payment, 'id'>) => void;
}

const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-lg font-semibold rounded-full inline-block";
  let colorClasses = "";
  switch (status) {
    case InvoiceStatus.Paid: colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"; break;
    case InvoiceStatus.Sent: colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"; break;
    case InvoiceStatus.PartiallyPaid: colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"; break;
    case InvoiceStatus.Draft: colorClasses = "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100"; break;
    case InvoiceStatus.Overdue: colorClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"; break;
  }
  return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};


const RecordPaymentForm: React.FC<{ invoice: Invoice; onRecordPayment: (invoiceId: string, payment: Omit<Payment, 'id'>) => void; amountDue: number }> = ({ invoice, onRecordPayment, amountDue }) => {
    const [amount, setAmount] = useState<number>(amountDue);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'Credit Card' | 'Bank Transfer' | 'Other'>('Credit Card');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || amount > amountDue) {
            alert(`Payment amount must be between $0.01 and $${amountDue.toFixed(2)}.`);
            return;
        }
        onRecordPayment(invoice.id, { amount, date, method });
        setAmount(amountDue - amount);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mt-4 space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Record a New Payment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs text-gray-500">Amount</label>
                    <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} max={amountDue} step="0.01" required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
                </div>
                 <div>
                    <label className="text-xs text-gray-500">Payment Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm"/>
                </div>
                 <div>
                    <label className="text-xs text-gray-500">Method</label>
                    <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm">
                        <option>Credit Card</option>
                        <option>Bank Transfer</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="w-full sm:w-auto bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Record Payment</button>
        </form>
    )
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice, onRecordPayment }) => {
    
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');

    const paidAmount = useMemo(() => invoice.payments.reduce((acc, p) => acc + p.amount, 0), [invoice.payments]);
    const amountDue = invoice.totalAmount - paidAmount;

    const handleShare = () => {
        const link = `${window.location.origin}${window.location.pathname}#/public/invoice/${invoice.id}`;
        setShareLink(link);
        setShareModalOpen(true);
    };

    if (!isOpen) return null;

    return (
        <>
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice {invoice.invoiceNumber}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">To: {invoice.contactName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl no-print">&times;</button>
                </header>
                <main className="modal-content-wrapper flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Invoice Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">${invoice.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount Paid</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">${paidAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount Due</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">${amountDue.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    {/* Line Items */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Line Items</h3>
                         <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                <th scope="col" className="px-4 py-2">Description</th>
                                <th scope="col" className="px-4 py-2 text-center">Quantity</th>
                                <th scope="col" className="px-4 py-2 text-right">Unit Price</th>
                                <th scope="col" className="px-4 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoice.lineItems?.map(item => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 last:border-b-0">
                                    <td className="px-4 py-2">{item.description}</td>
                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                    </div>

                    {/* Payment History & Actions */}
                    <div className="no-print">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Payment History</h3>
                        {invoice.payments.length > 0 ? (
                             <ul className="space-y-2">
                                {invoice.payments.map(payment => (
                                    <li key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-green-600">Payment Received</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(payment.date).toLocaleDateString()} via {payment.method}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">+ ${payment.amount.toFixed(2)}</p>
                                    </li>
                                ))}
                             </ul>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No payments recorded yet.</p>
                        )}
                        {amountDue > 0 && <RecordPaymentForm invoice={invoice} onRecordPayment={onRecordPayment} amountDue={amountDue} />}
                    </div>
                </main>
                <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 no-print">
                    <button type="button" onClick={handleShare} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Share Link</button>
                    <button type="button" onClick={() => window.print()} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">Download PDF</button>
                </footer>
            </div>
        </div>
         <ShareLinkModal
            isOpen={isShareModalOpen}
            onClose={() => setShareModalOpen(false)}
            link={shareLink}
        />
        </>
    );
};

export default InvoiceDetailsModal;