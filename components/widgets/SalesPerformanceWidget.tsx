
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Invoice, InvoiceStatus } from '../../types';

interface SalesPerformanceWidgetProps {
    invoices: Invoice[];
}

const SalesPerformanceWidget: React.FC<SalesPerformanceWidgetProps> = ({ invoices }) => {
    const salesData = useMemo(() => {
        const monthlySales: { [key: string]: number } = {};
        
        invoices
            .filter(inv => inv.status === InvoiceStatus.Paid)
            .forEach(inv => {
                const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
                monthlySales[month] = (monthlySales[month] || 0) + inv.totalAmount;
            });

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const chartData = monthOrder.map(month => ({
            name: month,
            Sales: monthlySales[month] || 0,
        }));
        
        // Find the last month with sales to avoid showing a long flat line at the end of the year
        const lastMonthWithSalesIndex = chartData.map(d => d.Sales > 0).lastIndexOf(true);
        return lastMonthWithSalesIndex > -1 ? chartData.slice(0, lastMonthWithSalesIndex + 1) : [];

    }, [invoices]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Performance</h3>
            <div className="flex-grow">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesPerformanceWidget;
