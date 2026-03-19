interface PrivacyScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  label: string;
} {
  if (score >= 70) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-900/30',
      border: 'border-emerald-700',
      label: 'Good',
    };
  }
  if (score >= 40) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-900/30',
      border: 'border-amber-700',
      label: 'Moderate',
    };
  }
  return {
    text: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-700',
    label: 'At Risk',
  };
}

export default function PrivacyScore({ score, size = 'md' }: PrivacyScoreProps) {
  const colors = getScoreColor(score);

  const sizeClasses = {
    sm: { container: 'p-3', score: 'text-2xl', label: 'text-xs', title: 'text-xs' },
    md: { container: 'p-5', score: 'text-4xl', label: 'text-sm', title: 'text-sm' },
    lg: { container: 'p-8', score: 'text-6xl', label: 'text-base', title: 'text-base' },
  };

  const sizes = sizeClasses[size];

  // Progress arc percentage
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const strokeColor =
    clampedScore >= 70 ? '#34d399' : clampedScore >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl ${sizes.container} flex flex-col items-center`}
    >
      <p className={`${sizes.title} text-slate-400 font-medium mb-3`}>Privacy Score</p>

      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${sizes.score} font-bold ${colors.text}`}>{clampedScore}</span>
        </div>
      </div>

      <span
        className={`mt-3 ${sizes.label} font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
      >
        {colors.label}
      </span>
    </div>
  );
}
