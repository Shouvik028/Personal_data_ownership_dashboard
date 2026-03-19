import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getTopWebsites, WebsiteCount } from '../services/api';

export default function Websites() {
  const [websites, setWebsites] = useState<WebsiteCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTopWebsites();
        setWebsites(data);
      } catch {
        setError('Could not connect to the backend API.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = websites.filter((w) =>
    w.website.toLowerCase().includes(search.toLowerCase())
  );

  const maxCount = websites[0]?.count || 1;

  return (
    <Layout
      title="Websites with Most Trackers"
      description="Sites you visited that loaded the highest number of third-party trackers."
    >
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-400 text-sm">Loading website data...</div>
        </div>
      )}

      {!loading && !error && websites.length === 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🌐</div>
          <h3 className="text-white font-semibold text-lg mb-2">No website data yet</h3>
          <p className="text-slate-400 text-sm">
            Browse some websites with the extension active to see tracker data per site.
          </p>
        </div>
      )}

      {!loading && websites.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-4">
            <h2 className="text-white font-semibold flex-shrink-0">All Websites</h2>
            <input
              type="text"
              placeholder="Search websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Trackers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map((website, index) => {
                const barWidth = Math.max(4, Math.round((website.count / maxCount) * 100));
                return (
                  <tr
                    key={website.website}
                    className="hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="text-white text-sm font-medium">{website.website}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="w-full max-w-xs bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-orange-900/40 text-orange-300 text-xs font-semibold px-2 py-1 rounded-full border border-orange-800">
                        {website.count}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm">
                    No websites match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
