# Personal Data Ownership Dashboard

## AGENT_TASK_ROADMAP.md

---

# 1. Purpose of This Document

This document provides a **step-by-step task roadmap** for an AI development agent responsible for building the **first functional version (MVP)** of the Personal Data Ownership Dashboard.

The roadmap breaks development into **ordered milestones**, where each milestone produces a working component of the system.

Each task includes:

* Objective
* Implementation details
* Expected outputs
* Validation criteria

The AI agent must complete tasks **sequentially** unless specified otherwise.

---

# 2. Development Milestones

The project will be implemented in the following order:

1. Project Repository Setup
2. Tracker Database Initialization
3. Backend API Development
4. Browser Extension Development
5. Event Collection Pipeline
6. Dashboard Application
7. Privacy Score System
8. Data Visualization
9. Basic Testing
10. Final Integration

---

# 3. Milestone 1 — Repository Initialization

## Objective

Create the project repository and directory structure.

## Tasks

Create the following folder structure.

```id="repo1"
personal-data-dashboard/

browser-extension/
backend/
dashboard/
tracker-database/
docs/
scripts/
tests/
```

Within the backend folder create:

```id="repo2"
backend/src/
backend/src/routes/
backend/src/controllers/
backend/src/services/
backend/src/models/
backend/database/
```

Within the dashboard folder create:

```id="repo3"
dashboard/pages/
dashboard/components/
dashboard/services/
dashboard/styles/
```

## Expected Output

A clean repository structure ready for development.

## Validation

Ensure that:

* All folders exist
* Project compiles with no errors
* Git repository initialized

---

# 4. Milestone 2 — Tracker Database Initialization

## Objective

Create a basic tracker database used to identify known tracking domains.

## Tasks

Create file:

```id="trackerfile"
tracker-database/trackers.json
```

Structure:

```id="trackerjson"
[
  {
    "domain": "google-analytics.com",
    "company": "Google",
    "category": "analytics",
    "risk_level": "medium",
    "description": "Collects analytics data about website visitors."
  }
]
```

Populate the file with at least **100 tracker domains**.

Examples to include:

* google-analytics.com
* doubleclick.net
* connect.facebook.net
* ads.twitter.com
* amazon-adsystem.com
* scorecardresearch.com
* criteo.com
* taboola.com

## Expected Output

Tracker database containing known tracker domains.

## Validation

Ensure:

* JSON file is valid
* Each entry contains all required fields

---

# 5. Milestone 3 — Backend API Setup

## Objective

Create a backend server capable of storing tracker events.

## Tasks

Initialize Node.js project inside backend.

Install dependencies:

```id="dep1"
express
cors
body-parser
pg
dotenv
```

Create server entry file:

```id="serverfile"
backend/src/server.ts
```

Server must:

* start Express server
* enable CORS
* parse JSON requests

## Expected Output

Backend server running locally.

Example:

```id="run1"
http://localhost:4000
```

## Validation

Server starts without errors.

---

# 6. Milestone 4 — Database Setup

## Objective

Create PostgreSQL database schema.

## Tasks

Create schema file:

```id="schemafile"
backend/database/schema.sql
```

Create tables.

Trackers table:

```id="schema1"
trackers
id
domain
company
category
risk_level
description
```

Tracker events table:

```id="schema2"
tracker_events
event_id
website
tracker_domain
timestamp
```

## Expected Output

Database schema created.

## Validation

Tables can be queried successfully.

---

# 7. Milestone 5 — API Endpoints

## Objective

Create backend endpoints required for the application.

### Endpoint 1

POST /api/tracker-event

Purpose: record tracker detection event.

Payload:

```id="payload1"
{
  "website": "example.com",
  "tracker_domain": "google-analytics.com",
  "timestamp": "2026-03-18T10:22:00Z"
}
```

---

### Endpoint 2

GET /api/stats

Returns:

```id="payload2"
{
  "total_trackers_detected": 500,
  "unique_websites": 40,
  "unique_companies": 12
}
```

---

### Endpoint 3

GET /api/top-companies

Returns company detection counts.

---

### Endpoint 4

GET /api/top-websites

Returns websites with most trackers.

---

## Expected Output

Working backend APIs.

## Validation

Endpoints respond correctly using Postman or curl.

---

# 8. Milestone 6 — Browser Extension Setup

## Objective

Create a Chrome-compatible browser extension.

## Tasks

Create:

```id="extfiles"
manifest.json
background.ts
tracker-detector.ts
```

Manifest must include:

```id="manifest1"
manifest_version: 3
permissions:
  - webRequest
  - storage
  - tabs
```

The extension must monitor network requests.

---

# 9. Milestone 7 — Tracker Detection Engine

## Objective

Detect trackers during browsing.

## Tasks

Listen for outgoing network requests.

Example logic:

1. Capture request URL
2. Extract domain
3. Compare domain with tracker database
4. If match found → record tracker event

Example detection:

User visits:

```id="site1"
example.com
```

Request detected:

```id="tracker1"
https://google-analytics.com/collect
```

Tracker identified.

---

# 10. Milestone 8 — Event Reporting

## Objective

Send detected tracker events to backend.

## Tasks

When tracker detected:

Send POST request to:

```id="apiurl"
http://localhost:4000/api/tracker-event
```

Payload must include:

* website
* tracker domain
* timestamp

---

# 11. Milestone 9 — Dashboard Application Setup

## Objective

Create dashboard frontend.

Use Next.js.

Initialize project inside:

```id="dashinit"
dashboard/
```

Install dependencies:

```id="dep2"
react
next
tailwindcss
chart.js
axios
```

---

# 12. Milestone 10 — Dashboard Pages

## Page 1 — Overview

Display:

* total trackers
* unique companies
* websites visited
* privacy score

---

## Page 2 — Top Tracking Companies

Table:

Company | Detection Count

---

## Page 3 — Websites With Most Trackers

Table:

Website | Tracker Count

---

## Page 4 — Tracker Categories

Display category distribution chart.

---

# 13. Milestone 11 — Privacy Score System

## Objective

Compute a privacy exposure score.

Algorithm:

```id="score1"
score = 100

score -= high_risk_trackers * 5
score -= medium_risk_trackers * 2
score -= low_risk_trackers * 1
```

Minimum score = 0.

---

# 14. Milestone 12 — Data Visualization

Dashboard must include:

Charts:

* tracker frequency chart
* company distribution chart
* website tracker chart

Use Chart.js or Recharts.

---

# 15. Milestone 13 — Testing

Test the following scenarios.

Scenario 1

Visit popular website (example: news website).

Expected result:

Multiple trackers detected.

---

Scenario 2

Visit minimal tracker site.

Expected result:

Few trackers detected.

---

Scenario 3

Dashboard displays correct statistics.

---

# 16. Milestone 14 — Final Integration

Verify full system workflow.

Workflow:

1. User browses website
2. Extension detects tracker
3. Event sent to backend
4. Backend stores event
5. Dashboard queries backend
6. Dashboard displays analytics

---

# 17. MVP Completion Criteria

The MVP is complete when:

* Browser extension detects trackers
* Events are stored in backend
* Dashboard visualizes tracking activity
* Privacy score is calculated

---

# End of Roadmap
