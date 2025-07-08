
import React from 'react';
import { AIInsight } from '../../types';

interface AIInsightsWidgetProps {
    aiInsights: AIInsight[];
    generateAIInsights: () => void;
}

const getPriorityStyles = (priority: AIInsight['priority']) => {
    switch(priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
    }
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ aiInsights, generateAIInsights }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                <button onClick={generateAIInsights} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Refresh Insights">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M5.5 9.5a7 7 0 112.5 5.5" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow space-y-3">
                {aiInsights.map(insight => (
                     <div key={insight.id} className="flex items-start gap-3">
                        <div className={`mt-1.5 flex-shrink-0 h-2 w-2 rounded-full ${getPriorityStyles(insight.priority)}`} title={`Priority: ${insight.priority}`}></div>
                        <p className="text-sm text-gray-800 dark:text-gray-200"><span className="mr-2">{insight.emoji}</span>{insight.text}</p>
                    </div>
                ))}
                {aiInsights.length === 0 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
                        <p>No new insights. Click refresh to check again.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInsightsWidget;