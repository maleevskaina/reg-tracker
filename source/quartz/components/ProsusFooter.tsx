import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ProsusFooter: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <footer class="prosus-footer">
      <div class="footer-inner">
        <span class="footer-brand">PROSUS</span>
        <span class="footer-scope">
          Data &amp; Privacy &nbsp;·&nbsp; Competition &nbsp;·&nbsp; IP &nbsp;·&nbsp; AI Governance &nbsp;·&nbsp; eCommerce
        </span>
      </div>
    </footer>
  )
}

ProsusFooter.css = `
.prosus-footer {
  display: none;
}
`

export default (() => ProsusFooter) satisfies QuartzComponentConstructor
