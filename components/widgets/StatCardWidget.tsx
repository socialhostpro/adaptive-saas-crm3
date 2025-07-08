
import React, { useMemo } from 'react';
import { Invoice, Lead, Opportunity, InvoiceStatus, OpportunityStage } from '../../types';

interface StatCardWidgetProps {
    widgetId: string;
    invoices: Invoice[];
    leads: Lead[];
    opportunities: Opportunity[];
}

const formatCompactNumber = (number: number) => {
    if (number > 999999) {
        return `${(number / 1000000).toFixed(1)}m`;
    }
    if (number > 999) {
        return `${(number / 1000).toFixed(1)}k`;
    }
    return String(number);
};

const StatCardWidget: React.FC<StatCardWidgetProps> = ({ widgetId, invoices, leads, opportunities }) => {
    const { title, value, trend, trendColor } = useMemo(() => {
        switch (widgetId) {
            case 'stat-revenue': {
                const totalRevenue = invoices
                    .filter(inv => inv.status === InvoiceStatus.Paid)
                    .reduce((sum, inv) => sum + inv.totalAmount, 0);
                return {
                    title: 'Total Revenue',
                    value: '$' + formatCompactNumber(totalRevenue),
                    trend: 'All time',
                    trendColor: 'text-gray-400',
                };
            }
            case 'stat-leads': {
                const newLeads = leads.length;
                return {
                    title: 'Total Leads',
                    value: String(newLeads),
                    trend: `${leads.filter(l => l.status === 'New').length} new`,
                    trendColor: 'text-gray-400',
                };
            }
            case 'stat-opportunities': {
                const openOpportunities = opportunities.filter(o => o.stage !== OpportunityStage.ClosedWon && o.stage !== OpportunityStage.ClosedLost).length;
                return {
                    title: 'Open Opportunities',
                    value: String(openOpportunities),
                    trend: `${opportunities.length} total deals`,
                    trendColor: 'text-gray-400',
                };
            }
            case 'stat-conversion': {
                 const closedWon = opportunities.filter(o => o.stage === OpportunityStage.ClosedWon).length;
                 const closedLost = opportunities.filter(o => o.stage === OpportunityStage.ClosedLost).length;
                 const totalClosed = closedWon + closedLost;
                 const conversionRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;
                return {
                    title: 'Conversion Rate',
                    value: `${conversionRate.toFixed(1)}%`,
                    trend: `${closedWon} deals won`,
                    trendColor: 'text-green-500',
                };
            }
            default:
                return { title: 'Unknown Stat', value: 'N/A', trend: '', trendColor: '' };
        }
    }, [widgetId, invoices, leads, opportunities]);

    return (
        <div className="h-full flex flex-col justify-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            <p className={`text-sm mt-1 ${trendColor}`}>{trend}</p>
        </div>
    );
};

export default StatCardWidget;
