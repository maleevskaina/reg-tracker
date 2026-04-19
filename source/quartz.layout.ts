import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.ProsusHeader()],
  afterBody: [],
  footer: Component.ProsusFooter(),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [Component.ProsusArticleFeed()],
  left: [],
  right: [],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [],
  right: [],
}
