import {Feed} from 'feed'
import fs from 'fs/promises'
import path from 'path'

import {baseurl, email} from '~/assets/info.json'
import {getArticleHtmlAndFrontmatter, getArticleSlugs, getUrlForArticleImage} from '~/fs/articles'
import {s} from '~/localization'

const FEED_SIZE_LIMIT = 30

const generateRssAtom = async () => {
  const slugs = await getArticleSlugs()
  const articles = await Promise.all(
    slugs.slice(0, FEED_SIZE_LIMIT).map((slug) => getArticleHtmlAndFrontmatter(slug, 'en')),
  )

  const feed = new Feed({
    author: {
      name: 'Alexander Danilov',
      email,
      link: baseurl,
    },
    title: s('en', 'home-title'),
    language: 'en',
    feedLinks: {atom: `${baseurl}atom.xml`, rss: `${baseurl}rss.xml`},
    id: baseurl,
    link: baseurl,
    favicon: `${baseurl}favicon.icn`,
    image: 'https://github.com/gentlee.png',
    copyright: 'Alexander Danilov (c)',
  })

  for (const article of articles) {
    const link = `${baseurl}en/articles/${article.slug}/`
    feed.addItem({
      id: link,
      link,
      title: article.frontmatter.titlePlain,
      description: article.frontmatter.spoilerPlain,
      date: new Date(article.frontmatter.date),
      image: getUrlForArticleImage(article.frontmatter.cover, article.folderName),
    })
  }

  await Promise.all(
    (['rss', 'atom'] as const).map(async (type) => {
      const rssPath = path.join(__dirname, '..', '..', 'public', type + '.xml')
      const oldData = await fs.readFile(rssPath, {encoding: 'utf-8'}).catch(() => null)
      const newData = type === 'rss' ? feed.rss2() : feed.atom1()
      const removeDateRegx =
        type === 'rss' ? /\<lastBuildDate\>[^\<]*\<\/lastBuildDate\>/ : /\<updated\>[^\<]*\<\/updated\>/

      // Skip if previous file is the same.
      if (oldData && oldData.replace(removeDateRegx, '') === newData.replace(removeDateRegx, '')) {
        console.log(`Writing ${type.toUpperCase()} skipped - data is equal.`)
        return
      }

      // Write the new file.
      console.log(`Writing ${type.toUpperCase()} to ${rssPath}.`)
      await fs.writeFile(rssPath, newData)
    }),
  )

  console.log('RSS and ATOM feed generation is completed.')
}

generateRssAtom()
