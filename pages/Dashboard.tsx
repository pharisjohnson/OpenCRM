import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileJson,
  ChevronDown 
} from 'lucide-react';
import { MOCK_DEALS } from '../constants';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const totalPipeline = MOCK_DEALS.reduce((acc, deal) => acc + deal.value, 0);

  const handleDownload = (format: 'csv' | 'json' | 'pdf') => {
    setIsDownloadOpen(false);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `opencrm_report_${timestamp}`;

    if (format === 'csv') {
      // Generate CSV content from Deals
      const headers = ['ID', 'Title', 'Value', 'Stage', 'Probability', 'Close Date'];
      const rows = MOCK_DEALS.map(d => [d.id, d.title, d.value, d.stage, d.probability, d.expectedCloseDate]);
      const csvContent = [
        headers.join(','), 
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
    } else if (format === 'json') {
      // Generate JSON
      const jsonContent = JSON.stringify({ summary: { totalPipeline }, deals: MOCK_DEALS, chartData: data }, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
    } else {
      // Simulate PDF
      alert("Generating PDF Report... (This would be handled by a backend service in production)");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Download Report
            <ChevronDown size={16} />
          </button>

          {isDownloadOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDownloadOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 text-sm animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => handleDownload('csv')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  Export as CSV
                </button>
                <button 
                  onClick={() => handleDownload('json')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileJson size={16} className="text-orange-600" />
                  Export as JSON
                </button>
                <button 
                  onClick={() => handleDownload('pdf')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-red-600" />
                  Export as PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value="$124,500" 
          subtext="+12.5% from last month" 
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Active Leads" 
          value="45" 
          subtext="12 new this week" 
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard 
          title="Pipeline Value" 
          value={`$${(totalPipeline / 1000000).toFixed(1)}M`} 
          subtext="3 major deals pending" 
          icon={Briefcase}
          color="bg-purple-500"
        />
        <StatCard 
          title="Conversion Rate" 
          value="24.8%" 
          subtext="+2.1% increase" 
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Forecast</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600">
                  JS
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">John Smith</span> created a new deal
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-sm text-primary-600 font-medium hover:text-primary-700">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};