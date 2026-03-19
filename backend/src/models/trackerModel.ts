import { Pool } from 'pg';

export interface TrackerEvent {
  event_id?: number;
  website: string;
  tracker_domain: string;
  tracker_company?: string;
  tracker_category?: string;
  timestamp?: string;
}

export interface TrackerInfo {
  domain: string;
  company: string;
  category: string;
  risk_level: string;
  description?: string;
}

export interface StatsRow {
  total_trackers_detected: string;
  unique_websites: string;
  unique_companies: string;
  high_risk_count: string;
  medium_risk_count: string;
  low_risk_count: string;
}

export interface CompanyRow {
  company: string;
  count: string;
}

export interface WebsiteRow {
  website: string;
  count: string;
}

export interface CategoryRow {
  category: string;
  count: string;
}

export class TrackerModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async insertEvent(event: TrackerEvent): Promise<number> {
    const query = `
      INSERT INTO tracker_events (website, tracker_domain, tracker_company, tracker_category, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING event_id
    `;
    const values = [
      event.website,
      event.tracker_domain,
      event.tracker_company || null,
      event.tracker_category || null,
      event.timestamp || new Date().toISOString(),
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0].event_id as number;
  }

  async getStats(): Promise<StatsRow> {
    const query = `
      SELECT
        COUNT(*)::text AS total_trackers_detected,
        COUNT(DISTINCT website)::text AS unique_websites,
        COUNT(DISTINCT tracker_company)::text AS unique_companies,
        COALESCE(SUM(CASE WHEN t.risk_level = 'high' THEN 1 ELSE 0 END), 0)::text AS high_risk_count,
        COALESCE(SUM(CASE WHEN t.risk_level = 'medium' THEN 1 ELSE 0 END), 0)::text AS medium_risk_count,
        COALESCE(SUM(CASE WHEN t.risk_level = 'low' THEN 1 ELSE 0 END), 0)::text AS low_risk_count
      FROM tracker_events te
      LEFT JOIN trackers t ON te.tracker_domain = t.domain
    `;
    const result = await this.pool.query(query);
    return result.rows[0] as StatsRow;
  }

  async getTopCompanies(limit = 10): Promise<CompanyRow[]> {
    const query = `
      SELECT tracker_company AS company, COUNT(*)::text AS count
      FROM tracker_events
      WHERE tracker_company IS NOT NULL
      GROUP BY tracker_company
      ORDER BY COUNT(*) DESC
      LIMIT $1
    `;
    const result = await this.pool.query(query, [limit]);
    return result.rows as CompanyRow[];
  }

  async getTopWebsites(limit = 10): Promise<WebsiteRow[]> {
    const query = `
      SELECT website, COUNT(*)::text AS count
      FROM tracker_events
      GROUP BY website
      ORDER BY COUNT(*) DESC
      LIMIT $1
    `;
    const result = await this.pool.query(query, [limit]);
    return result.rows as WebsiteRow[];
  }

  async getCategories(): Promise<CategoryRow[]> {
    const query = `
      SELECT tracker_category AS category, COUNT(*)::text AS count
      FROM tracker_events
      WHERE tracker_category IS NOT NULL
      GROUP BY tracker_category
      ORDER BY COUNT(*) DESC
    `;
    const result = await this.pool.query(query);
    return result.rows as CategoryRow[];
  }
}
