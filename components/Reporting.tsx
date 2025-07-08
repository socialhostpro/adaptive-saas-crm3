import React, { useState, useEffect, useMemo } from 'react';
import Card from './shared/Card';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { Invoice, Opportunity, Task, Activity, ActivityType, TaskStatus, TeamMember, InvoiceStatus, OpportunityStage } from '../types';
import { supabase } from '../lib/supabaseClient';

const COLORS = ['#0ea5e9', '#6366f1', '#f97316', '#14b8a6'];

const formatCompactNumber = (number: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });
    return formatter.format(number).toLowerCase();
};

interface ReportingProps {
    invoices: Invoice[];
    opportunities: Opportunity[];
    tasks: Task[];
    activities: Activity[];
    currentUser?: TeamMember;
    appContext: any;
}

const Reporting: React.FC<Partial<ReportingProps>> = ({ currentUser, appContext }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const [{ data: inv, error: invErr }, { data: opp, error: oppErr }, { data: tsk, error: tskErr }, { data: act, error: actErr }] = await Promise.all([
                supabase.from('invoices').select('*'),
                supabase.from('opportunities').select('*'),
                supabase.from('tasks').select('*'),
                supabase.from('activities').select('*'),
            ]);
            if (invErr || oppErr || tskErr || actErr) {
                setError('Failed to load reporting data');
                setInvoices([]); setOpportunities([]); setTasks([]); setActivities([]);
            } else {
                setInvoices(inv || []);
                setOpportunities(opp || []);
                setTasks(tsk || []);
                setActivities(act || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const summaryStats = useMemo(() => {
        const totalRevenue = invoices.filter(inv => inv.status === InvoiceStatus.Paid).reduce((sum, inv) => sum + inv.totalAmount, 0);
        const dealValues = opportunities.filter(o => o.stage === OpportunityStage.ClosedWon).map(o => o.value);
        const avgDealSize = dealValues.length > 0 ? dealValues.reduce((a, b) => a + b, 0) / dealValues.length : 0;
        const closedWon = opportunities.filter(o => o.stage === OpportunityStage.ClosedWon).length;
        const closedLost = opportunities.filter(o => o.stage === OpportunityStage.ClosedLost).length;
        const totalClosed = closedWon + closedLost;
        const conversionRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;
        const tasksCompleted = tasks.filter(t => t.status === TaskStatus.Completed).length;

        return { totalRevenue, avgDealSize, conversionRate, tasksCompleted };
    }, [invoices, opportunities, tasks]);

    const salesData = useMemo(() => {
        const monthlySales: { [key: string]: number } = {};
        invoices.filter(inv => inv.status === InvoiceStatus.Paid).forEach(inv => {
            const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
            monthlySales[month] = (monthlySales[month] || 0) + inv.totalAmount;
        });

        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const chartData = monthOrder.map(month => ({
            name: month,
            Sales: monthlySales[month] || 0,
        }));
        
        const lastMonthWithSalesIndex = chartData.map(d => d.Sales > 0).lastIndexOf(true);
        return lastMonthWithSalesIndex > -1 ? chartData.slice(0, lastMonthWithSalesIndex + 1) : [];
    }, [invoices]);

    const pipelineData = useMemo(() => {
        const stageCounts = opportunities.reduce((acc, op) => {
            if (op.stage !== OpportunityStage.ClosedWon && op.stage !== OpportunityStage.ClosedLost) {
                acc[op.stage] = (acc[op.stage] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const stageOrder = [OpportunityStage.Prospecting, OpportunityStage.Qualification, OpportunityStage.Proposal, OpportunityStage.Negotiation];

        return stageOrder.map(stage => ({
            name: stage,
            value: stageCounts[stage] || 0,
            fill: COLORS[stageOrder.indexOf(stage) % COLORS.length]
        }));
    }, [opportunities]);
    
    const activityTypeData = useMemo(() => {
        const activityCounts = activities.reduce((acc, activity) => {
            const typeName = ActivityType[activity.type];
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(activityCounts).map(name => ({
            name,
            value: activityCounts[name]
        }));
    }, [activities]);

    const topOpportunities = useMemo(() => {
        return [...opportunities].sort((a,b) => b.value - a.value).slice(0, 5);
    }, [opportunities]);

    if (loading) return <div className="text-center py-4">Loading reports...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Reporting & Analytics</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                 <Card>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${formatCompactNumber(summaryStats.totalRevenue)}</p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Deal Size</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${summaryStats.avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summaryStats.conversionRate.toFixed(1)}%</p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summaryStats.tasksCompleted}/{tasks.length}</p>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Performance</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Pipeline Funnel</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <FunnelChart>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Funnel dataKey="value" data={pipelineData} isAnimationActive>
                                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                                     {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="col-span-1">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Breakdown</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={activityTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                     {activityTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="col-span-1 xl:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Opportunities</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {topOpportunities.map(op => (
                            <li key={op.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{op.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{op.contactName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-primary-500">${op.value.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{op.stage}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
             </div>

        </div>
    );
};

export default Reporting;
