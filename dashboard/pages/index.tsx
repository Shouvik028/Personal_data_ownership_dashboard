import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import PrivacyScore from '../components/PrivacyScore';
import { getStats, getTopCompanies, Stats, CompanyCount } from '../services/api';

interface RecentEntry {
  company: string;
  count: number;
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<CompanyCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [statsData, companiesData] = await Promise.all([
          getStats(),
          getTopCompanies(),
        ]);
        setStats(statsData);
        setCompanies(companiesData);
      } catch {
        setError('Could not connect to the backend API. Make sure the server is running on port 4000.');
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      title="Privacy Overview"
      description="Real-time tracker detection and privacy analysis across your browsing activity."
    >
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !stats && (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-sm">Loading dashboard data...</div>
        </div>
      )}

      {stats && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Trackers Detected"
              value={stats.total_trackers_detected.toLocaleString()}
              subtitle="Total across all sessions"
              icon="🔍"
            />
            <StatCard
              title="Unique Companies"
              value={stats.unique_companies.toLocaleString()}
              subtitle="Distinct tracking organizations"
              icon="🏢"
            />
            <StatCard
              title="Websites Tracked"
              value={stats.unique_websites.toLocaleString()}
              subtitle="Sites with detected trackers"
              icon="🌐"
            />
            <StatCard
              title="Privacy Score"
              value={stats.privacy_score}
              subtitle={
                stats.privacy_score >= 70
                  ? 'Good privacy exposure'
                  : stats.privacy_score >= 40
                  ? 'Moderate exposure'
                  : 'High exposure risk'
              }
              icon="🛡"
              colorClass={
                stats.privacy_score >= 70
                  ? 'text-emerald-400'
                  : stats.privacy_score >= 40
                  ? 'text-amber-400'
                  : 'text-red-400'
              }
            />
          </div>

          {/* Privacy score + top companies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Privacy Score widget */}
            <div className="lg:col-span-1">
              <PrivacyScore score={stats.privacy_score} size="lg" />
            </div>

            {/* Top companies */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Top Tracking Companies</h2>
              {companies.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-slate-500 text-sm">
                  No data yet. Browse some websites with the extension active.
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.slice(0, 8).map((company, index) => {
                    const max = companies[0]?.count || 1;
                    const pct = Math.round((company.count / max) * 100);
                    return (
                      <div key={company.company} className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs w-4">{index + 1}</span>
                        <span className="text-slate-300 text-sm w-32 flex-shrink-0 truncate">
                          {company.company}
                        </span>
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs w-8 text-right">
                          {company.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty state when no data */}
      {!loading && !error && stats && stats.total_trackers_detected === 0 && (
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-white font-semibold text-lg mb-2">No trackers detected yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Install and enable the browser extension, then browse some websites. Tracker
            detections will appear here automatically.
          </p>
        </div>
      )}
    </Layout>
  );
}
