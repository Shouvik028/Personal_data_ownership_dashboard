import { Pool } from 'pg';
import { TrackerModel, TrackerEvent } from '../models/trackerModel';
import * as fs from 'fs';
import * as path from 'path';

interface TrackerEntry {
  domain: string;
  company: string;
  category: string;
  risk_level: string;
  description?: string;
}

interface InMemoryEvent {
  event_id: number;
  website: string;
  tracker_domain: string;
  tracker_company?: string;
  tracker_category?: string;
  timestamp: string;
}

interface Stats {
  total_trackers_detected: number;
  unique_websites: number;
  unique_companies: number;
  privacy_score: number;
}

interface CompanyCount {
  company: string;
  count: number;
}

interface WebsiteCount {
  website: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

// In-memory fallback storage
let inMemoryEvents: InMemoryEvent[] = [];
let nextEventId = 1;

// Tracker database loaded from JSON
let trackerDb: Record<string, TrackerEntry> = {};

function loadTrackerDatabase(): void {
  try {
    const dbPath = path.resolve(__dirname, '../../../tracker-database/trackers.json');
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      const entries: TrackerEntry[] = JSON.parse(raw);
      entries.forEach((entry) => {
        trackerDb[entry.domain] = entry;
      });
      console.log(`[TrackerService] Loaded ${entries.length} trackers from database.`);
    } else {
      console.warn('[TrackerService] trackers.json not found, using empty tracker DB.');
    }
  } catch (err) {
    console.error('[TrackerService] Failed to load tracker database:', err);
  }
}

loadTrackerDatabase();

function lookupTracker(domain: string): TrackerEntry | null {
  // Direct match
  if (trackerDb[domain]) return trackerDb[domain];
  // Check if any tracked domain is a suffix of the request domain
  for (const key of Object.keys(trackerDb)) {
    if (domain === key || domain.endsWith('.' + key)) {
      return trackerDb[key];
    }
  }
  return null;
}

function computePrivacyScore(events: InMemoryEvent[]): number {
  let score = 100;
  for (const event of events) {
    const info = event.tracker_domain ? lookupTracker(event.tracker_domain) : null;
    const risk = info?.risk_level ?? 'low';
    if (risk === 'high') score -= 5;
    else if (risk === 'medium') score -= 2;
    else score -= 1;
  }
  return Math.max(0, score);
}

export class TrackerService {
  private pool: Pool | null;
  private model: TrackerModel | null;
  private useDb: boolean;

  constructor(pool: Pool | null, dbAvailable: boolean) {
    this.pool = pool;
    this.model = pool && dbAvailable ? new TrackerModel(pool) : null;
    this.useDb = dbAvailable;
  }

  async recordEvent(event: TrackerEvent): Promise<{ success: boolean; event_id: number }> {
    const trackerInfo = lookupTracker(event.tracker_domain);
    const enrichedEvent: TrackerEvent = {
      ...event,
      tracker_company: trackerInfo?.company ?? event.tracker_company,
      tracker_category: trackerInfo?.category ?? event.tracker_category,
    };

    if (this.useDb && this.model) {
      try {
        const event_id = await this.model.insertEvent(enrichedEvent);
        return { success: true, event_id };
      } catch (err) {
        console.warn('[TrackerService] DB insert failed, falling back to in-memory:', err);
      }
    }

    // In-memory fallback
    const id = nextEventId++;
    inMemoryEvents.push({
      event_id: id,
      website: enrichedEvent.website,
      tracker_domain: enrichedEvent.tracker_domain,
      tracker_company: enrichedEvent.tracker_company,
      tracker_category: enrichedEvent.tracker_category,
      timestamp: enrichedEvent.timestamp || new Date().toISOString(),
    });
    return { success: true, event_id: id };
  }

  async getStats(): Promise<Stats> {
    if (this.useDb && this.model) {
      try {
        const row = await this.model.getStats();
        const highRisk = parseInt(row.high_risk_count, 10) || 0;
        const mediumRisk = parseInt(row.medium_risk_count, 10) || 0;
        const lowRisk = parseInt(row.low_risk_count, 10) || 0;
        let score = 100 - highRisk * 5 - mediumRisk * 2 - lowRisk * 1;
        score = Math.max(0, score);
        return {
          total_trackers_detected: parseInt(row.total_trackers_detected, 10) || 0,
          unique_websites: parseInt(row.unique_websites, 10) || 0,
          unique_companies: parseInt(row.unique_companies, 10) || 0,
          privacy_score: score,
        };
      } catch (err) {
        console.warn('[TrackerService] DB getStats failed, using in-memory:', err);
      }
    }

    // In-memory fallback
    const uniqueWebsites = new Set(inMemoryEvents.map((e) => e.website)).size;
    const uniqueCompanies = new Set(
      inMemoryEvents.map((e) => e.tracker_company).filter(Boolean)
    ).size;
    const score = computePrivacyScore(inMemoryEvents);
    return {
      total_trackers_detected: inMemoryEvents.length,
      unique_websites: uniqueWebsites,
      unique_companies: uniqueCompanies,
      privacy_score: score,
    };
  }

  async getTopCompanies(): Promise<CompanyCount[]> {
    if (this.useDb && this.model) {
      try {
        const rows = await this.model.getTopCompanies();
        return rows.map((r) => ({ company: r.company, count: parseInt(r.count, 10) }));
      } catch (err) {
        console.warn('[TrackerService] DB getTopCompanies failed, using in-memory:', err);
      }
    }

    // In-memory fallback
    const counts: Record<string, number> = {};
    for (const event of inMemoryEvents) {
      if (event.tracker_company) {
        counts[event.tracker_company] = (counts[event.tracker_company] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async getTopWebsites(): Promise<WebsiteCount[]> {
    if (this.useDb && this.model) {
      try {
        const rows = await this.model.getTopWebsites();
        return rows.map((r) => ({ website: r.website, count: parseInt(r.count, 10) }));
      } catch (err) {
        console.warn('[TrackerService] DB getTopWebsites failed, using in-memory:', err);
      }
    }

    // In-memory fallback
    const counts: Record<string, number> = {};
    for (const event of inMemoryEvents) {
      counts[event.website] = (counts[event.website] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([website, count]) => ({ website, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async getCategories(): Promise<CategoryCount[]> {
    if (this.useDb && this.model) {
      try {
        const rows = await this.model.getCategories();
        return rows.map((r) => ({ category: r.category, count: parseInt(r.count, 10) }));
      } catch (err) {
        console.warn('[TrackerService] DB getCategories failed, using in-memory:', err);
      }
    }

    // In-memory fallback
    const counts: Record<string, number> = {};
    for (const event of inMemoryEvents) {
      if (event.tracker_category) {
        counts[event.tracker_category] = (counts[event.tracker_category] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }
}
