'use client'

import {memo, useEffect, useRef, useState} from 'react'

import {Footer} from '~/components/footer'
import {NavigationBar} from '~/components/navigation-bar'
import {Language} from '~/utils/constants'
import {
  getCurrentSection,
  getSectionClickScrollTop,
  getSectionScrollTop,
  getSectionSelectionTop,
} from '~/utils/section-scroll'
import {splitTitleLines} from '~/utils/split-title-lines'

type Props = {
  lang: Language
  items: {id: string; title: string; titlePlain?: string; level?: number}[]
  subpath?: `articles/${string}` | 'articles'
}

// AI-assisted; not deeply reviewed by a human.
/** Render article navigation with stable title lines and position-based selection. */
export const TableOfContents = memo(function TableOfContentsInner({
  lang,
  items,
  subpath = 'articles',
}: Props) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentItemId, setCurrentItemId] = useState(items[0]?.id)
  const listRef = useRef<HTMLUListElement>(null)
  const [titleLines, setTitleLines] = useState<Record<string, string[]>>({})

  // Keep title measurements in sync with font loading and viewport changes.
  useEffect(() => {
    if (!isVisible) {
      return
    }
    let cancelled = false
    /** Recompute fixed title lines after fonts load or the viewport changes. */
    const measure = () => {
      if (cancelled || !listRef.current) {
        return
      }
      const links = listRef.current.querySelectorAll('a')
      setTitleLines(
        Object.fromEntries(
          items.map((item, index) => [item.id, splitTitleLines(item.title, links[index], 16)]),
        ),
      )
    }
    void document.fonts.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [isVisible, items])

  useEffect(() => {
    const mediaListener = (event: {matches: boolean}) => {
      setIsVisible(!event.matches)
    }

    const mediaQuery = window.matchMedia(`(max-width: ${TOGGLE_VISIBLE_WIDTH}px)`)
    mediaQuery.addEventListener('change', mediaListener)
    setIsVisible(!mediaQuery.matches)

    return () => mediaQuery.removeEventListener('change', mediaListener)
  }, [])

  // Track the active section from document geometry and clean up event subscriptions.
  useEffect(() => {
    if (!isVisible || items.length === 0) {
      return
    }

    let timeout: ReturnType<typeof setTimeout> | undefined
    /** Select the section whose reading threshold has been reached. */
    const update = () => {
      timeout = undefined
      const scrollingElement = document.scrollingElement ?? document.documentElement
      const positions = getScrollPositions(items, scrollingElement, subpath !== 'articles', true)
      const current = getCurrentSection(
        positions,
        scrollingElement.scrollTop,
        scrollingElement.scrollHeight - scrollingElement.clientHeight,
      )
      setCurrentItemId(items[current].id)
    }
    /** Coalesce scroll, resize, and hash events into one pending update. */
    const listener = () => {
      timeout ??= setTimeout(update, 64)
    }
    document.addEventListener('scroll', listener, {passive: true})
    window.addEventListener('resize', listener)
    window.addEventListener('hashchange', listener)
    update()

    return () => {
      document.removeEventListener('scroll', listener)
      window.removeEventListener('resize', listener)
      window.removeEventListener('hashchange', listener)
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
    }
  }, [isVisible, items, subpath])

  if (!isVisible || items.length === 0) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      style={{overflowAnchor: 'none'}}
      className="hidden toc:block w-fit sticky h-0 overflow-visible top-[var(--s-gap)] ml-[calc(50%-260px-var(--max-content-w)/2)] mt-[var(--s-gap)] -mb-[var(--s-gap)]"
    >
      <div className="bg-background big-shadow p-0! gap-0!">
        <div style={CONTENT_WIDTH_STYLE}>
          <div className="overflow-hidden" style={{height: HEADER_HEIGHT}}>
            <div style={{width: HEADER_FOOTER_WIDTH}}>
              <NavigationBar
                lang={lang}
                subpath={subpath as 'articles/${slug}'}
                scale={HEADER_FOOTER_SCALE}
              />
            </div>
          </div>

          <ul ref={listRef} className="overflow-y-auto" style={LIST_STYLE}>
            {items.map((x, i) => {
              const isCurrent = currentItemId === x.id
              return (
                <li key={x.id}>
                  {i !== 0 && <div className="separator mx-4" />}
                  <a
                    href={`#${x.id}`}
                    tabIndex={-1}
                    onMouseDown={(event) => {
                      // A focused link in the scrolling sidebar can move the page when its text reflows.
                      if (event.button === 0) {
                        event.preventDefault()
                      }
                    }}
                    onClick={(event) => {
                      // Update the fragment and scroll within the selected section’s activation interval.
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                        return
                      }
                      const target = document.getElementById(x.id)
                      if (!target) {
                        return
                      }
                      event.preventDefault()
                      window.history.pushState(window.history.state, '', `#${encodeURIComponent(x.id)}`)
                      const scrollingElement = document.scrollingElement ?? document.documentElement
                      const maxScroll = Math.max(
                        0,
                        scrollingElement.scrollHeight - scrollingElement.clientHeight,
                      )
                      const headingTop = target.getBoundingClientRect().top + scrollingElement.scrollTop
                      window.scrollTo({
                        top: getSectionClickScrollTop(
                          getScrollPositions(items, scrollingElement, subpath !== 'articles', true),
                          i,
                          maxScroll,
                          subpath !== 'articles' && headingTop - 16 > maxScroll,
                          getScrollPositions(items, scrollingElement, subpath !== 'articles')[i],
                        ),
                        behavior: 'instant',
                      })
                    }}
                    style={{
                      display: 'block',
                      fontWeight: isCurrent ? 'bold' : undefined,
                    }}
                    className={`py-2 px-4 [&_strong]:text-[var(--accent)] ${x.level === 3 ? 'pl-7' : ''}`}
                  >
                    {(titleLines[x.id] ?? [x.title]).map((line, lineIndex) => (
                      <span
                        key={lineIndex}
                        style={{display: 'block', whiteSpace: titleLines[x.id] ? 'nowrap' : undefined}}
                      >
                        {lineIndex === 0 && isCurrent && (
                          <span style={{display: 'inline-block', width: 16, whiteSpace: 'pre'}}>{'> '}</span>
                        )}
                        <span dangerouslySetInnerHTML={{__html: line}} />
                      </span>
                    ))}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="overflow-hidden" style={{height: FOOTER_HEIGHT}}>
            <div style={{width: HEADER_FOOTER_WIDTH}}>
              <Footer lang={lang} scale={HEADER_FOOTER_SCALE} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// AI-assisted; not deeply reviewed by a human.
/** Measure section boundaries and derive selection thresholds or ordered click destinations. */
const getScrollPositions = (
  items: Props['items'],
  scrollingElement: Element,
  allowBottomAlignment: boolean,
  forSelection = false,
) => {
  const elements = items.map((item) => document.getElementById(item.id))
  const tops = elements.map(
    (element) => (element?.getBoundingClientRect().top ?? 0) + scrollingElement.scrollTop,
  )
  if (forSelection) {
    return tops.map((top, index) =>
      index === 0
        ? 0
        : getSectionSelectionTop(top, scrollingElement.clientHeight, scrollingElement.scrollHeight),
    )
  }
  let previous = -2
  return items.map((item, index) => {
    // Include nested headings in the section and keep destinations in document order.
    const nextIndex = items.findIndex((next, i) => i > index && (next.level ?? 2) <= (item.level ?? 2))
    const article = elements[index]?.closest('article')
    const end =
      nextIndex >= 0
        ? tops[nextIndex] - 16
        : article
          ? article.getBoundingClientRect().bottom + scrollingElement.scrollTop
          : scrollingElement.scrollHeight
    const desired = getSectionScrollTop(
      {id: item.id, top: tops[index], end: Math.max(tops[index], end)},
      index,
      items.length,
      scrollingElement.clientHeight,
      scrollingElement.scrollHeight,
      allowBottomAlignment,
    )
    // Adjacent sections must not acquire reversed landing positions.
    previous = Math.min(
      Math.max(0, scrollingElement.scrollHeight - scrollingElement.clientHeight),
      Math.max(previous + 2, desired),
    )
    return previous
  })
}

const CONTENT_WIDTH_STYLE = {width: 245, overflow: 'hidden'}
const TOGGLE_VISIBLE_WIDTH = 1451
const HEADER_FOOTER_WIDTH = 1200
const HEADER_FOOTER_SCALE = CONTENT_WIDTH_STYLE.width / HEADER_FOOTER_WIDTH
const HEADER_HEIGHT = 21
const FOOTER_HEIGHT = 17
// Bound the list itself so its rows keep their natural height in every browser.
const LIST_STYLE = {
  maxHeight: `calc(100dvh - var(--s-gap) - var(--s-gap) - var(--b-shadow) - var(--border-width) - var(--border-width) - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
}
