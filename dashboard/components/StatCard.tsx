interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  colorClass = 'text-white',
}: StatCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {icon && (
          <span className="text-2xl" role="img" aria-label={title}>
            {icon}
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</p>
      {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
    </div>
  );
}
