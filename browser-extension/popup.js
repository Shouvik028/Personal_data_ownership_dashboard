// popup.js - Privacy Dashboard Extension Popup

const DASHBOARD_URL = 'http://localhost:3000';

/**
 * Format a timestamp into a human-readable relative time.
 */
function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * Create a tracker event list item element.
 */
function createEventElement(event) {
  const item = document.createElement('div');
  item.className = 'event-item';

  const risk = event.risk_level || 'low';
  const riskClass = `risk-${risk}`;
  const riskLabel = risk.toUpperCase();

  item.innerHTML = `
    <span class="risk-badge ${riskClass}">${riskLabel}</span>
    <div class="event-details">
      <div class="event-tracker" title="${event.tracker_domain}">${event.tracker_domain}</div>
      <div class="event-meta">${event.company || 'Unknown'} &middot; ${event.category || 'unknown'} &middot; ${event.website || ''}</div>
    </div>
    <div class="event-time">${formatTime(event.timestamp)}</div>
  `;

  return item;
}

/**
 * Render the events list.
 */
function renderEvents(events, total) {
  const listEl = document.getElementById('events-list');
  const totalEl = document.getElementById('total-count');
  const sessionEl = document.getElementById('session-count');

  if (totalEl) totalEl.textContent = String(total);
  if (sessionEl) sessionEl.textContent = String(events.length);

  if (!listEl) return;

  if (!events || events.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">👁</div>
        <p>No trackers detected yet.<br/>Browse some websites to see results.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  events.slice(0, 50).forEach((event) => {
    fragment.appendChild(createEventElement(event));
  });
  listEl.appendChild(fragment);
}

/**
 * Load and display recent events from the background worker.
 */
function loadEvents() {
  chrome.runtime.sendMessage({ type: 'GET_RECENT_EVENTS' }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[Popup] Message error:', chrome.runtime.lastError.message);
      renderEvents([], 0);
      return;
    }
    const { events = [], total = 0 } = response || {};
    renderEvents(events, total);
  });
}

/**
 * Clear all stored events.
 */
function clearEvents() {
  chrome.runtime.sendMessage({ type: 'CLEAR_EVENTS' }, () => {
    renderEvents([], 0);
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();

  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearEvents);
  }

  const dashboardBtn = document.getElementById('open-dashboard');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: DASHBOARD_URL });
    });
  }

  // Auto-refresh every 3 seconds while popup is open
  setInterval(loadEvents, 3000);
});
