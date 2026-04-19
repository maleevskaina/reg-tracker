import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"

function getCategory(tags: string[]): string {
  const lower = tags.map((t) => t.toLowerCase())
  if (lower.some((t) => t === "trending" || t === "briefing")) return "trending"
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
      ["gdpr", "privacy", "data-protection", "data protection", "dpdpa", "edpb", "duaa", "data-use"].some(
        (k) => t.includes(k),
      ),
    )
  )
    return "data-privacy"
  if (
    lower.some((t) =>
      ["patent", "copyright", "sep", "frand", "trademark", "inventorship", "ip-law"].some((k) =>
        t.includes(k),
      ),
    )
  )
    return "ip-law"
  return "regulatory-changes"
}

function statusClass(status: string): string {
  const s = status.toLowerCase().replace(/\s+/g, "-")
  return `status-${s}`
}

function formatDate(d: unknown): string {
  if (!d) return ""
  try {
    const parsed = new Date(d as string)
    return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return String(d)
  }
}

interface CardData {
  page: QuartzPluginData
  href: string
}

function ArticleCard({ page, href, idx }: CardData & { idx: number }) {
  const fm = (page.frontmatter ?? {}) as Record<string, unknown>
  const title = (fm.title as string) ?? "Untitled"
  const kicker = (fm.kicker as string) ?? ""
  const status = (fm.status as string) ?? ""
  const region = (fm.region as string) ?? ""
  const signal = (fm.signal as string) ?? ""
  const source = (fm.source as string) ?? ""
  const summary = (fm.summary as string) ?? page.description ?? ""
  const date = formatDate(fm.date)
  const sourceUrl = (fm.source_url as string) ?? ""
  const priority = (fm.priority as string) ?? ""

  return (
    <article class={`reg-card ${priority === "CRITICAL" ? "reg-card--critical" : ""}`} style={`--card-idx:${idx}`}>
      <div class="card-top">
        {kicker && <span class="card-kicker">{kicker.toUpperCase()}</span>}
        {status && <span class={`status-tag ${statusClass(status)}`}>{status}</span>}
        {region && <span class="jurisdiction-badge">{region}</span>}
      </div>
      <h3 class="card-headline">
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{title}</a>
        ) : (
          <a href={href} class="internal">{title}</a>
        )}
      </h3>
      {summary && <p class="card-summary">{summary}</p>}
      <div class="card-footer">
        <span class="card-source-wrap">
          {sourceUrl ? (
            <a href={sourceUrl} class="card-source" target="_blank" rel="noopener">{source}</a>
          ) : (
            <span class="card-source">{source}</span>
          )}
        </span>
        {date && <span class="card-date">{date}</span>}
        {signal && <span class="signal-ref">{signal}</span>}
      </div>
    </article>
  )
}

function HeroCard({ page, href }: CardData) {
  const fm = (page.frontmatter ?? {}) as Record<string, unknown>
  const title = (fm.title as string) ?? "Untitled"
  const kicker = (fm.kicker as string) ?? ""
  const status = (fm.status as string) ?? ""
  const region = (fm.region as string) ?? ""
  const signal = (fm.signal as string) ?? ""
  const source = (fm.source as string) ?? ""
  const summary = (fm.summary as string) ?? page.description ?? ""
  const date = formatDate(fm.date)
  const sourceUrl = (fm.source_url as string) ?? ""

  return (
    <div class="trending-hero-card">
      <div class="hero-sidebar"></div>
      <div class="hero-body">
        <div class="card-top">
          {kicker && <span class="card-kicker">{kicker.toUpperCase()}</span>}
          {status && <span class={`status-tag ${statusClass(status)}`}>{status}</span>}
          {region && <span class="jurisdiction-badge">{region}</span>}
        </div>
        <h2 class="hero-headline">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{title}</a>
          ) : (
            <a href={href} class="internal">{title}</a>
          )}
        </h2>
        {summary && <p class="hero-summary">{summary}</p>}
        <div class="card-footer">
          <span class="card-source-wrap">
            {sourceUrl ? (
              <a href={sourceUrl} class="card-source" target="_blank" rel="noopener">{source}</a>
            ) : (
              <span class="card-source">{source}</span>
            )}
          </span>
          {date && <span class="card-date">{date}</span>}
          {signal && <span class="signal-ref">{signal}</span>}
        </div>
      </div>
    </div>
  )
}

export default (() => {
  const ProsusArticleFeed: QuartzComponent = ({
    allFiles,
    fileData,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const articles = allFiles
      .filter((f) => f.slug?.startsWith("updates/") && f.slug !== "updates")
      .sort((a, b) => {
        const dA = a.frontmatter?.date ? new Date(a.frontmatter.date as string).getTime() : 0
        const dB = b.frontmatter?.date ? new Date(b.frontmatter.date as string).getTime() : 0
        return dB - dA
      })

    const grouped: Record<string, CardData[]> = {
      trending: [],
      competition: [],
      "data-privacy": [],
      "ip-law": [],
      "regulatory-changes": [],
    }

    for (const page of articles) {
      const tags = (page.frontmatter?.tags as string[]) ?? []
      const cat = getCategory(tags)
      const href = resolveRelative(fileData.slug!, page.slug!)
      if (grouped[cat]) grouped[cat].push({ page, href })
    }

    const tabs = [
      { id: "trending", label: "Trending Today", accent: "#C49A5C" },
      { id: "competition", label: "Competition Law", accent: "#C0392B" },
      { id: "data-privacy", label: "Data & Privacy", accent: "#7D3C98" },
      { id: "ip-law", label: "IP Law", accent: "#1E6B50" },
      { id: "regulatory-changes", label: "Regulatory Changes", accent: "#B8860B" },
    ]

    const counts: Record<string, number> = {}
    for (const t of tabs) counts[t.id] = grouped[t.id].length

    const trendingItems = grouped["trending"]
    const heroItem = trendingItems[0]
    const alsoTrending = trendingItems.slice(1)

    return (
      <div class="prosus-feed" id="prosus-feed">
        {/* ── Sticky Tab Bar ── */}
        <nav class="prosus-nav" id="prosus-nav" aria-label="Topic filter">
          {tabs.map((t) => (
            <button
              class={`prosus-tab ${t.id === "trending" ? "active" : ""}`}
              data-tab={t.id}
              style={`--tab-accent:${t.accent}`}
              aria-selected={t.id === "trending" ? "true" : "false"}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ── Trending Today ── */}
        <section class="tab-panel tab-panel--trending active" data-panel="trending">
          <div class="trending-header">
            <div class="trending-pill">
              <span class="trending-dot"></span>
              <span>TRENDING TODAY</span>
            </div>
            <div class="trending-rule"></div>
          </div>

          {heroItem ? (
            <HeroCard page={heroItem.page} href={heroItem.href} />
          ) : (
            <p class="feed-empty">No trending articles today.</p>
          )}

          {alsoTrending.length > 0 && (
            <>
              <div class="also-trending-header">
                <span>Also Trending</span>
                <div class="also-trending-rule"></div>
              </div>
              <div class="cards-grid">
                {alsoTrending.map((item, i) => (
                  <ArticleCard key={item.page.slug} page={item.page} href={item.href} idx={i} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Other Tab Panels ── */}
        {tabs.slice(1).map((t) => (
          <section class="tab-panel" data-panel={t.id} style={`--panel-accent:${t.accent}`}>
            <div class="panel-header">
              <h2 class="panel-title" style={`color:${t.accent}`}>{t.label}</h2>
              <div class="panel-rule" style={`background:${t.accent}`}></div>
            </div>
            {grouped[t.id].length > 0 ? (
              <div class={`cards-grid ${grouped[t.id].length < 3 ? "cards-grid--single" : ""}`}>
                {grouped[t.id].map((item, i) => (
                  <ArticleCard key={item.page.slug} page={item.page} href={item.href} idx={i} />
                ))}
              </div>
            ) : (
              <p class="feed-empty">No updates in this category today.</p>
            )}
          </section>
        ))}

        {/* ── Status Ticker ── */}
        <div class="status-ticker">
          <div class="ticker-inner">
            <div class="ticker-categories">
              {tabs.slice(1).map((t) => (
                <span class="ticker-item">
                  <span class="ticker-dot" style={`background:${t.accent}`}></span>
                  <span class="ticker-label">{t.label}</span>
                  <span class="ticker-count" style={`color:${t.accent}`}>{counts[t.id]}</span>
                </span>
              ))}
            </div>
            <span class="ticker-updated">
              Last updated <span id="prosus-ticker-date"></span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  ProsusArticleFeed.afterDOMLoaded = `
(function () {
  function initFeed() {
    const tabs = document.querySelectorAll(".prosus-tab");
    const panels = document.querySelectorAll(".tab-panel");
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        panels.forEach(function (p) { p.classList.remove("active"); });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        var panel = document.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (panel) {
          panel.classList.add("active");
          // re-trigger stagger animation
          panel.querySelectorAll(".reg-card").forEach(function (card, i) {
            card.style.animationDelay = (i * 80) + "ms";
            card.classList.remove("animate-in");
            void card.offsetWidth;
            card.classList.add("animate-in");
          });
        }
      });
    });

    // initial stagger
    document.querySelectorAll(".tab-panel.active .reg-card").forEach(function (card, i) {
      card.style.animationDelay = (i * 80) + "ms";
      card.classList.add("animate-in");
    });

    // ticker date
    var el = document.getElementById("prosus-ticker-date");
    if (el) {
      var d = new Date();
      el.textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        + ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " GMT";
    }
  }

  document.addEventListener("nav", initFeed);
  initFeed();
})();
`

  return ProsusArticleFeed
}) satisfies QuartzComponentConstructor
