// background.ts - TypeScript source for the extension service worker
// Compiled to background.js for use in the extension

// NOTE: This TypeScript file is the source. The compiled background.js
// is what the extension actually uses. The JS file uses importScripts()
// which is not available in TypeScript module context.

// Type declarations for WebExtensions APIs (provided by @types/chrome)
declare const TRACKER_DOMAINS: Record<string, {
  company: string;
  category: string;
  risk_level: string;
}>;

const BACKEND_URL = 'http://localhost:4000/api/tracker-event';
const MAX_STORED_EVENTS = 200;

interface StoredEvent {
  website: string;
  tracker_domain: string;
  company: string;
  category: string;
  risk_level: string;
  timestamp: string;
}

const tabDomains: Record<number, string> = {};

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function getBaseDomain(hostname: string): string {
  if (!hostname) return '';
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

function lookupTracker(domain: string): { company: string; category: string; risk_level: string } | null {
  if (!domain) return null;
  if (TRACKER_DOMAINS[domain]) return TRACKER_DOMAINS[domain];
  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join('.');
    if (TRACKER_DOMAINS[candidate]) return TRACKER_DOMAINS[candidate];
  }
  return null;
}

async function sendToBackend(website: string, trackerDomain: string): Promise<void> {
  try {
    await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website,
        tracker_domain: trackerDomain,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Backend may not be running
  }
}

async function storeEvent(
  website: string,
  trackerDomain: string,
  trackerInfo: { company: string; category: string; risk_level: string } | null
): Promise<void> {
  const event: StoredEvent = {
    website,
    tracker_domain: trackerDomain,
    company: trackerInfo?.company ?? 'Unknown',
    category: trackerInfo?.category ?? 'unknown',
    risk_level: trackerInfo?.risk_level ?? 'low',
    timestamp: new Date().toISOString(),
  };

  try {
    const stored = await chrome.storage.local.get(['recentEvents', 'totalDetections']);
    const events: StoredEvent[] = stored['recentEvents'] || [];
    const total: number = (stored['totalDetections'] as number) || 0;

    events.unshift(event);
    if (events.length > MAX_STORED_EVENTS) {
      events.splice(MAX_STORED_EVENTS);
    }

    await chrome.storage.local.set({ recentEvents: events, totalDetections: total + 1 });
  } catch (err) {
    console.warn('[Background] Failed to store event:', err);
  }
}

chrome.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId === 0) {
      const domain = extractDomain(details.url);
      if (domain) {
        tabDomains[details.tabId] = domain;
      }
    }
  },
  { url: [{ schemes: ['http', 'https'] }] }
);

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabDomains[tabId];
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const requestDomain = extractDomain(details.url);
    if (!requestDomain) return;
    if (details.tabId < 0) return;

    const mainDomain = tabDomains[details.tabId];
    if (!mainDomain) return;

    if (getBaseDomain(requestDomain) === getBaseDomain(mainDomain)) return;

    const trackerInfo = lookupTracker(requestDomain);
    if (!trackerInfo) return;

    sendToBackend(mainDomain, requestDomain);
    storeEvent(mainDomain, requestDomain, trackerInfo);
  },
  { urls: ['<all_urls>'] }
);

chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    if (message.type === 'GET_RECENT_EVENTS') {
      chrome.storage.local.get(['recentEvents', 'totalDetections'], (result) => {
        sendResponse({
          events: result['recentEvents'] || [],
          total: result['totalDetections'] || 0,
        });
      });
      return true;
    }

    if (message.type === 'CLEAR_EVENTS') {
      chrome.storage.local.set({ recentEvents: [], totalDetections: 0 }, () => {
        sendResponse({ success: true });
      });
      return true;
    }
  }
);
