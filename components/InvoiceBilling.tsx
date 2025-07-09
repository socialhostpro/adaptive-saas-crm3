import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Estimate, EstimateStatus, Contact, Product, Payment, MediaFile } from '../types';
import Card from './shared/Card';
import CreateInvoiceModal from './CreateInvoiceModal';
import CreateEstimateModal from './CreateEstimateModal';
import EditEstimateModal from './EditEstimateModal';
import EditInvoiceModal from './EditInvoiceModal';
import CreateProductModal from './CreateProductModal';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import EditProductModal from './EditProductModal';
import ShareLinkModal from './ShareLinkModal';
import InvoiceEmailModal from './InvoiceEmailModal';
import { supabase } from '../lib/supabaseClient';

interface BillingProps {
    invoices: Invoice[];
    setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>;
    estimates: Estimate[];
    setEstimates?: React.Dispatch<React.SetStateAction<Estimate[]>>;
    products: Product[];
    setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
    contacts: Contact[];
    mediaFiles: MediaFile[];
    appContext: any;
}

const getAmountDue = (invoice: Invoice) => {
    const paidAmount = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
    return invoice.totalAmount - paidAmount;
};

const InvoiceStatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
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

const EstimateStatusBadge: React.FC<{ status: EstimateStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
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

const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.875-5.929l-4.94-2.47a3.027 3.027 0 00-.002-2.223l4.94-2.47A3 3 0 0015 8z" /></svg>;


type Tab = 'invoices' | 'estimates' | 'products';

const Billing: React.FC<BillingProps> = (props) => {
  const {
    invoices,
    setInvoices = () => {},
    estimates,
    setEstimates = () => {},
    products,
    setProducts = () => {},
    contacts,
    mediaFiles,
    appContext
  } = props;

    const [activeTab, setActiveTab] = useState<Tab>('invoices');
    const [isCreateInvoiceOpen, setCreateInvoiceOpen] = useState(false);
    const [isCreateEstimateOpen, setCreateEstimateOpen] = useState(false);
    const [isCreateProductOpen, setCreateProductOpen] = useState(false);
    const [isInvoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isEditProductOpen, setEditProductOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditEstimateOpen, setEditEstimateOpen] = useState(false);
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
    const [isEditInvoiceOpen, setEditInvoiceOpen] = useState(false);
    const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
    const [emailEstimate, setEmailEstimate] = useState<Estimate | null>(null);

    const handleShare = (type: 'invoice' | 'estimate', id: string) => {
        const link = `${window.location.origin}${window.location.pathname}#/public/${type}/${id}`;
        setShareLink(link);
        setShareModalOpen(true);
    };

    const handleCreateInvoice = (newInvoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
        const newInvoice: Invoice = {
            ...newInvoiceData,
            id: `inv${invoices.length + 1}`,
            invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        };
        setInvoices(prev => [newInvoice, ...prev]);
        setCreateInvoiceOpen(false);
    };
    
    const handleCreateEstimate = async (newEstimateData: Omit<Estimate, 'id' | 'estimateNumber' | 'amount'>) => {
        setLoading(true);
        setError(null);
        const totalAmount = newEstimateData.lineItems?.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) || 0;
        const insertData = {
            ...newEstimateData,
            amount: totalAmount
        };
        const { data, error: insertError } = await supabase.from('estimates').insert([insertData]).select();
        if (insertError) {
            setError('Failed to create estimate');
        } else if (data && data[0]) {
            setEstimates(prev => [data[0], ...prev]);
            setCreateEstimateOpen(false);
        }
        setLoading(false);
    };

    const handleCreateProduct = async (newProductData: Omit<Product, 'id'>) => {
        setLoading(true);
        setError(null);
        const { data, error: insertError } = await supabase.from('products').insert([newProductData]).select();
        if (insertError) {
            setError('Failed to create product');
        } else if (data && data[0]) {
            setProducts(prev => [data[0], ...prev]);
            setCreateProductOpen(false);
        }
        setLoading(false);
    };

    const handleUpdateProduct = async (updatedProduct: Product) => {
        setLoading(true);
        setError(null);
        const { data, error: updateError } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id).select();
        if (updateError) {
            setError('Failed to update product');
        } else if (data && data[0]) {
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data[0] : p));
            setEditProductOpen(false);
            setSelectedProduct(null);
        }
        setLoading(false);
    };

    const handleUpdateEstimate = async (updatedEstimate: Estimate) => {
        setLoading(true);
        setError(null);
        const { data, error: updateError } = await supabase.from('estimates').update(updatedEstimate).eq('id', updatedEstimate.id).select();
        if (updateError) {
            setError('Failed to update estimate');
        } else if (data && data[0]) {
            setEstimates(prev => prev.map(e => e.id === updatedEstimate.id ? data[0] : e));
        }
        setLoading(false);
    };

    const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
        setLoading(true);
        setError(null);
        const { data, error: updateError } = await supabase.from('invoices').update(updatedInvoice).eq('id', updatedInvoice.id).select();
        if (updateError) {
            setError('Failed to update invoice');
        } else if (data && data[0]) {
            setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? data[0] : i));
        }
        setLoading(false);
    };

    const handleDeleteEstimate = async (estimateId: string) => {
        setLoading(true);
        setError(null);
        const { error: deleteError } = await supabase.from('estimates').delete().eq('id', estimateId);
        if (deleteError) {
            setError('Failed to delete estimate');
        } else {
            setEstimates(prev => prev.filter(e => e.id !== estimateId));
        }
        setLoading(false);
    };

    const handleConvertEstimateToInvoice = (estimate: Estimate) => {
        if (estimate.status !== EstimateStatus.Accepted) {
            alert("Only accepted estimates can be converted to an invoice.");
            return;
        }

        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
            contactId: estimate.contactId,
            contactName: estimate.contactName,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lineItems: estimate.lineItems,
            totalAmount: estimate.amount,
            status: InvoiceStatus.Draft,
            payments: [],
        };

        setInvoices(prev => [newInvoice, ...prev]);
        setEstimates(prev => prev.map(e => e.id === estimate.id ? { ...e, status: EstimateStatus.Invoiced } : e));
        setActiveTab('invoices');
    }

    const handleOpenInvoiceDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setInvoiceDetailsOpen(true);
    };

    // New handlers for viewing and emailing documents
    const handleViewInvoice = (invoice: Invoice) => {
        // Open invoice in new tab or modal
        const invoiceUrl = `${window.location.origin}${window.location.pathname}#/public/invoice/${invoice.id}`;
        window.open(invoiceUrl, '_blank');
    };

    const handleViewEstimate = (estimate: Estimate) => {
        // Open estimate in new tab or modal
        const estimateUrl = `${window.location.origin}${window.location.pathname}#/public/estimate/${estimate.id}`;
        window.open(estimateUrl, '_blank');
    };

    const handleEmailInvoice = (invoice: Invoice) => {
        setEmailInvoice(invoice);
        setEmailEstimate(null);
        setEmailModalOpen(true);
    };

    const handleEmailEstimate = (estimate: Estimate) => {
        setEmailEstimate(estimate);
        setEmailInvoice(null);
        setEmailModalOpen(true);
    };

    const handleCloseEmailModal = () => {
        setEmailModalOpen(false);
        setEmailInvoice(null);
        setEmailEstimate(null);
    };
    
    const handleRecordPayment = (invoiceId: string, payment: Omit<Payment, 'id'>) => {
        setInvoices(prevInvoices => prevInvoices.map(inv => {
            if (inv.id === invoiceId) {
                const updatedInvoice = {
                    ...inv,
                    payments: [...inv.payments, { ...payment, id: `pay${Date.now()}`}]
                };
                const amountDue = getAmountDue(updatedInvoice);
                if (amountDue <= 0) {
                    updatedInvoice.status = InvoiceStatus.Paid;
                } else if (amountDue < updatedInvoice.totalAmount) {
                    updatedInvoice.status = InvoiceStatus.PartiallyPaid;
                }
                // Update selected invoice in modal as well
                setSelectedInvoice(updatedInvoice);
                return updatedInvoice;
            }
            return inv;
        }));
    };

    const commonTabClass = "px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none";
    const activeTabClass = "bg-primary-600 text-white";
    const inactiveTabClass = "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700";

  const renderHeaderButton = () => {
    switch(activeTab) {
        case 'invoices':
            return <button onClick={() => setCreateInvoiceOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2 self-end md:self-auto">Create Invoice</button>;
        case 'estimates':
            return <button onClick={() => setCreateEstimateOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2 self-end md:self-auto">Create Estimate</button>;
        case 'products':
            return <button onClick={() => setCreateProductOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2 self-end md:self-auto">Add Product</button>;
        default:
            return null;
    }
  }

  return (
    <>
      {loading && <div className="text-center py-2 text-sm text-gray-500">Saving...</div>}
      {error && <div className="text-center py-2 text-sm text-red-500">{error}</div>}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
          </div>
          {renderHeaderButton()}
        </div>

        <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex space-x-1 max-w-md">
                  <button onClick={() => setActiveTab('invoices')} className={`${commonTabClass} w-full ${activeTab === 'invoices' ? activeTabClass : inactiveTabClass}`}>Invoices</button>
                  <button onClick={() => setActiveTab('estimates')} className={`${commonTabClass} w-full ${activeTab === 'estimates' ? activeTabClass : inactiveTabClass}`}>Estimates</button>
                  <button onClick={() => setActiveTab('products')} className={`${commonTabClass} w-full ${activeTab === 'products' ? activeTabClass : inactiveTabClass}`}>Products & Services</button>
              </div>
          </div>

        <Card className="!p-0">
          <div className="overflow-x-auto">
              {activeTab === 'invoices' && (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th scope="col" className="px-6 py-3">Invoice #</th>
                          <th scope="col" className="px-6 py-3">Contact</th>
                          <th scope="col" className="px-6 py-3">Total</th>
                          <th scope="col" className="px-6 py-3">Amount Due</th>
                          <th scope="col" className="px-6 py-3">Due Date</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3 text-right">Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {invoices.map((invoice) => (
                          <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  <button
                                      onClick={() => handleViewInvoice(invoice)}
                                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:underline font-medium"
                                      title="Click to view invoice"
                                  >
                                      {invoice.invoiceNumber}
                                  </button>
                              </th>
                              <td className="px-6 py-4 whitespace-nowrap">{invoice.contactName}</td>
                              <td className="px-6 py-4">${invoice.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">${getAmountDue(invoice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4"><InvoiceStatusBadge status={invoice.status} /></td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => handleEmailInvoice(invoice)} className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Email Invoice">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                          </svg>
                                      </button>
                                      <button onClick={() => handleShare('invoice', invoice.id)} className="text-gray-400 hover:text-primary-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Share"><ShareIcon /></button>
                                      <button onClick={() => { setSelectedInvoiceForEdit(invoice); setEditInvoiceOpen(true); }} className="text-primary-600 hover:underline">Edit</button>
                                      <button onClick={() => handleOpenInvoiceDetails(invoice)} className="text-gray-400 hover:text-primary-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="View Details">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              )}
               {activeTab === 'estimates' && (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th scope="col" className="px-6 py-3">Estimate #</th>
                          <th scope="col" className="px-6 py-3">Contact</th>
                          <th scope="col" className="px-6 py-3">Amount</th>
                          <th scope="col" className="px-6 py-3">Expiry Date</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3 text-right">Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {estimates.map((estimate) => (
                          <tr key={estimate.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  <button
                                      onClick={() => handleViewEstimate(estimate)}
                                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:underline font-medium"
                                      title="Click to view estimate"
                                  >
                                      {estimate.estimateNumber}
                                  </button>
                              </th>
                              <td className="px-6 py-4 whitespace-nowrap">{estimate.contactName}</td>
                              <td className="px-6 py-4">${estimate.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(estimate.expiryDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4"><EstimateStatusBadge status={estimate.status} /></td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      {estimate.status === EstimateStatus.Accepted && <button onClick={() => handleConvertEstimateToInvoice(estimate)} className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200">Convert to Invoice</button>}
                                      <button onClick={() => handleEmailEstimate(estimate)} className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Email Estimate">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                          </svg>
                                      </button>
                                      <button onClick={() => handleShare('estimate', estimate.id)} className="text-gray-400 hover:text-primary-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Share"><ShareIcon /></button>
                                      <button onClick={() => { setSelectedEstimate(estimate); setEditEstimateOpen(true); }} className="text-primary-600 hover:underline">Edit</button>
                                      <button onClick={() => handleDeleteEstimate(estimate.id)} className="text-red-600 hover:underline">Delete</button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              )}
               {activeTab === 'products' && (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th scope="col" className="px-6 py-3">Product/Service</th>
                          <th scope="col" className="px-6 py-3">Description</th>
                          <th scope="col" className="px-6 py-3 text-right">Price</th>
                          <th scope="col" className="px-6 py-3 text-right">Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {products.map((product) => (
                          <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.name}</th>
                              <td className="px-6 py-4">{product.description}</td>
                              <td className="px-6 py-4 text-right">${product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-6 py-4 text-right">
                                  <button onClick={() => { setSelectedProduct(product); setEditProductOpen(true); }} className="text-primary-600 hover:underline">Edit</button>
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              )}
          </div>
        </Card>
      </div>
      <CreateInvoiceModal isOpen={isCreateInvoiceOpen} onClose={() => setCreateInvoiceOpen(false)} onSubmit={handleCreateInvoice} contacts={contacts} products={products} />
      <CreateEstimateModal isOpen={isCreateEstimateOpen} onClose={() => setCreateEstimateOpen(false)} onSubmit={handleCreateEstimate} contacts={contacts} products={products} />
      <CreateProductModal isOpen={isCreateProductOpen} onClose={() => setCreateProductOpen(false)} onSubmit={handleCreateProduct} mediaFiles={mediaFiles} />
      {selectedInvoice && <InvoiceDetailsModal isOpen={isInvoiceDetailsOpen} onClose={() => setInvoiceDetailsOpen(false)} invoice={selectedInvoice} onRecordPayment={handleRecordPayment}/>}
      {selectedProduct && <EditProductModal isOpen={isEditProductOpen} onClose={() => setEditProductOpen(false)} onSubmit={handleUpdateProduct} product={selectedProduct} mediaFiles={mediaFiles} />}
      {selectedEstimate && isEditEstimateOpen && (
        <EditEstimateModal
          isOpen={isEditEstimateOpen}
          onClose={() => setEditEstimateOpen(false)}
          estimate={selectedEstimate}
          onSubmit={handleUpdateEstimate}
        />
      )}
      {selectedInvoiceForEdit && isEditInvoiceOpen && (
        <EditInvoiceModal
          isOpen={isEditInvoiceOpen}
          onClose={() => setEditInvoiceOpen(false)}
          invoice={selectedInvoiceForEdit}
          onSubmit={handleUpdateInvoice}
          contacts={contacts}
        />
      )}
      <ShareLinkModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} link={shareLink} />
      
      {/* Invoice/Estimate Email Modal */}
      <InvoiceEmailModal
        isOpen={isEmailModalOpen}
        onClose={handleCloseEmailModal}
        invoice={emailInvoice || undefined}
        estimate={emailEstimate || undefined}
        contacts={contacts}
        onViewDocument={() => {
          if (emailInvoice) {
            handleViewInvoice(emailInvoice);
          } else if (emailEstimate) {
            handleViewEstimate(emailEstimate);
          }
        }}
      />
    </>
  );
};

export default Billing;
