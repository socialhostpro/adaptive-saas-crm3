import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Clock, Phone, Globe, FileText, Calendar, Filter } from 'lucide-react';

interface BotAnalyticsProps {}

interface AnalyticsData {
  website: {
    totalConversations: number;
    leadsGenerated: number;
    resolutionRate: number;
    avgResponseTime: string;
    dailyStats: { date: string; conversations: number; leads: number }[];
  };
  phone: {
    totalCalls: number;
    avgDuration: string;
    successRate: number;
    appointmentsSet: number;
    dailyStats: { date: string; calls: number; duration: number }[];
  };
  forms: {
    formsStarted: number;
    formsCompleted: number;
    completionRate: number;
    avgCompletionTime: string;
    dailyStats: { date: string; started: number; completed: number }[];
  };
}

const BotAnalytics: React.FC<BotAnalyticsProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedBot, setSelectedBot] = useState<'all' | 'website' | 'phone' | 'forms'>('all');

  const analyticsData: AnalyticsData = {
    website: {
      totalConversations: 1247,
      leadsGenerated: 89,
      resolutionRate: 74,
      avgResponseTime: '2.3m',
      dailyStats: [
        { date: '2024-01-15', conversations: 45, leads: 3 },
        { date: '2024-01-16', conversations: 52, leads: 4 },
        { date: '2024-01-17', conversations: 38, leads: 2 },
        { date: '2024-01-18', conversations: 61, leads: 5 },
        { date: '2024-01-19', conversations: 48, leads: 3 },
      ],
    },
    phone: {
      totalCalls: 342,
      avgDuration: '4.2m',
      successRate: 87,
      appointmentsSet: 23,
      dailyStats: [
        { date: '2024-01-15', calls: 12, duration: 4.1 },
        { date: '2024-01-16', calls: 15, duration: 4.5 },
        { date: '2024-01-17', calls: 8, duration: 3.8 },
        { date: '2024-01-18', calls: 18, duration: 4.7 },
        { date: '2024-01-19', calls: 11, duration: 4.0 },
      ],
    },
    forms: {
      formsStarted: 187,
      formsCompleted: 142,
      completionRate: 76,
      avgCompletionTime: '3.2m',
      dailyStats: [
        { date: '2024-01-15', started: 8, completed: 6 },
        { date: '2024-01-16', started: 12, completed: 9 },
        { date: '2024-01-17', started: 6, completed: 4 },
        { date: '2024-01-18', started: 15, completed: 12 },
        { date: '2024-01-19', started: 9, completed: 7 },
      ],
    },
  };

  const renderOverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.website.totalConversations + analyticsData.phone.totalCalls + analyticsData.forms.formsStarted}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Total Interactions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.website.leadsGenerated + analyticsData.phone.appointmentsSet + analyticsData.forms.formsCompleted}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Conversions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {Math.round((analyticsData.website.resolutionRate + analyticsData.phone.successRate + analyticsData.forms.completionRate) / 3)}%
            </p>
            <p className="text-gray-500 dark:text-gray-400">Avg Success Rate</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">3.2m</p>
            <p className="text-gray-500 dark:text-gray-400">Avg Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebsiteStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Globe className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.website.totalConversations}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Total Conversations</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.website.leadsGenerated}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Leads Generated</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.website.resolutionRate}%
            </p>
            <p className="text-gray-500 dark:text-gray-400">Resolution Rate</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.website.avgResponseTime}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Avg Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhoneStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Phone className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.phone.totalCalls}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Total Calls</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.phone.avgDuration}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Avg Duration</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.phone.successRate}%
            </p>
            <p className="text-gray-500 dark:text-gray-400">Success Rate</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.phone.appointmentsSet}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Appointments Set</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.forms.formsStarted}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Forms Started</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.forms.formsCompleted}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Forms Completed</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.forms.completionRate}%
            </p>
            <p className="text-gray-500 dark:text-gray-400">Completion Rate</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {analyticsData.forms.avgCompletionTime}
            </p>
            <p className="text-gray-500 dark:text-gray-400">Avg Completion Time</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => {
    switch (selectedBot) {
      case 'website':
        return renderWebsiteStats();
      case 'phone':
        return renderPhoneStats();
      case 'forms':
        return renderFormStats();
      default:
        return renderOverviewStats();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bot Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor performance across all your bots</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Bots</option>
                <option value="website">Website Chat</option>
                <option value="phone">Phone Bot</option>
                <option value="forms">Form Bot</option>
              </select>
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStats()}

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Interactions</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Chart placeholder - Integration with charting library needed
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Conversion Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Chart placeholder - Integration with charting library needed
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bot Performance Summary</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bot Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Interactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Conversions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Website Chat</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.website.totalConversations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.website.resolutionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.website.avgResponseTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.website.leadsGenerated}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Phone Bot</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.phone.totalCalls}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.phone.successRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.phone.avgDuration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.phone.appointmentsSet}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Form Bot</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.forms.formsStarted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.forms.completionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.forms.avgCompletionTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {analyticsData.forms.formsCompleted}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BotAnalytics;
