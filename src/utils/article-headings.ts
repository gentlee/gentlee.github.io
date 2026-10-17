import {JSDOM} from 'jsdom'

// AI-assisted; not deeply reviewed by a human.
/** Assign collision-free heading IDs and extract escaped navigation titles and levels. */
export const addArticleHeadingIds = (html: string) => {
  const {document} = new JSDOM(html).window
  const usedIds = new Set(Array.from(document.querySelectorAll('[id]'), (element) => element.id))
  const items = Array.from(document.querySelectorAll('h2, h3')).map((heading, index) => {
    // Preserve existing anchors and generate a unique anchor only when one is missing.
    if (!heading.id) {
      let id = `section-${index + 1}`
      while (usedIds.has(id)) {
        id += '-section'
      }
      heading.id = id
      usedIds.add(id)
    }

    const title = document.createElement('span')
    title.textContent = heading.textContent
    return {
      id: heading.id,
      title: title.innerHTML,
      level: Number(heading.tagName.slice(1)),
    }
  })

  return {html: document.body.innerHTML, items}
}
