# Personal Data Ownership Dashboard

A privacy transparency tool that detects trackers in your browser and visualizes what companies know about your browsing behavior.

## Components

| Component | Stack | Directory |
|---|---|---|
| Browser Extension | JavaScript, Manifest V3 | `browser-extension/` |
| Backend API | Node.js, Express, TypeScript | `backend/` |
| Dashboard | Next.js, React, TailwindCSS, Recharts | `dashboard/` |
| Tracker Database | JSON | `tracker-database/` |

---

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+ (optional — backend falls back to in-memory storage)

---

### 1. Backend API

```bash
cd backend
npm install
```

Create a `.env` file (copy from example):

```bash
cp .env.example .env
```

Edit `.env` to set your PostgreSQL connection string (optional):

```
PORT=4000
DATABASE_URL=postgresql://localhost:5432/privacy_dashboard
```

If using PostgreSQL, create the database and run the schema:

```bash
createdb privacy_dashboard
psql privacy_dashboard < database/schema.sql
```

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

> **Note:** If PostgreSQL is not available, the backend automatically uses in-memory storage. All endpoints still function normally; data is lost on server restart.

---

### 2. Dashboard

```bash
cd dashboard
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

### 3. Browser Extension

The extension runs directly from the `browser-extension/` directory — no build step required.

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `browser-extension/` directory

The extension icon will appear in your toolbar. Browse websites and tracker detections will appear in the popup and dashboard.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/tracker-event` | Record a tracker detection |
| GET | `/api/stats` | Get overall statistics |
| GET | `/api/top-companies` | Top tracking companies by detection count |
| GET | `/api/top-websites` | Websites with most trackers |
| GET | `/api/categories` | Tracker breakdown by category |

### POST /api/tracker-event

```json
{
  "website": "example.com",
  "tracker_domain": "google-analytics.com",
  "timestamp": "2026-03-19T12:00:00.000Z"
}
```

### GET /api/stats

```json
{
  "total_trackers_detected": 142,
  "unique_websites": 18,
  "unique_companies": 9,
  "privacy_score": 46
}
```

Privacy score algorithm:
- Start at 100
- Subtract 5 per high-risk tracker detection
- Subtract 2 per medium-risk tracker detection
- Subtract 1 per low-risk tracker detection
- Minimum score: 0

---

## Tracker Database

`tracker-database/trackers.json` contains 150+ known tracker entries with:
- `domain` — tracker domain
- `company` — owning company
- `category` — `analytics`, `advertising`, `social`, `fingerprinting`, or `utility`
- `risk_level` — `high`, `medium`, or `low`
- `description` — human-readable explanation

---

## Architecture

```
Browser Extension
  -> Intercepts web requests via chrome.webRequest
  -> Checks against bundled tracker list (trackers-list.js)
  -> POSTs detections to Backend API
  -> Stores recent events in chrome.storage.local

Backend API (Express + TypeScript)
  -> Receives tracker events
  -> Enriches with company/category data from tracker DB
  -> Stores in PostgreSQL (or in-memory fallback)
  -> Serves aggregated analytics to Dashboard

Dashboard (Next.js)
  -> Polls Backend API for stats
  -> Displays overview, companies, websites, categories
  -> Uses Recharts for interactive visualizations
```

---

## Directory Structure

```
personal-data-dashboard/
├── browser-extension/     # Chrome extension (Manifest V3)
├── backend/               # Express API server
├── dashboard/             # Next.js frontend
├── tracker-database/      # Tracker JSON database
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── tests/                 # Test files
```
