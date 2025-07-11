import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Widget, Activity, Task, TeamMember, Lead, Opportunity, Invoice, AIInsight } from '../types';
import AddWidgetModal from './AddWidgetModal';

import StatCardWidget from './widgets/StatCardWidget';
import SalesPerformanceWidget from './widgets/SalesPerformanceWidget';
import SalesPipelineWidget from './widgets/SalesPipelineWidget';
import RecentActivityWidget from './widgets/RecentActivityWidget';
import MyTasksWidget from './widgets/MyTasksWidget';
import RecentLeadsWidget from './widgets/RecentLeadsWidget';
import AIInsightsWidget from './widgets/AIInsightsWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const widgetComponents: { [key: string]: React.FC<any> } = {
    StatCardWidget,
    SalesPerformanceWidget,
    SalesPipelineWidget,
    RecentActivityWidget,
    MyTasksWidget,
    RecentLeadsWidget,
    AIInsightsWidget,
};

interface DashboardProps {
    allWidgets: Widget[];
    activeWidgetIds: string[];
    layout: Layout[];
    onLayoutChange: (layout: Layout[]) => void;
    addWidget: (widgetId: string) => void;
    removeWidget: (widgetId: string) => void;
    
    // Data props for widgets
    activities: Activity[];
    tasks: Task[];
    teamMembers: TeamMember[];
    leads: Lead[];
    opportunities: Opportunity[];
    invoices: Invoice[];
    aiInsights: AIInsight[];
    generateAIInsights: () => void;
    currentUser?: TeamMember;
    appContext: any;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { allWidgets, activeWidgetIds, layout, onLayoutChange, addWidget, removeWidget, currentUser, appContext, ...dataProps } = props;
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    // Detect mobile view
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeWidgets = allWidgets.filter(w => activeWidgetIds.includes(w.id));
    const currentLayout = layout.filter(l => activeWidgetIds.includes(l.i));

    // Create responsive layouts for different breakpoints
    const responsiveLayouts = {
        lg: currentLayout,
        md: currentLayout.map(item => ({ ...item, w: Math.min(item.w, 8) })),
        sm: currentLayout.map(item => ({ ...item, w: Math.min(item.w, 6) })),
        xs: currentLayout.map(item => ({ ...item, w: 4 })),
        xxs: currentLayout.map(item => ({ ...item, w: 2 }))
    };

    const generateDOM = () => {
        return activeWidgets.map(widget => {
            const WidgetComponent = widgetComponents[widget.component];
            if (!WidgetComponent) {
                return <div key={widget.id} className="bg-red-100 text-red-800 p-4 rounded-xl">Unknown widget type: {widget.component}</div>;
            }
            // Pass all data down, widgets will pick what they need
            const componentProps = { ...dataProps, currentUser, widgetId: widget.id };

            return (
                <div key={widget.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col group">
                    <div className="flex-1 overflow-auto p-4 md:p-6 no-scrollbar">
                        <WidgetComponent {...componentProps} />
                    </div>
                     <button
                        onClick={() => removeWidget(widget.id)}
                        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
                        title="Remove widget"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            );
        });
    };

    React.useEffect(() => {
        console.log('Dashboard component rendered');
    }, []);

    return (
        <div id="crm-container">
            {/* Dashboard header and add widget button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                    Add Widget
                </button>
            </div>
            <ResponsiveGridLayout
                className="layout"
                layouts={responsiveLayouts}
                onLayoutChange={onLayoutChange}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                isDraggable={!isMobile}
                isResizable={!isMobile}
                draggableHandle=".group"
            >
                {generateDOM()}
            </ResponsiveGridLayout>
            <AddWidgetModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                allWidgets={allWidgets}
                activeWidgetIds={activeWidgetIds}
                onAddWidget={addWidget}
            />
        </div>
    );
};

export default Dashboard;