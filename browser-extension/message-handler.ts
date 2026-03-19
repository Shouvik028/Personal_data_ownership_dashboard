// message-handler.ts - TypeScript source for popup/background messaging

export interface StoredEvent {
  website: string;
  tracker_domain: string;
  company: string;
  category: string;
  risk_level: string;
  timestamp: string;
}

export interface EventsResponse {
  events: StoredEvent[];
  total: number;
}

/**
 * Request recent tracker detection events from the background worker.
 */
export function getRecentEvents(): Promise<EventsResponse> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_RECENT_EVENTS' }, (response: EventsResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response || { events: [], total: 0 });
    });
  });
}

/**
 * Clear all stored detection events.
 */
export function clearEvents(): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'CLEAR_EVENTS' }, (response: { success: boolean }) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response || { success: false });
    });
  });
}
