import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ProsusHeader: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <div class="prosus-masthead">
      <div class="masthead-inner">
        <div class="masthead-left">
          <button class="hamburger" id="prosus-hamburger" aria-label="Open menu" aria-expanded="false">
            <span class="ham-bar"></span>
            <span class="ham-bar"></span>
            <span class="ham-bar"></span>
          </button>
          <nav class="masthead-dropdown" id="prosus-dropdown" aria-hidden="true">
            <a href="#">
              Past News Today
              <span class="badge-new">NEW</span>
            </a>
            <a href="#">Weekly Intelligence Brief</a>
            <a href="#">Horizon Scanning</a>
            <a href="#">About DRT</a>
          </nav>
        </div>

        <div class="masthead-brand">
          <a href="/" class="brand-link">
            <span class="brand-prosus">PROSUS</span>
            <span class="brand-divider">|</span>
            <span class="brand-monitor">Regulatory Monitor</span>
          </a>
        </div>

        <div class="masthead-right">
          <span class="masthead-drt">Digital Regulatory Team</span>
          <span class="masthead-date" id="prosus-date"></span>
        </div>
      </div>
      <div class="masthead-accent-line"></div>
    </div>
  )
}

ProsusHeader.css = `
.prosus-masthead {
  display: none;
}
`

ProsusHeader.afterDOMLoaded = `
(function () {
  if (window.__prosusHeaderInit) return;
  window.__prosusHeaderInit = true;

  function setDate() {
    const el = document.getElementById("prosus-date");
    if (!el) return;
    const d = new Date();
    el.textContent = d.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }
  setDate();

  function initHamburger() {
    const btn = document.getElementById("prosus-hamburger");
    const drop = document.getElementById("prosus-dropdown");
    if (!btn || !drop) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const open = btn.classList.toggle("open");
      drop.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      drop.setAttribute("aria-hidden", String(!open));
    });
    document.addEventListener("click", function () {
      btn.classList.remove("open");
      drop.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      drop.setAttribute("aria-hidden", "true");
    });
    drop.addEventListener("click", function (e) { e.stopPropagation(); });
  }
  initHamburger();
})();
`

export default (() => ProsusHeader) satisfies QuartzComponentConstructor
