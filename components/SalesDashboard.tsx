import React, { useMemo } from 'react';
import { useGlobalStore } from '../hooks/useGlobalStore';

const SalesDashboard: React.FC = () => {
  const { timeEntries } = useGlobalStore();

  // Example: Compute totals
  const {
    totalInvoiced,
    totalUnpaid,
    totalTax,
    totalProfit,
    totalLoss,
    topClients
  } = useMemo(() => {
    let totalInvoiced = 0;
    let totalUnpaid = 0;
    let totalTax = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    const clientTotals: Record<string, number> = {};

    timeEntries.forEach(entry => {
      const amount = (entry.duration || 0) * (entry.hourlyRate || 0);
      if (entry.status === 'Invoiced') {
        totalInvoiced += amount;
        // Example: Assume 10% tax rate if not stored per entry
        totalTax += amount * 0.10;
        // Example: Assume 70% profit margin if no cost data
        totalProfit += amount * 0.7;
        totalLoss += amount * 0.3;
        clientTotals[entry.contactName] = (clientTotals[entry.contactName] || 0) + amount;
      } else if (entry.status === 'Unbilled') {
        totalUnpaid += amount;
      }
    });

    // Top 3 clients by invoiced amount
    const topClients = Object.entries(clientTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { totalInvoiced, totalUnpaid, totalTax, totalProfit, totalLoss, topClients };
  }, [timeEntries]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sales Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="font-semibold">Total Invoiced</div>
          <div className="text-2xl">${totalInvoiced.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="font-semibold">Outstanding (Unbilled)</div>
          <div className="text-2xl">${totalUnpaid.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="font-semibold">Total Taxes (est.)</div>
          <div className="text-2xl">${totalTax.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="font-semibold">Profit</div>
          <div className="text-2xl text-green-600">${totalProfit.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="font-semibold">Loss</div>
          <div className="text-2xl text-red-600">${totalLoss.toFixed(2)}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <div className="font-semibold mb-2">Top Clients</div>
        <ul>
          {topClients.map(([client, amount]) => (
            <li key={client}>{client}: ${amount.toFixed(2)}</li>
          ))}
        </ul>
      </div>
      {/* Add more charts/graphs as needed */}
    </div>
  );
};

export default SalesDashboard;
