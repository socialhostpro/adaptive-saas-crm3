import React, { useState, useRef } from 'react';
import { Bot, Globe, Settings, Code, Download, BarChart3, MessageSquare, Users, Clock } from 'lucide-react';

interface WebsiteChatBotProps {}

interface ChatBotConfig {
  id: string;
  name: string;
  description: string;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  welcomeMessage: string;
  isActive: boolean;
  allowedDomains: string[];
  responseStyle: 'friendly' | 'professional' | 'casual';
  language: string;
  collectLeads: boolean;
  integrations: {
    crm: boolean;
    emailMarketing: boolean;
    analytics: boolean;
  };
}

const WebsiteChatBot: React.FC<WebsiteChatBotProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'configure' | 'embed' | 'analytics'>('overview');
  // const [showPreview, setShowPreview] = useState(false);
  
  const [chatBots] = useState<ChatBotConfig[]>([
    {
      id: '1',
      name: 'Main Website Bot',
      description: 'Primary chat bot for company website',
      theme: 'auto',
      primaryColor: '#3B82F6',
      position: 'bottom-right',
      welcomeMessage: 'Hi! How can I help you today?',
      isActive: true,
      allowedDomains: ['example.com', 'www.example.com'],
      responseStyle: 'friendly',
      language: 'en',
      collectLeads: true,
      integrations: {
        crm: true,
        emailMarketing: false,
        analytics: true,
      },
    },
  ]);

  const [selectedBot, setSelectedBot] = useState<ChatBotConfig>(chatBots[0]);
  const embedCodeRef = useRef<HTMLTextAreaElement>(null);

  const generateEmbedCode = (bot: ChatBotConfig) => {
    return `<!-- AI Website Chat Bot - ${bot.name} -->
<script>
  window.aiChatBotConfig = {
    botId: "${bot.id}",
    theme: "${bot.theme}",
    primaryColor: "${bot.primaryColor}",
    position: "${bot.position}",
    welcomeMessage: "${bot.welcomeMessage}",
    language: "${bot.language}",
    responseStyle: "${bot.responseStyle}",
    collectLeads: ${bot.collectLeads}
  };
</script>
<script src="https://your-domain.com/chatbot.js" async></script>`;
  };

  const copyEmbedCode = () => {
    if (embedCodeRef.current) {
      embedCodeRef.current.select();
      document.execCommand('copy');
      // You might want to show a toast notification here
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">1,247</p>
              <p className="text-gray-500 dark:text-gray-400">Total Conversations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">89</p>
              <p className="text-gray-500 dark:text-gray-400">Leads Generated</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">74%</p>
              <p className="text-gray-500 dark:text-gray-400">Resolution Rate</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">2.3m</p>
              <p className="text-gray-500 dark:text-gray-400">Avg Response Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bots List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Website Chat Bots</h3>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Domains
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {chatBots.map((bot) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      bot.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {bot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {bot.allowedDomains.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setSelectedBot(bot)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Configure
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBot(bot);
                        setActiveTab('embed');
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Embed
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
              Theme
            </label>
            <select
              value={selectedBot.theme}
              onChange={(e) => setSelectedBot({...selectedBot, theme: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={selectedBot.primaryColor}
              onChange={(e) => setSelectedBot({...selectedBot, primaryColor: e.target.value})}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position
            </label>
            <select
              value={selectedBot.position}
              onChange={(e) => setSelectedBot({...selectedBot, position: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Welcome Message
          </label>
          <textarea
            value={selectedBot.welcomeMessage}
            onChange={(e) => setSelectedBot({...selectedBot, welcomeMessage: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="mt-6 flex justify-between">
          <div></div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmbedCode = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Embed Code</h3>
          <button
            onClick={copyEmbedCode}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Copy Code
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Copy and paste this code just before the closing &lt;/body&gt; tag of your website:
          </p>
          
          <textarea
            ref={embedCodeRef}
            value={generateEmbedCode(selectedBot)}
            readOnly
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-sm font-mono"
          />
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Make sure your domain is added to the allowed domains list</li>
            <li>• The chat bot will only appear on pages with this embed code</li>
            <li>• Changes to configuration will be reflected automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Chat Bot Analytics</h3>
        <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Globe className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Website Chat Bot</h1>
            <p className="text-gray-600 dark:text-gray-400">Embed AI-powered chat bots on your website</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'configure', label: 'Configure', icon: Settings },
            { key: 'embed', label: 'Embed Code', icon: Code },
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
      {activeTab === 'embed' && renderEmbedCode()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default WebsiteChatBot;
