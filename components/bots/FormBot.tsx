import React, { useState } from 'react';
import { FileText, Settings, BarChart3, Bot, MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';

interface FormBotProps {}

interface FormBotConfig {
  id: string;
  name: string;
  description: string;
  formId: string;
  isActive: boolean;
  conversationStyle: 'casual' | 'professional' | 'friendly';
  collectData: {
    name: boolean;
    email: boolean;
    phone: boolean;
    company: boolean;
    customFields: { name: string; type: string; required: boolean }[];
  };
  followUpActions: {
    sendEmail: boolean;
    createLead: boolean;
    scheduleCallback: boolean;
    addToNewsletter: boolean;
  };
  integrations: {
    crm: boolean;
    emailMarketing: boolean;
    calendar: boolean;
  };
}

const FormBot: React.FC<FormBotProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'configure' | 'forms' | 'analytics'>('overview');
  
  const [formBots] = useState<FormBotConfig[]>([
    {
      id: '1',
      name: 'Lead Qualification Bot',
      description: 'Conversational form for qualifying potential customers',
      formId: 'lead-qual-001',
      isActive: true,
      conversationStyle: 'professional',
      collectData: {
        name: true,
        email: true,
        phone: true,
        company: true,
        customFields: [
          { name: 'budget', type: 'number', required: true },
          { name: 'timeline', type: 'select', required: true },
          { name: 'current_solution', type: 'text', required: false },
        ],
      },
      followUpActions: {
        sendEmail: true,
        createLead: true,
        scheduleCallback: false,
        addToNewsletter: true,
      },
      integrations: {
        crm: true,
        emailMarketing: true,
        calendar: false,
      },
    },
  ]);

  const [selectedBot, setSelectedBot] = useState<FormBotConfig>(formBots[0]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">187</p>
              <p className="text-gray-500 dark:text-gray-400">Forms Started</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">142</p>
              <p className="text-gray-500 dark:text-gray-400">Forms Completed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">76%</p>
              <p className="text-gray-500 dark:text-gray-400">Completion Rate</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">3.2m</p>
              <p className="text-gray-500 dark:text-gray-400">Avg Completion Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Bots List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Form Bots</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Create New Bot
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bot Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Form ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {formBots.map((bot) => (
                <tr key={bot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bot className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{bot.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{bot.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {bot.formId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      bot.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {bot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setSelectedBot(bot)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Configure
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Preview
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Bot Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bot Name
            </label>
            <input
              type="text"
              value={selectedBot.name}
              onChange={(e) => setSelectedBot({...selectedBot, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conversation Style
            </label>
            <select
              value={selectedBot.conversationStyle}
              onChange={(e) => setSelectedBot({...selectedBot, conversationStyle: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Data Collection</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(selectedBot.collectData).filter(([key]) => key !== 'customFields').map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => setSelectedBot({
                    ...selectedBot,
                    collectData: { ...selectedBot.collectData, [key]: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Follow-up Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(selectedBot.followUpActions).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSelectedBot({
                    ...selectedBot,
                    followUpActions: { ...selectedBot.followUpActions, [key]: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Form Management</h3>
        <p className="text-gray-600 dark:text-gray-400">Form builder integration coming soon...</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Form Bot Analytics</h3>
        <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Bot</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered conversational forms for better data collection</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'configure', label: 'Configure', icon: Settings },
            { key: 'forms', label: 'Forms', icon: FileText },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'configure' && renderConfiguration()}
      {activeTab === 'forms' && renderForms()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default FormBot;
