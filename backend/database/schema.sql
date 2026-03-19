CREATE TABLE IF NOT EXISTS trackers (
  tracker_id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  company VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS tracker_events (
  event_id SERIAL PRIMARY KEY,
  website VARCHAR(255) NOT NULL,
  tracker_domain VARCHAR(255) NOT NULL,
  tracker_company VARCHAR(255),
  tracker_category VARCHAR(100),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS websites (
  website_id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  visit_count INTEGER DEFAULT 1
);
