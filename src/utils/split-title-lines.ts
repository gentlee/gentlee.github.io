// AI-assisted; not deeply reviewed by a human.
/** Measure the bold title once and retain its inline markup in each fixed line. */
export const splitTitleLines = (html: string, link: HTMLElement, markerWidth: number): string[] => {
  const style = getComputedStyle(link)
  const measure = document.createElement('div')
  Object.assign(measure.style, {
    position: 'fixed',
    visibility: 'hidden',
    pointerEvents: 'none',
    width: `${link.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - markerWidth}px`,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: '700',
  })
  measure.innerHTML = html
  document.body.append(measure)
  try {
    const nodes: Text[] = []
    const walker = document.createTreeWalker(measure, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      nodes.push(walker.currentNode as Text)
    }
    /** Convert offsets in the combined title text into a range spanning its text nodes. */
    const range = (start: number, end: number) => {
      const result = document.createRange()
      let offset = 0
      for (const node of nodes) {
        const next = offset + node.length
        if (start >= offset && start < next) {
          result.setStart(node, start - offset)
        }
        if (end > offset && end <= next) {
          result.setEnd(node, end - offset)
          break
        }
        offset = next
      }
      return result
    }
    const words = [...(measure.textContent ?? '').matchAll(/\S+/g)]
    const lines: {start: number; end: number; top: number}[] = []
    for (const word of words) {
      const start = word.index
      const end = start + word[0].length
      const top = range(start, end).getBoundingClientRect().top
      const last = lines[lines.length - 1]
      if (last && Math.abs(last.top - top) < 1) {
        last.end = end
      } else {
        lines.push({start, end, top})
      }
    }
    return lines.map(({start, end}) => {
      const fragment = document.createElement('span')
      fragment.append(range(start, end).cloneContents())
      return fragment.innerHTML
    })
  } finally {
    measure.remove()
  }
}
