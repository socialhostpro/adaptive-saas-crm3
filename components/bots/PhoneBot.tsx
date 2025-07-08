import React, { useState } from 'react';
import { Phone, Settings, BarChart3, Play, PhoneCall, Clock, TrendingUp, Users } from 'lucide-react';

interface PhoneBotProps {}

interface PhoneBotConfig {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  isActive: boolean;
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
    language: string;
  };
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: { open: string; close: string; enabled: boolean };
    };
  };
  callFlows: {
    greeting: string;
    fallback: string;
    transferMessage: string;
    endCall: string;
  };
  integrations: {
    crm: boolean;
    calendar: boolean;
    sms: boolean;
  };
}

const PhoneBot: React.FC<PhoneBotProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'configure' | 'call-flows' | 'analytics'>('overview');
  
  const [phoneBots] = useState<PhoneBotConfig[]>([
    {
      id: '1',
      name: 'Main Business Line',
      description: 'Primary phone bot for customer inquiries',
      phoneNumber: '+1 (555) 123-4567',
      isActive: true,
      voiceSettings: {
        voice: 'professional-female',
        speed: 1.0,
        pitch: 1.0,
        language: 'en-US',
      },
      businessHours: {
        enabled: true,
        timezone: 'America/New_York',
        schedule: {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
          wednesday: { open: '09:00', close: '17:00', enabled: true },
          thursday: { open: '09:00', close: '17:00', enabled: true },
          friday: { open: '09:00', close: '17:00', enabled: true },
          saturday: { open: '10:00', close: '14:00', enabled: false },
          sunday: { open: '10:00', close: '14:00', enabled: false },
        },
      },
      callFlows: {
        greeting: 'Thank you for calling our company. How can I help you today?',
        fallback: 'I didn\'t quite understand that. Could you please rephrase your question?',
        transferMessage: 'Let me transfer you to one of our team members who can better assist you.',
        endCall: 'Thank you for calling. Have a great day!',
      },
      integrations: {
        crm: true,
        calendar: true,
        sms: false,
      },
    },
  ]);

  const [selectedBot, setSelectedBot] = useState<PhoneBotConfig>(phoneBots[0]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <PhoneCall className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">342</p>
              <p className="text-gray-500 dark:text-gray-400">Total Calls</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">4.2m</p>
              <p className="text-gray-500 dark:text-gray-400">Avg Call Duration</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">87%</p>
              <p className="text-gray-500 dark:text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">23</p>
              <p className="text-gray-500 dark:text-gray-400">Appointments Set</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Bots List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Phone Bots</h3>
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
                  Phone Number
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
              {phoneBots.map((bot) => (
                <tr key={bot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{bot.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{bot.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {bot.phoneNumber}
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
                      <Play className="h-4 w-4" />
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
              Phone Number
            </label>
            <input
              type="text"
              value={selectedBot.phoneNumber}
              onChange={(e) => setSelectedBot({...selectedBot, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice
            </label>
            <select
              value={selectedBot.voiceSettings.voice}
              onChange={(e) => setSelectedBot({
                ...selectedBot, 
                voiceSettings: {...selectedBot.voiceSettings, voice: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="professional-female">Professional Female</option>
              <option value="professional-male">Professional Male</option>
              <option value="friendly-female">Friendly Female</option>
              <option value="friendly-male">Friendly Male</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={selectedBot.voiceSettings.language}
              onChange={(e) => setSelectedBot({
                ...selectedBot, 
                voiceSettings: {...selectedBot.voiceSettings, language: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Business Hours</h4>
          <div className="space-y-3">
            {Object.entries(selectedBot.businessHours.schedule).map(([day, schedule]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-700 dark:text-gray-300 capitalize">{day}</div>
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => setSelectedBot({
                    ...selectedBot,
                    businessHours: {
                      ...selectedBot.businessHours,
                      schedule: {
                        ...selectedBot.businessHours.schedule,
                        [day]: { ...schedule, enabled: e.target.checked }
                      }
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={schedule.open}
                  onChange={(e) => setSelectedBot({
                    ...selectedBot,
                    businessHours: {
                      ...selectedBot.businessHours,
                      schedule: {
                        ...selectedBot.businessHours.schedule,
                        [day]: { ...schedule, open: e.target.value }
                      }
                    }
                  })}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={schedule.close}
                  onChange={(e) => setSelectedBot({
                    ...selectedBot,
                    businessHours: {
                      ...selectedBot.businessHours,
                      schedule: {
                        ...selectedBot.businessHours.schedule,
                        [day]: { ...schedule, close: e.target.value }
                      }
                    }
                  })}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
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

  const renderCallFlows = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Call Flow Configuration</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Greeting Message
            </label>
            <textarea
              value={selectedBot.callFlows.greeting}
              onChange={(e) => setSelectedBot({
                ...selectedBot,
                callFlows: {...selectedBot.callFlows, greeting: e.target.value}
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fallback Message
            </label>
            <textarea
              value={selectedBot.callFlows.fallback}
              onChange={(e) => setSelectedBot({
                ...selectedBot,
                callFlows: {...selectedBot.callFlows, fallback: e.target.value}
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transfer Message
            </label>
            <textarea
              value={selectedBot.callFlows.transferMessage}
              onChange={(e) => setSelectedBot({
                ...selectedBot,
                callFlows: {...selectedBot.callFlows, transferMessage: e.target.value}
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
            Save Call Flows
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Phone Bot Analytics</h3>
        <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Phone className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Phone Bot</h1>
            <p className="text-gray-600 dark:text-gray-400">AI-powered phone answering and appointment booking</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'configure', label: 'Configure', icon: Settings },
            { key: 'call-flows', label: 'Call Flows', icon: Phone },
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
      {activeTab === 'call-flows' && renderCallFlows()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default PhoneBot;
