// background.js - Privacy Dashboard Extension Service Worker
// Loads tracker list, intercepts web requests, and reports to backend

importScripts('trackers-list.js');

const BACKEND_URL = 'http://localhost:4000/api/tracker-event';
const MAX_STORED_EVENTS = 200;

// Map from tabId -> main frame domain
const tabDomains = {};

/**
 * Extract the hostname from a URL string.
 * Returns null if the URL is invalid or has no hostname.
 */
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Get the registered domain (eTLD+1) to avoid treating
 * subdomains of the same site as third parties.
 * Simple heuristic: last two labels of hostname.
 */
function getBaseDomain(hostname) {
  if (!hostname) return '';
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

/**
 * Look up a domain against the TRACKER_DOMAINS list.
 * Checks exact match and parent domains.
 */
function lookupTracker(domain) {
  if (!domain) return null;
  // Exact match
  if (TRACKER_DOMAINS[domain]) return TRACKER_DOMAINS[domain];
  // Check if domain ends with a tracked domain
  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join('.');
    if (TRACKER_DOMAINS[candidate]) return TRACKER_DOMAINS[candidate];
  }
  return null;
}

/**
 * Send a tracker event to the backend API.
 */
async function sendToBackend(website, trackerDomain) {
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
    // Backend may not be running — fail silently
  }
}

/**
 * Store a detection event in chrome.storage.local.
 */
async function storeEvent(website, trackerDomain, trackerInfo) {
  const event = {
    website,
    tracker_domain: trackerDomain,
    company: trackerInfo ? trackerInfo.company : 'Unknown',
    category: trackerInfo ? trackerInfo.category : 'unknown',
    risk_level: trackerInfo ? trackerInfo.risk_level : 'low',
    timestamp: new Date().toISOString(),
  };

  try {
    const stored = await chrome.storage.local.get(['recentEvents', 'totalDetections']);
    const events = stored.recentEvents || [];
    const total = (stored.totalDetections || 0) + 1;

    events.unshift(event);
    if (events.length > MAX_STORED_EVENTS) {
      events.splice(MAX_STORED_EVENTS);
    }

    await chrome.storage.local.set({ recentEvents: events, totalDetections: total });
  } catch (err) {
    console.warn('[Background] Failed to store event:', err);
  }
}

// Track the main frame URL for each tab
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

// Clean up on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabDomains[tabId];
});

// Intercept all web requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const requestDomain = extractDomain(details.url);
    if (!requestDomain) return;

    // Skip requests from browser UI (tabId -1)
    if (details.tabId < 0) return;

    // Get the main page domain
    const mainDomain = tabDomains[details.tabId];
    if (!mainDomain) return;

    // Skip first-party requests
    if (getBaseDomain(requestDomain) === getBaseDomain(mainDomain)) return;

    // Check if it is a known tracker
    const trackerInfo = lookupTracker(requestDomain);
    if (!trackerInfo) return;

    // Record the detection
    sendToBackend(mainDomain, requestDomain);
    storeEvent(mainDomain, requestDomain, trackerInfo);
  },
  { urls: ['<all_urls>'] }
);

// Message handling for popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_RECENT_EVENTS') {
    chrome.storage.local.get(['recentEvents', 'totalDetections'], (result) => {
      sendResponse({
        events: result.recentEvents || [],
        total: result.totalDetections || 0,
      });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'CLEAR_EVENTS') {
    chrome.storage.local.set({ recentEvents: [], totalDetections: 0 }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
