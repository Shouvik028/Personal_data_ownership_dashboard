// tracker-detector.ts - TypeScript source for tracker detection logic

export interface TrackerInfo {
  company: string;
  category: string;
  risk_level: string;
}

export type TrackerDatabase = Record<string, TrackerInfo>;

/**
 * Extract hostname from a URL string.
 */
export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Get the base registered domain (eTLD+1 approximation).
 */
export function getBaseDomain(hostname: string): string {
  if (!hostname) return '';
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

/**
 * Look up a domain in the tracker database.
 * Returns tracker info or null if not found.
 */
export function isTracker(
  domain: string,
  trackerDb: TrackerDatabase
): (TrackerInfo & { domain: string }) | null {
  if (!domain) return null;

  if (trackerDb[domain]) {
    return { domain, ...trackerDb[domain] };
  }

  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join('.');
    if (trackerDb[candidate]) {
      return { domain: candidate, ...trackerDb[candidate] };
    }
  }

  return null;
}
