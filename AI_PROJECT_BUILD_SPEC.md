# Personal Data Ownership Dashboard

## AI Build Instruction Document (Version 1)

---

# 1. Project Purpose

The goal of this project is to build the **first working version of the Personal Data Ownership Dashboard**.

The application must allow a user to:

1. Detect trackers on websites they visit.
2. Identify which companies operate those trackers.
3. Store tracker activity locally or in a backend service.
4. Present a dashboard that shows the user how their browsing activity is being tracked.

The system should function as a **privacy analytics tool** that helps users understand their exposure to online tracking.

The first version of the system should prioritize **correct functionality and clean architecture**, not visual polish.

---

# 2. Product Definition

This application is a **privacy transparency tool**.

It does NOT:

* block trackers
* modify websites
* intercept or alter network traffic

Instead, it **observes and reports tracking activity**.

The product must answer the following core user questions:

1. Which trackers appear on the websites I visit?
2. Which companies operate those trackers?
3. Which companies track me the most?
4. How exposed is my browsing activity?

---

# 3. High-Level System Architecture

The system must contain three primary components.

### Component 1: Browser Extension

Responsible for detecting tracking requests when the user visits websites.

Responsibilities:

* monitor network requests
* detect third-party domains
* identify tracker domains
* send tracker metadata to backend

---

### Component 2: Backend API

Responsible for storing tracker events and computing analytics.

Responsibilities:

* store tracker detection events
* provide analytics endpoints
* serve tracker metadata

---

### Component 3: Dashboard Web Application

Responsible for presenting analytics and visualizing the user's privacy exposure.

Responsibilities:

* display tracker statistics
* show top tracking companies
* show websites with most trackers
* show privacy exposure score

---

# 4. Technology Requirements

The system must use the following technologies.

Frontend Dashboard

* React
* Next.js
* TailwindCSS
* Chart.js or Recharts

Browser Extension

* TypeScript
* WebExtensions API
* Manifest Version 3

Backend

* Node.js
* Express.js

Database

* PostgreSQL

Development Tools

* Git
* Docker (optional but recommended)

---

# 5. Repository Structure

The project repository must follow this structure.

```
personal-data-dashboard/

browser-extension/
    manifest.json
    background.ts
    tracker-detector.ts
    message-handler.ts

backend/
    src/
        server.ts
        routes/
        controllers/
        services/
        models/
    database/
        schema.sql

dashboard/
    pages/
    components/
    services/
    styles/

tracker-database/
    trackers.json

docs/

scripts/

tests/
```

---

# 6. Browser Extension Requirements

The browser extension must perform tracker detection.

### Manifest Requirements

Use Manifest Version 3.

Required permissions:

* webRequest
* webRequestBlocking
* storage
* tabs
* host_permissions for all domains

Example permissions:

```
"permissions": [
  "webRequest",
  "storage",
  "tabs"
]
```

---

# 7. Tracker Detection Logic

The extension must detect third-party requests made by a webpage.

Definition of tracker candidate:

A request is considered a tracker if:

1. The request domain is different from the main website domain
2. The request domain exists in the tracker database

Example

User visits:

```
example.com
```

Network request detected:

```
google-analytics.com/collect
```

This should be identified as a tracker.

---

# 8. Tracker Database

A tracker database must exist inside the repository.

File:

```
tracker-database/trackers.json
```

Structure:

```
[
  {
    "domain": "google-analytics.com",
    "company": "Google",
    "category": "analytics",
    "risk_level": "medium",
    "description": "Used by websites to collect analytics data about visitors."
  }
]
```

Initial dataset should include at least **100 known tracker domains**.

Examples:

* google-analytics.com
* doubleclick.net
* connect.facebook.net
* ads.twitter.com
* amazon-adsystem.com

---

# 9. Tracker Event Data Model

Each tracker detection event must contain:

```
event_id
timestamp
website
tracker_domain
tracker_company
tracker_category
```

Example:

```
{
  "timestamp": "2026-03-18T10:22:00Z",
  "website": "example.com",
  "tracker_domain": "google-analytics.com",
  "tracker_company": "Google",
  "tracker_category": "analytics"
}
```

---

# 10. Backend API Requirements

The backend must expose REST APIs.

### Endpoint: Record Tracker Event

POST /api/tracker-event

Payload:

```
{
  website: string
  tracker_domain: string
  timestamp: string
}
```

---

### Endpoint: Get Dashboard Stats

GET /api/stats

Returns:

```
{
  total_trackers_detected
  unique_companies
  unique_websites
}
```

---

### Endpoint: Top Tracking Companies

GET /api/top-companies

Example response:

```
[
  { company: "Google", count: 120 },
  { company: "Meta", count: 84 }
]
```

---

### Endpoint: Websites With Most Trackers

GET /api/top-websites

---

# 11. Database Schema

The backend must use PostgreSQL.

Tables required.

---

Trackers Table

```
tracker_id
domain
company
category
description
risk_level
```

---

Tracker Events Table

```
event_id
website
tracker_domain
timestamp
```

---

Websites Table (optional optimization)

```
website_id
domain
visit_count
```

---

# 12. Dashboard Requirements

The dashboard must include the following pages.

---

## Page 1: Overview

Shows:

* total trackers detected
* unique tracking companies
* websites visited
* privacy exposure score

---

## Page 2: Top Tracking Companies

Display:

Company | Times Detected

---

## Page 3: Websites With Most Trackers

Display:

Website | Tracker Count

---

## Page 4: Tracker Categories

Breakdown chart:

* advertising
* analytics
* fingerprinting
* social media

---

# 13. Privacy Score Algorithm

The system must generate a privacy score between **0 and 100**.

Initial algorithm:

```
score = 100

score -= (high_risk_trackers * 5)
score -= (medium_risk_trackers * 2)
score -= (low_risk_trackers * 1)

if score < 0:
    score = 0
```

---

# 14. Data Flow

Example system workflow.

1. User opens website
2. Browser extension detects network request
3. Extension checks tracker database
4. If tracker detected → send event to backend
5. Backend stores event
6. Dashboard queries backend for analytics
7. Analytics visualized for user

---

# 15. Security and Privacy Rules

The system must follow these principles.

User browsing data must:

* not be sold
* not be shared with third parties
* be visible to the user
* be deletable by the user

The extension must clearly explain:

* what data it collects
* why it collects it

---

# 16. MVP Success Criteria

The MVP is considered successful if:

1. The extension correctly detects trackers on websites.
2. Tracker events are stored in the backend.
3. The dashboard displays tracker statistics.
4. Users can see which companies track them most.

---

# 17. Development Priorities

The AI agent should implement features in this order.

Priority 1

* browser extension tracker detection

Priority 2

* backend API
* event storage

Priority 3

* dashboard UI

Priority 4

* privacy score algorithm

---

# 18. Non Goals (For Version 1)

The following features must NOT be implemented in the first version.

* tracker blocking
* AI privacy assistant
* GDPR automation
* mobile app monitoring
* fingerprinting detection

These may be considered in future versions.

---

# 19. Future Expansion Possibilities

Potential future improvements:

* tracker network visualization
* privacy recommendations
* research dataset export
* browser-level privacy alerts

---

# 20. AI Agent Implementation Instructions

When implementing this project, the AI agent must:

1. Follow the repository structure exactly.
2. Write modular, maintainable code.
3. Add comments explaining logic.
4. Create basic tests where appropriate.
5. Avoid unnecessary dependencies.
6. Prefer clarity over optimization.

---

# End of Document
