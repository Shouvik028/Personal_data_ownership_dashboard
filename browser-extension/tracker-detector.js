// tracker-detector.js
// Provides tracker detection utilities used by background.js

/**
 * Extract hostname from a URL string.
 * @param {string} url
 * @returns {string|null}
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Look up a domain in the TRACKER_DOMAINS object.
 * Tries exact match first, then walks up the domain tree.
 * @param {string} domain
 * @param {Object} trackerDomains
 * @returns {Object|null} tracker info or null
 */
function isTracker(domain, trackerDomains) {
  if (!domain || !trackerDomains) return null;

  if (trackerDomains[domain]) {
    return { domain, ...trackerDomains[domain] };
  }

  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join('.');
    if (trackerDomains[candidate]) {
      return { domain: candidate, ...trackerDomains[candidate] };
    }
  }

  return null;
}

/**
 * Get the base registered domain (eTLD+1 approximation).
 * @param {string} hostname
 * @returns {string}
 */
function getBaseDomain(hostname) {
  if (!hostname) return '';
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}
