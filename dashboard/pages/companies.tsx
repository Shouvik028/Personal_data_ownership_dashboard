import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getTopCompanies, CompanyCount } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#14b8a6',
];

export default function Companies() {
  const [companies, setCompanies] = useState<CompanyCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTopCompanies();
        setCompanies(data);
      } catch {
        setError('Could not connect to the backend API.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Layout
      title="Top Tracking Companies"
      description="Companies that have tracked you most frequently across your browsing sessions."
    >
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-sm">Loading company data...</div>
        </div>
      )}

      {!loading && !error && companies.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-white font-semibold text-lg mb-2">No company data yet</h3>
          <p className="text-slate-400 text-sm">
            Browse some websites with the extension active to see which companies are tracking you.
          </p>
        </div>
      )}

      {!loading && companies.length > 0 && (
        <>
          {/* Bar chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-white font-semibold mb-6">Detection Count by Company</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={companies}
                margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="company"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="count" name="Detections" radius={[4, 4, 0, 0]}>
                  {companies.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">All Companies</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Detections
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {companies.map((company, index) => {
                  const total = companies.reduce((sum, c) => sum + c.count, 0);
                  const share = total > 0 ? ((company.count / total) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={company.company} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-sm">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-white text-sm font-medium">{company.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 text-sm font-mono">
                        {company.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 text-sm">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
