import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

export interface Stats {
  total_trackers_detected: number;
  unique_websites: number;
  unique_companies: number;
  privacy_score: number;
}

export interface CompanyCount {
  company: string;
  count: number;
}

export interface WebsiteCount {
  website: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TrackerEventPayload {
  website: string;
  tracker_domain: string;
  timestamp?: string;
}

export async function getStats(): Promise<Stats> {
  const res = await client.get<Stats>('/stats');
  return res.data;
}

export async function getTopCompanies(): Promise<CompanyCount[]> {
  const res = await client.get<CompanyCount[]>('/top-companies');
  return res.data;
}

export async function getTopWebsites(): Promise<WebsiteCount[]> {
  const res = await client.get<WebsiteCount[]>('/top-websites');
  return res.data;
}

export async function getCategories(): Promise<CategoryCount[]> {
  const res = await client.get<CategoryCount[]>('/categories');
  return res.data;
}

export async function postTrackerEvent(
  payload: TrackerEventPayload
): Promise<{ success: boolean; event_id: number }> {
  const res = await client.post<{ success: boolean; event_id: number }>(
    '/tracker-event',
    payload
  );
  return res.data;
}
