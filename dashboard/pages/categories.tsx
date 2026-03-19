import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCategories, CategoryCount } from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  advertising: '#ef4444',
  analytics: '#3b82f6',
  social: '#8b5cf6',
  fingerprinting: '#f97316',
  utility: '#10b981',
  other: '#6b7280',
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  advertising: 'Trackers used to serve and target personalized ads',
  analytics: 'Trackers that measure website traffic and user behavior',
  social: 'Widgets and pixels from social media platforms',
  fingerprinting: 'Scripts that identify you without cookies',
  utility: 'Third-party services with minimal tracking impact',
};

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'pie' | 'bar'>('pie');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCategories();
        setCategories(data);
      } catch {
        setError('Could not connect to the backend API.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData = categories.map((c) => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.count,
    rawCategory: c.category,
  }));

  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <Layout
      title="Tracker Categories"
      description="Breakdown of trackers by their purpose: advertising, analytics, social, and more."
    >
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-sm">Loading category data...</div>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-white font-semibold text-lg mb-2">No category data yet</h3>
          <p className="text-slate-400 text-sm">
            Browse some websites with the extension active to see tracker categories.
          </p>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <>
          {/* View toggle + chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">Distribution by Category</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('pie')}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    view === 'pie'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setView('bar')}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    view === 'bar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              {view === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel as React.ComponentProps<typeof Pie>['label']}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCategoryColor(entry.rawCategory)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                    }}
                    formatter={(value: number) => [value, 'Detections']}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>{value}</span>
                    )}
                  />
                </PieChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
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
                  <Bar dataKey="value" name="Detections" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getCategoryColor(entry.rawCategory)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const color = getCategoryColor(cat.category);
              const share = total > 0 ? ((cat.count / total) * 100).toFixed(1) : '0.0';
              const description =
                CATEGORY_DESCRIPTIONS[cat.category.toLowerCase()] ||
                'Third-party scripts on visited websites.';
              return (
                <div
                  key={cat.category}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="text-white font-semibold capitalize">{cat.category}</h3>
                    <span className="ml-auto text-slate-400 text-sm font-mono">{share}%</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{cat.count.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">{description}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
}
