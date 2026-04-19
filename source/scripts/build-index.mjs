#!/usr/bin/env node
/**
 * Reads all markdown files from content/updates/, parses their frontmatter,
 * and regenerates content/index.html with real article data.
 * Run: node scripts/build-index.mjs (from the source/ directory)
 */

import { readdir, readFile, writeFile } from "fs/promises"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import matter from "gray-matter"

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPDATES_DIR = join(__dirname, "../content/updates")
const TEMPLATE_PATH = join(__dirname, "../content/index.template.html")
const OUTPUT_PATH = join(__dirname, "../content/index.html")

// ── Category detection (mirrors ProsusArticleFeed.tsx logic) ──────────────────

function getCategory(tags, priority) {
  const lower = (tags || []).map((t) => String(t).toLowerCase())
  if (lower.some((t) => t === "trending" || t === "briefing")) return "trending"
  // Explicit regulatory-changes tag wins over incidental data/ip tags on the same article
  if (lower.includes("regulatory-changes")) return "regulatory"
  // IP check before competition — ip-law/patent/sep/frand are more specific than "competition"
  if (
    lower.some((t) =>
      ["ip-law", "patent", "copyright", "sep", "frand", "trademark", "inventorship"].some((k) =>
        t.includes(k),
      ),
    )
  )
    return "ip"
  if (
    lower.some((t) =>
      ["competition", "antitrust", "dma", "cartel", "cma", "cci", "cade", "sms", "dmcca"].some(
        (k) => t.includes(k),
      ),
    )
  )
    return "competition"
  if (
    lower.some((t) =>
      [
        "gdpr", "privacy", "data-protection", "dpdpa", "edpb", "duaa",
        "data_protection", "lgpd", "anpd", "data-privacy",
      ].some((k) => t.includes(k)),
    )
  )
    return "data"
  return "regulatory"
}

// ── Status mapping ────────────────────────────────────────────────────────────

const STATUS_KEY_MAP = {
  developing: "developing",
  enforced: "enforced",
  adopted: "adopted",
  pending: "pending",
  "under investigation": "investigation",
  "under-investigation": "investigation",
}

function mapStatus(statusStr, priority) {
  if (!statusStr) {
    // Infer from priority when not set
    if (priority === "CRITICAL") return "investigation"
    if (priority === "HIGH") return "developing"
    return "developing"
  }
  const key = statusStr.toLowerCase().trim()
  return STATUS_KEY_MAP[key] || STATUS_KEY_MAP[key.replace(/\s+/g, "-")] || "developing"
}

// ── Kicker derivation ─────────────────────────────────────────────────────────

function deriveKicker(kicker, tags, priority, category) {
  if (kicker) return String(kicker).toUpperCase()
  const lower = (tags || []).map((t) => String(t).toLowerCase())
  if (category === "competition") {
    if (lower.some((t) => t.includes("cartel"))) return "CARTEL"
    if (lower.some((t) => t.includes("antitrust"))) return "ANTITRUST"
    if (lower.some((t) => t.includes("dma"))) return "DMA ENFORCEMENT"
    if (lower.some((t) => t.includes("cma"))) return "MARKET INVESTIGATION"
    if (lower.some((t) => t.includes("cci"))) return "COMPETITION"
    if (lower.some((t) => t.includes("cade"))) return "ANTITRUST"
    return "COMPETITION"
  }
  if (category === "data") {
    if (lower.some((t) => t.includes("gdpr"))) return "GDPR ENFORCEMENT"
    if (lower.some((t) => t.includes("dpdpa"))) return "DATA PROTECTION"
    if (lower.some((t) => t.includes("lgpd") || t.includes("anpd"))) return "DATA PROTECTION"
    if (lower.some((t) => t.includes("edpb"))) return "GDPR GUIDANCE"
    return "DATA & PRIVACY"
  }
  if (category === "ip") {
    if (lower.some((t) => t.includes("sep") || t.includes("frand") || t.includes("patent")))
      return "PATENT LAW"
    if (lower.some((t) => t.includes("copyright"))) return "COPYRIGHT"
    return "IP LAW"
  }
  if (category === "regulatory") {
    if (lower.some((t) => t.includes("ai"))) return "AI REGULATION"
    if (lower.some((t) => t.includes("legislative") || t.includes("bill"))) return "LEGISLATIVE"
    return "REGULATORY"
  }
  if (priority === "CRITICAL") return "CRITICAL ALERT"
  return "UPDATE"
}

// ── Category accent colours (must match index.html C constants) ──────────────

const CATEGORY_COLORS = {
  trending: "#93739C",
  competition: "#C0392B",
  data: "#7D3C98",
  ip: "#1E6B50",
  regulatory: "#B8860B",
}

// ── Date formatting ───────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return ""
  try {
    const parsed = new Date(d)
    if (isNaN(parsed.getTime())) return String(d)
    return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return String(d)
  }
}

// ── Extract summary from body when frontmatter summary is absent ──────────────

function extractBodySummary(content) {
  // Strip frontmatter block
  const withoutFm = content.replace(/^---[\s\S]*?---\n?/, "").trim()
  const lines = withoutFm.split("\n")
  for (const line of lines) {
    const l = line.trim()
    // Skip headings, bullet metadata lines, horizontal rules, empty lines, source lines
    if (!l) continue
    if (l.startsWith("#")) continue
    if (l.startsWith("- **")) continue
    if (l.startsWith("**Source")) continue
    if (l === "---") continue
    if (l.length < 40) continue
    // First substantial paragraph
    return l.length > 280 ? l.slice(0, 280) + "…" : l
  }
  return ""
}

// ── JavaScript string literal (double-quoted, escaped) ───────────────────────

function jsStr(s) {
  return JSON.stringify(String(s || ""))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const files = (await readdir(UPDATES_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse() // newest first (files are YYYY-MM-DD-slug.md)

  const grouped = { trending: [], competition: [], data: [], ip: [], regulatory: [] }

  for (const file of files) {
    const raw = await readFile(join(UPDATES_DIR, file), "utf8")
    const { data: fm, content: body } = matter(raw)

    // Skip briefing/narrative files (no real article structure)
    const tags = Array.isArray(fm.tags) ? fm.tags : []
    const lowerTags = tags.map((t) => String(t).toLowerCase())
    const isBriefing =
      lowerTags.includes("briefing") ||
      (lowerTags.includes("trending") && !fm.source_url && !fm.summary)
    if (isBriefing) continue

    const priority = String(fm.priority || "MEDIUM").toUpperCase()
    const category = getCategory(tags, priority)
    const statusKey = mapStatus(fm.status, priority)
    const kicker = deriveKicker(fm.kicker, tags, priority, category)
    const kickerColor =
      category === "trending"
        ? CATEGORY_COLORS[getCategory(tags.filter((t) => !["trending", "briefing"].includes(t.toLowerCase())), priority)] ||
          CATEGORY_COLORS.competition
        : CATEGORY_COLORS[category]
    const summary = fm.summary
      ? String(fm.summary).replace(/^["']|["']$/g, "")
      : extractBodySummary(raw)

    const article = {
      headline: String(fm.title || "Untitled"),
      source: String(fm.source || ""),
      date: formatDate(fm.date),
      source_url: String(fm.source_url || ""),
      statusKey,
      jurisdiction: String(fm.region || ""),
      signal: String(fm.signal || "").replace(/^["']|["']$/g, ""),
      kicker,
      kickerColor,
      priority,
      summary,
    }

    grouped[category].push(article)
  }

  // ── Mark featured article in trending ──────────────────────────────────────
  // CRITICAL first, then HIGH — first in list gets featured:true
  const trendingOrder = [...grouped.trending].sort((a, b) => {
    const p = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return (p[a.priority] ?? 3) - (p[b.priority] ?? 3)
  })

  // If trending is empty, seed it with top CRITICAL articles from other tabs
  if (trendingOrder.length === 0) {
    for (const cat of ["competition", "data", "ip", "regulatory"]) {
      const criticals = grouped[cat].filter((a) => a.priority === "CRITICAL")
      trendingOrder.push(...criticals)
    }
    trendingOrder.sort((a, b) => {
      const p = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return (p[a.priority] ?? 3) - (p[b.priority] ?? 3)
    })
  }

  if (trendingOrder.length > 0) trendingOrder[0]._featured = true
  grouped.trending = trendingOrder

  // ── Render JS object literal ───────────────────────────────────────────────
  function renderArticle(a) {
    const featuredProp = a._featured ? "featured:true," : ""
    return (
      `    { ` +
      `headline:${jsStr(a.headline)},` +
      `source:${jsStr(a.source)},` +
      `date:${jsStr(a.date)},` +
      `source_url:${jsStr(a.source_url)},` +
      `status:STATUS.${a.statusKey},` +
      `jurisdiction:${jsStr(a.jurisdiction)},` +
      `signal:${jsStr(a.signal)},` +
      `kicker:${jsStr(a.kicker)},` +
      `kickerColor:${jsStr(a.kickerColor)},` +
      `${featuredProp}` +
      `summary:${jsStr(a.summary)}` +
      ` }`
    )
  }

  const tabKeys = ["trending", "competition", "data", "ip", "regulatory"]
  const articlesLiteral =
    `const articles = {\n` +
    tabKeys
      .map(
        (k) =>
          `  ${k}:[\n` +
          grouped[k].map(renderArticle).join(",\n") +
          `\n  ]`,
      )
      .join(",\n") +
    `\n};`

  // ── Inject into template ───────────────────────────────────────────────────
  const template = await readFile(TEMPLATE_PATH, "utf8")
  const output = template.replace(/\/\/ ARTICLES_DATA_PLACEHOLDER[\s\S]*?\/\/ END_ARTICLES_DATA/, articlesLiteral)

  if (output === template) {
    throw new Error(
      "Template placeholder not found. Expected:\n" +
        "// ARTICLES_DATA_PLACEHOLDER\n...\n// END_ARTICLES_DATA\n" +
        "in index.template.html",
    )
  }

  await writeFile(OUTPUT_PATH, output, "utf8")
  const total = tabKeys.reduce((n, k) => n + grouped[k].length, 0)
  console.log(`✓ index.html rebuilt with ${total} articles across ${tabKeys.length} tabs`)
  for (const k of tabKeys) {
    console.log(`  ${k}: ${grouped[k].length}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
