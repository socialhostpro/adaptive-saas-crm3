
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Opportunity, OpportunityStage } from '../../types';

interface SalesPipelineWidgetProps {
    opportunities: Opportunity[];
}

const stageColors: { [key in OpportunityStage]: string } = {
    [OpportunityStage.Prospecting]: '#38bdf8',
    [OpportunityStage.Qualification]: '#60a5fa',
    [OpportunityStage.Proposal]: '#facc15',
    [OpportunityStage.Negotiation]: '#fb923c',
    [OpportunityStage.ClosedWon]: '#4ade80',
    [OpportunityStage.ClosedLost]: '#f87171',
};

const SalesPipelineWidget: React.FC<SalesPipelineWidgetProps> = ({ opportunities }) => {
    const pipelineData = useMemo(() => {
        const stageCounts = opportunities.reduce((acc, op) => {
            acc[op.stage] = (acc[op.stage] || 0) + 1;
            return acc;
        }, {} as Record<OpportunityStage, number>);
        
        const stageOrder = Object.values(OpportunityStage);

        return stageOrder.map(stage => ({
            name: stage.replace('Closed - ', ''), // Shorten name for chart
            value: stageCounts[stage] || 0,
            fill: stageColors[stage],
        }));

    }, [opportunities]);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Pipeline</h3>
             <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} angle={-20} textAnchor="end" height={50}/>
                        <YAxis stroke="#9ca3af" fontSize={12}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                        <Bar dataKey="value" name="Deals" barSize={30} radius={[4, 4, 0, 0]}>
                            {pipelineData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesPipelineWidget;
