import {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'

import {NavigationBar} from '~/components/navigation-bar'
import {TableOfContents} from '~/components/table-of-contents'
import {getArticleHtmlAndFrontmatter, getArticleSlugs} from '~/fs/articles'
import {s} from '~/localization'
import {Language, LANGUAGES} from '~/utils/constants'
import {fixedsysFont} from '~/utils/fonts'

type Props = {
  params: Promise<{lang: Language}>
}

const ArticlesPage = async ({params}: Props) => {
  const {lang} = await params

  const articleSlugs = await getArticleSlugs()
  const articleData = await Promise.all(
    articleSlugs.map(async (slug) => getArticleHtmlAndFrontmatter(slug, lang)),
  )

  return (
    <>
      <NavigationBar lang={lang} subpath="articles" />
      <main>
        <TableOfContents
          lang={lang}
          items={articleData.map((x) => ({
            id: x.slug,
            title: x.frontmatter.shortTitle,
            titlePlain: x.frontmatter.shortTitlePlain,
          }))}
        />

        <ul className="content">
          {articleData.map(({slug, frontmatter, folderName}, index) => {
            const titleId = 'title-' + slug
            const descriptionId = 'description-' + slug

            return (
              <li key={slug} id={slug}>
                <Link
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  className="big-shadow bg-background hover:bg-focus dark:hover:bg-zinc-800"
                  lang={lang}
                  hrefLang={lang}
                  href={`./articles/${slug}`}
                  tabIndex={0}
                >
                  <h2
                    id={titleId}
                    dangerouslySetInnerHTML={{
                      __html: `${frontmatter.title} [${frontmatter.dateLocalized}]`,
                    }}
                  />
                  {/* p to fix image margin. See globals.css. */}
                  <p>
                    <Image
                      className="small-shadow"
                      alt={frontmatter['cover-alt']}
                      src={`/articles/${folderName}/${frontmatter.cover}`}
                      width={809}
                      height={460}
                      priority={index === 0 ? true : false}
                    />
                  </p>
                  <p id={descriptionId} dangerouslySetInnerHTML={{__html: frontmatter.spoiler}} />
                  <span
                    className={`${fixedsysFont.className} touchscreen-only self-center mt-[-8px] leading-none opacity-75 dark:opacity-100 font-bold text-[17px]`}
                  >
                    {`>> ${s(lang, 'tap-to-open')} <<`}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}

export const generateStaticParams = () => LANGUAGES.map((lang) => ({lang}))

export async function generateMetadata(props: Props): Promise<Metadata> {
  const {lang} = await props.params

  const title = s(lang, 'home-title')
  return {
    title,
    openGraph: {
      type: 'website',
      title,
      locale: lang,
    },
  }
}

export default ArticlesPage
