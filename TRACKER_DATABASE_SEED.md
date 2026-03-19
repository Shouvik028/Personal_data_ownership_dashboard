# TRACKER_DATABASE_SEED.md

## Personal Data Ownership Dashboard

---

# 1. Purpose

This document provides the **initial tracker dataset seed** for the Personal Data Ownership Dashboard.

The dataset contains **known tracking domains used across the web**, categorized by:

* company owner
* tracker category
* privacy risk level
* description

This dataset will be used by the **browser extension tracker detection engine** to identify trackers when users visit websites.

The entries in this document should be converted into a machine-readable file:

```
tracker-database/trackers.json
```

---

# 2. Tracker Data Schema

Each tracker entry must follow the structure below.

```
{
  "domain": "tracker-domain.com",
  "company": "Company Name",
  "category": "analytics | advertising | social | fingerprinting | cdn | tracking",
  "risk_level": "low | medium | high",
  "description": "Plain-language explanation of what this tracker does."
}
```

---

# 3. Risk Level Guidelines

Risk levels should follow these rules.

### Low Risk

Basic analytics or functionality trackers.

Examples:

* performance analytics
* session monitoring
* CDN-based tracking

---

### Medium Risk

Cross-site tracking or behavioral analytics.

Examples:

* Google Analytics
* marketing analytics
* user profiling

---

### High Risk

Trackers designed for **cross-site identity profiling** or ad networks.

Examples:

* advertising networks
* fingerprinting systems
* data broker trackers

---

# 4. Tracker Categories

Trackers should be categorized as follows.

| Category       | Description                  |
| -------------- | ---------------------------- |
| analytics      | Website usage analytics      |
| advertising    | Advertising network trackers |
| social         | Social media trackers        |
| fingerprinting | Device fingerprint tracking  |
| cdn            | CDN tracking infrastructure  |
| tracking       | General cross-site tracking  |

---

# 5. Initial Tracker Dataset

Below is the **seed dataset**.

This list contains **common trackers widely found across the web**.

---

# Google Ecosystem Trackers

```
google-analytics.com
company: Google
category: analytics
risk_level: medium
description: Collects website visitor analytics and usage statistics.
```

```
googletagmanager.com
company: Google
category: analytics
risk_level: medium
description: Loads marketing and analytics tracking scripts.
```

```
doubleclick.net
company: Google
category: advertising
risk_level: high
description: Advertising network used for targeted advertising and cross-site tracking.
```

```
googleads.g.doubleclick.net
company: Google
category: advertising
risk_level: high
description: Ad delivery and measurement system used in online advertising.
```

```
adservice.google.com
company: Google
category: advertising
risk_level: high
description: Google advertising delivery and targeting service.
```

```
pagead2.googlesyndication.com
company: Google
category: advertising
risk_level: high
description: Serves Google advertisements across websites.
```

---

# Meta (Facebook) Trackers

```
connect.facebook.net
company: Meta
category: social
risk_level: high
description: Facebook tracking pixel used to track users across websites.
```

```
facebook.com/tr
company: Meta
category: advertising
risk_level: high
description: Facebook conversion tracking pixel used for ad targeting.
```

```
staticxx.facebook.com
company: Meta
category: social
risk_level: medium
description: Loads Facebook widgets and tracking scripts.
```

---

# Amazon Trackers

```
amazon-adsystem.com
company: Amazon
category: advertising
risk_level: high
description: Amazon advertising network used for targeted ads.
```

```
aax.amazon-adsystem.com
company: Amazon
category: advertising
risk_level: high
description: Amazon programmatic advertising exchange.
```

```
analytics.amazon.com
company: Amazon
category: analytics
risk_level: medium
description: Amazon web analytics service.
```

---

# Twitter / X Trackers

```
ads-twitter.com
company: Twitter
category: advertising
risk_level: high
description: Twitter ad conversion tracking service.
```

```
analytics.twitter.com
company: Twitter
category: analytics
risk_level: medium
description: Collects website usage analytics for Twitter integrations.
```

```
platform.twitter.com
company: Twitter
category: social
risk_level: medium
description: Loads Twitter widgets and social sharing tools.
```

---

# LinkedIn Trackers

```
px.ads.linkedin.com
company: LinkedIn
category: advertising
risk_level: high
description: LinkedIn advertising tracking pixel.
```

```
snap.licdn.com
company: LinkedIn
category: advertising
risk_level: high
description: LinkedIn Insight Tag used for marketing analytics.
```

---

# Microsoft Trackers

```
bat.bing.com
company: Microsoft
category: advertising
risk_level: high
description: Bing advertising conversion tracking service.
```

```
clarity.ms
company: Microsoft
category: analytics
risk_level: medium
description: Microsoft Clarity user behavior analytics platform.
```

---

# TikTok Trackers

```
analytics.tiktok.com
company: TikTok
category: analytics
risk_level: medium
description: TikTok analytics service used for marketing insights.
```

```
ads.tiktok.com
company: TikTok
category: advertising
risk_level: high
description: TikTok advertising and marketing tracking service.
```

---

# Advertising Networks

```
criteo.com
company: Criteo
category: advertising
risk_level: high
description: Advertising retargeting network that tracks user browsing.
```

```
taboola.com
company: Taboola
category: advertising
risk_level: high
description: Content recommendation and advertising platform.
```

```
outbrain.com
company: Outbrain
category: advertising
risk_level: high
description: Content discovery and native advertising network.
```

```
scorecardresearch.com
company: Comscore
category: analytics
risk_level: medium
description: Audience measurement and analytics service.
```

---

# Fingerprinting Trackers

```
fingerprintjs.com
company: FingerprintJS
category: fingerprinting
risk_level: high
description: Device fingerprinting technology used to uniquely identify users.
```

```
clientjs.org
company: ClientJS
category: fingerprinting
risk_level: high
description: JavaScript library used for browser fingerprinting.
```

---

# CDN / Tracking Infrastructure

```
cdn.segment.com
company: Segment
category: analytics
risk_level: medium
description: Customer data platform used to collect and route analytics data.
```

```
cdn.heapanalytics.com
company: Heap
category: analytics
risk_level: medium
description: Product analytics tracking system.
```

```
static.hotjar.com
company: Hotjar
category: analytics
risk_level: medium
description: Behavioral analytics and user session recording service.
```

```
script.hotjar.com
company: Hotjar
category: analytics
risk_level: medium
description: Loads Hotjar session recording scripts.
```

---

# Privacy-Friendly Analytics (Lower Risk)

```
plausible.io
company: Plausible
category: analytics
risk_level: low
description: Privacy-focused website analytics platform.
```

```
simpleanalytics.com
company: Simple Analytics
category: analytics
risk_level: low
description: Privacy-friendly analytics platform without tracking cookies.
```

---

# 6. Dataset Expansion Instructions

Future contributors may expand the dataset by adding new trackers.

Steps:

1. Verify tracker domain
2. Identify company owner
3. Assign category
4. Assign risk level
5. Provide plain-language description

---

# 7. Recommended Tracker Sources

To expand the dataset, use the following sources:

EasyPrivacy
DuckDuckGo Tracker Radar
Disconnect Tracker List
Ghostery Tracker Database

---

# 8. Conversion to JSON

This document should be converted into:

```
tracker-database/trackers.json
```

Example JSON entry:

```
{
  "domain": "google-analytics.com",
  "company": "Google",
  "category": "analytics",
  "risk_level": "medium",
  "description": "Collects website visitor analytics and usage statistics."
}
```

---

# 9. Minimum Dataset Requirement

The tracker database must contain **at least 100 tracker domains** before production deployment.

Future versions may expand to **1000+ trackers**.

---

# End of File
