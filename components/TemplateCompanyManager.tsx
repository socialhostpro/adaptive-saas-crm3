import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  X, 
  Building2, 
  Search,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { sendGridService } from '../lib/sendgridService';
import { CompanyProfile } from '../types';

interface TemplateCompanyManagerProps {
  templateId: string;
  templateName: string;
  onClose: () => void;
}

const TemplateCompanyManager: React.FC<TemplateCompanyManagerProps> = ({ templateId, templateName, onClose }) => {
  const [assignedCompanies, setAssignedCompanies] = useState<CompanyProfile[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<CompanyProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Mock companies data - in real implementation, this would come from your database
  const mockCompanies: CompanyProfile[] = [
    {
      id: 'comp1',
      name: 'Adaptive Solutions LLC',
      address: '123 Innovation Drive',
      city: 'Techville',
      state: 'CA',
      zip: '94043',
      country: 'USA',
      phone: '555-0199',
      website: 'https://adaptivesolutions.dev',
      logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=sky&shade=500'
    },
    {
      id: 'comp2',
      name: 'Tech Innovations Inc',
      address: '456 Technology Blvd',
      city: 'Silicon Valley',
      state: 'CA',
      zip: '94105',
      country: 'USA',
      phone: '555-0200',
      website: 'https://techinnovations.com',
      logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=blue&shade=500'
    },
    {
      id: 'comp3',
      name: 'Global Enterprises',
      address: '789 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      phone: '555-0300',
      website: 'https://globalenterprises.com',
      logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=green&shade=500'
    },
    {
      id: 'comp4',
      name: 'Creative Studios',
      address: '321 Design Street',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      country: 'USA',
      phone: '555-0400',
      website: 'https://creativestudios.com',
      logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500'
    }
  ];

  useEffect(() => {
    loadCompanyAssignments();
  }, [templateId]);

  const loadCompanyAssignments = async () => {
    setLoading(true);
    setError('');

    try {
      // Get companies assigned to this template
      const result = await sendGridService.getCompaniesForTemplate(templateId);
      
      if (result.success) {
        const assigned = result.companies || [];
        setAssignedCompanies(assigned);
        
        // Filter out assigned companies from available companies
        const assignedIds = new Set(assigned.map(c => c.id));
        const available = mockCompanies.filter(c => !assignedIds.has(c.id));
        setAvailableCompanies(available);
      } else {
        setError(result.error || 'Failed to load company assignments');
        // Fallback to mock data
        setAssignedCompanies([mockCompanies[0]]); // First company assigned by default
        setAvailableCompanies(mockCompanies.slice(1)); // Rest are available
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      // Fallback to mock data
      setAssignedCompanies([mockCompanies[0]]);
      setAvailableCompanies(mockCompanies.slice(1));
    } finally {
      setLoading(false);
    }
  };

  const assignCompany = async (company: CompanyProfile) => {
    if (!company.id) return;
    
    setAssigning(company.id);
    setError('');

    try {
      const result = await sendGridService.assignTemplateToCompany(templateId, company.id, 'custom');
      
      if (result.success) {
        // Move company from available to assigned
        setAssignedCompanies(prev => [...prev, company]);
        setAvailableCompanies(prev => prev.filter(c => c.id !== company.id));
      } else {
        setError(result.error || 'Failed to assign template');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setAssigning(null);
    }
  };

  const unassignCompany = async (company: CompanyProfile) => {
    if (!company.id) return;
    
    setAssigning(company.id);
    setError('');

    try {
      const result = await sendGridService.unassignTemplateFromCompany(templateId, company.id);
      
      if (result.success) {
        // Move company from assigned to available
        setAvailableCompanies(prev => [...prev, company]);
        setAssignedCompanies(prev => prev.filter(c => c.id !== company.id));
      } else {
        setError(result.error || 'Failed to unassign template');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setAssigning(null);
    }
  };

  const filteredAvailableCompanies = availableCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.website.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-900 dark:text-white">Loading company assignments...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Company Access
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Template: <span className="font-medium">{templateName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assigned Companies */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Assigned Companies ({assignedCompanies.length})
              </h4>
              
              {assignedCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No companies assigned</p>
                  <p className="text-sm">This template is not assigned to any companies</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={company.logoUrl || 'https://tailwindui.com/img/logos/mark.svg?color=gray&shade=500'} 
                            alt={company.name} 
                            className="h-8 w-8 rounded"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {company.website}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => unassignCompany(company)}
                          disabled={assigning === company.id}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          title="Remove access"
                        >
                          {assigning === company.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Companies */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Available Companies ({filteredAvailableCompanies.length})
                </h4>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {filteredAvailableCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No companies available</p>
                  <p className="text-sm">
                    {searchTerm ? 'No companies match your search' : 'All companies have access to this template'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailableCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="p-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={company.logoUrl || 'https://tailwindui.com/img/logos/mark.svg?color=gray&shade=500'} 
                            alt={company.name} 
                            className="h-8 w-8 rounded"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {company.website}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => assignCompany(company)}
                          disabled={assigning === company.id}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          title="Grant access"
                        >
                          {assigning === company.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Template access can be modified at any time
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCompanyManager;
