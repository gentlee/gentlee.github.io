import './article.css'

import {Metadata} from 'next'
import Link from 'next/link'

import {Support} from '~/components/donate-modal'
import {LikeButton} from '~/components/like-button'
import {NavigationBar} from '~/components/navigation-bar'
import {TableOfContents} from '~/components/table-of-contents'
import {getArticleHtmlAndFrontmatter, getArticleSlugs, getUrlForArticleImage} from '~/fs/articles'
import {Source} from '~/fs/articles'
import {s} from '~/localization'
import {addArticleHeadingIds} from '~/utils/article-headings'
import {Language, LANGUAGES} from '~/utils/constants'
import {fixedsysFont} from '~/utils/fonts'
import {highlightCode} from '~/utils/highlight-code'

type Props = {
  params: Promise<{slug: string; lang: Language}>
}

const ArticlePage = async (props: Props) => {
  const {slug, lang} = await props.params

  const {frontmatter, html} = await getArticleHtmlAndFrontmatter(slug, lang)

  const {html: htmlWithHighlightedCode, items} = addArticleHeadingIds(highlightCode(html))

  return (
    <>
      <NavigationBar lang={lang} subpath={`articles/${slug}` as 'articles/${slug}'} />
      <TableOfContents lang={lang} items={items} subpath={`articles/${slug}`} />
      <div className="content">
        <main className="big-shadow bg-background">
          <h1
            dangerouslySetInnerHTML={{
              __html: `${frontmatter.title} [${new Date(frontmatter.date).toLocaleDateString([lang])}]`,
            }}
          />
          <Support />
          <article dangerouslySetInnerHTML={{__html: htmlWithHighlightedCode}} />
          <LikeButton lang={lang} />
        </main>

        {!!frontmatter.links && (
          <div className={`flex flex-row flex-wrap justify-end gap-[var(--b-shadow)]`}>
            {frontmatter.links.map((x) => {
              const name = Object.keys(x)[0] as Source
              const link = x[name]

              // HACK to make dynamic styles work: bg-npm bg-github bg-instagram bg-linkedin bg-habr
              return (
                <Link
                  className={`${fixedsysFont.className} bg-${[name.replace('discuss-', '')]} big-button big-shadow w-fi ${name === 'npm' ? 'text-white' : ''}`}
                  key={name}
                  href={link}
                  lang={lang}
                  hrefLang={name === 'discuss-habr' ? 'ru' : 'en'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s(lang, name)}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export const generateStaticParams = async () => {
  const slugs = await getArticleSlugs()

  return LANGUAGES.reduce(
    (result, lang) => {
      result.push(...slugs.map((slug) => ({slug, lang})))
      return result
    },
    [] as Awaited<Props['params']>[],
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const {slug, lang} = await props.params

  const {frontmatter, folderName} = await getArticleHtmlAndFrontmatter(slug, lang)

  return {
    title: frontmatter.titlePlain,
    description: frontmatter.spoilerPlain,
    openGraph: {
      type: 'article',
      title: frontmatter.titlePlain,
      locale: lang,
      siteName: s(lang, 'home-title'),
      authors: s(lang, 'full-name'),
      publishedTime: frontmatter.date,
      images: {
        url: getUrlForArticleImage(frontmatter.cover, folderName),
        alt: frontmatter['cover-alt'],
      },
    },
  }
}

export default ArticlePage
