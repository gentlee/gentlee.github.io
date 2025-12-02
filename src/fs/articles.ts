import fs from 'fs/promises'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'
import yaml from 'yaml'

import {baseurl} from '~/assets/info.json'
import {Language} from '~/utils/constants'

export type Source = 'npm' | 'github' | 'discuss-github' | 'discuss-habr'

export const getArticleSlugs = async () => {
  const folderNames = (await fs.readdir('articles', {withFileTypes: true}))
    .filter((x) => x.isDirectory() && !x.name.startsWith('!')) // ! means in progress.
    .map((x) => x.name)
  folderNames.sort().reverse() // Use dates for sorting.

  const slugs = folderNames.map((x) => x.slice('2024-01-01-'.length)) // We don't want dates in url path.
  return slugs
}

export const getArticleHtmlAndFrontmatter = async (slug: string, lang: Language) => {
  const folderName = (await fs.readdir('articles')).find((x) => x.endsWith(slug))! // Contains date and slug.

  const parsedArticle = await unified()
    .use(remarkParse) // Parse markdown.
    .use(remarkGfm) // Enable github flavored markdown (tables).
    .use(remarkFrontmatter) // Parse frontmatter.
    .use(remarkExtractFrontmatter, {yaml: yaml.parse, remove: true}) // Extract frontmatter.
    .use(remarkRehype, {allowDangerousHtml: true}) // Allow raw HTML in markdown (details, summary).
    .use(rehypeRaw) // Process raw HTML in markdown (details, summary).
    .use(rehypeStringify) // Serialize HTML.
    .process(await fs.readFile(`articles/${folderName}/${lang}.md`, 'utf-8'))

  const frontmatter = parsedArticle.data as {
    title: string
    date: string
    cover: string
    'cover-alt': string
    spoiler: string
    links?: Record<Source, string>[]
  }

  return {
    slug,
    folderName,
    frontmatter: {
      ...frontmatter,
      titlePlain: removeXml(frontmatter.title),
      spoilerPlain: removeXml(frontmatter.spoiler),
    },
    html: parsedArticle.toString(),
  }
}

export const getUrlForArticleImage = (image: string, folder: string) => {
  return `${baseurl}articles/${folder}/${image}`
}

const removeXml = (data: string) => {
  return data.replace(/<[^>]*>/g, '')
}
