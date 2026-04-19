# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This site tracks regulatory and legal intelligence for Prosus and all Naspers portfolio companies including: OLX, Swiggy, PayU, Stack Overflow, Codecademy, GoodHabitz, Eruditus, Brainly, Skillsoft, Udemy, iFood, Delivery Hero, Tencent (via Naspers stake), Mail.ru, Avito, ClassMarkets, and others.

## Coverage Areas (Priority Order)

1. Competition law and antitrust
2. Data protection and privacy (GDPR, LGPD, PDPB, etc.)
3. IP law
4. Regulatory changes affecting digital markets

## Priority Regions (Priority Order)

EU, UK, Brazil, India, US (secondary), South Africa

## Priority Classification

- **CRITICAL**: Direct company mention + regulatory action (e.g. Prosus/Swiggy/competition ruling)
- **HIGH**: Regulatory change directly affecting a portfolio company's sector
- **MEDIUM**: Regional regulatory development relevant to digital markets
- **LOW**: Broader regulatory trends and context

## Regulatory Bodies to Monitor

| Body | Jurisdiction |
|---|---|
| European Commission | EU |
| CMA | UK |
| CADE | Brazil |
| CCI | India |
| FTC / DOJ | US |
| SAMR | China |
| Competition Commission South Africa | South Africa |
| EDPB | EU (data protection) |
| ICO | UK (data protection) |
| All national DPAs | Various |

## Update Format

Each update entry must include these frontmatter fields (all required):

```yaml
---
title: "..."
date: YYYY-MM-DD
region: EU | UK | Brazil | India | US | South Africa | Global
kicker: UPPERCASE LABEL (e.g. GDPR ENFORCEMENT, ABUSE OF DOMINANCE)
status: Adopted | Enforced | Under Investigation | Pending | Developing
signal: "Legal instrument reference (e.g. Art. 83(5) GDPR)"
priority: CRITICAL | HIGH | MEDIUM | LOW
source: "Institution / Publication name"
source_url: "https://full-url-to-original-article"
tags: [category-tag, region, topic]
summary: "Two-sentence plain English summary for the card display."
company_relevance: "Portfolio company name(s) or Sector-wide"
---
```

**`source_url` is required** — it must be the full URL to the original article, ruling, or press release. The card headline on the site links directly to this URL in a new tab. Never omit it or use a placeholder.

## Trending Today Section

Each update file must include a "Trending Today" section at the bottom with broader digital regulatory news relevant to a digital regulatory team — items that provide context even if they don't directly affect a portfolio company.

## File Writing Rules

- Write new updates to `source/content/updates/` as dated markdown files
- Filename format: `YYYY-MM-DD-[slug].md`
- **Deduplicate before writing**: check existing files in `source/content/updates/` for the same story before creating a new entry
- **Always push to GitHub after writing new files**: run `git add`, `git commit`, and `git push` after every write session
