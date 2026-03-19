// message-handler.js
// Handles messages between popup and background service worker

/**
 * Request recent tracker detection events from the background worker.
 * @returns {Promise<{events: Array, total: number}>}
 */
function getRecentEvents() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_RECENT_EVENTS' }, (response) => {
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
 * @returns {Promise<{success: boolean}>}
 */
function clearEvents() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'CLEAR_EVENTS' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response || { success: false });
    });
  });
}
