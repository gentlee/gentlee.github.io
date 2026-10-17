import {JSDOM} from 'jsdom'

// AI-assisted; not deeply reviewed by a human.
/** Assign collision-free heading IDs and extract navigation titles, preserving only strong emphasis. */
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
    title.append(...Array.from(heading.childNodes, (node) => node.cloneNode(true)))
    // Keep emphasis without copying links, IDs, or other heading attributes into navigation.
    for (const element of Array.from(title.querySelectorAll('*')).reverse()) {
      if (element.tagName === 'STRONG') {
        for (const attribute of Array.from(element.attributes)) {
          element.removeAttribute(attribute.name)
        }
      } else {
        element.replaceWith(...element.childNodes)
      }
    }
    return {
      id: heading.id,
      title: title.innerHTML,
      level: Number(heading.tagName.slice(1)),
    }
  })

  return {html: document.body.innerHTML, items}
}
