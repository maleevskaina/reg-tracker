import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "PROSUS | Regulatory Monitor",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: false,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "maleevskaina.github.io/reg-tracker",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "EB Garamond",
        body: "IBM Plex Sans",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#F5EEF0",
          lightgray: "#E2D3D8",
          gray: "#9A8EA0",
          darkgray: "#333044",
          dark: "#030206",
          secondary: "#93739C",
          tertiary: "#C49A5C",
          highlight: "rgba(147, 115, 156, 0.08)",
          textHighlight: "#EBD6DD88",
        },
        darkMode: {
          light: "#1A1F40",
          lightgray: "#2D3260",
          gray: "#6B70A0",
          darkgray: "#C8C0D8",
          dark: "#F0EAF5",
          secondary: "#93739C",
          tertiary: "#C49A5C",
          highlight: "rgba(147, 115, 156, 0.15)",
          textHighlight: "#C49A5C44",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
