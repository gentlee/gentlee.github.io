'use client'

import {memo, useEffect, useRef, useState} from 'react'

import {Footer} from '~/components/footer'
import {NavigationBar} from '~/components/navigation-bar'
import {Language} from '~/utils/constants'
import {getReadingPoint, getSectionScrollTop} from '~/utils/section-scroll'
import {splitTitleLines} from '~/utils/split-title-lines'

type Props = {
  lang: Language
  items: {id: string; title: string; titlePlain?: string; level?: number}[]
  subpath?: `articles/${string}` | 'articles'
}

export const TableOfContents = memo(function TableOfContentsInner({
  lang,
  items,
  subpath = 'articles',
}: Props) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentItemId, setCurrentItemId] = useState(items[0]?.id)
  const listRef = useRef<HTMLUListElement>(null)
  const [titleLines, setTitleLines] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!isVisible) {
      return
    }
    let cancelled = false
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

  useEffect(() => {
    if (!isVisible || items.length === 0) {
      return
    }

    let timeout: ReturnType<typeof setTimeout> | undefined
    const update = () => {
      timeout = undefined
      const scrollingElement = document.scrollingElement ?? document.documentElement
      const readingPoint = getReadingPoint(
        scrollingElement.scrollTop,
        scrollingElement.clientHeight,
        scrollingElement.scrollHeight,
      )
      let current = items[0].id
      for (const item of items) {
        const element = document.getElementById(item.id)
        if (element && element.getBoundingClientRect().top <= readingPoint + 1) {
          current = item.id
        }
      }
      setCurrentItemId(current)
    }
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
  }, [isVisible, items])

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
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                        return
                      }
                      const target = document.getElementById(x.id)
                      if (!target) {
                        return
                      }
                      event.preventDefault()
                      window.history.pushState(window.history.state, '', `#${encodeURIComponent(x.id)}`)
                      if (i === 0) {
                        window.scrollTo({top: 0, behavior: 'instant'})
                        return
                      }
                      if (i === items.length - 1) {
                        target.scrollIntoView({block: 'start', behavior: 'instant'})
                        return
                      }
                      const scrollingElement = document.scrollingElement ?? document.documentElement
                      const targetRect = target.getBoundingClientRect()
                      // Land inside the heading, rather than on the boundary between two sections.
                      const sectionPosition =
                        targetRect.top + scrollingElement.scrollTop + targetRect.height / 2
                      window.scrollTo({
                        top: getSectionScrollTop(
                          sectionPosition,
                          scrollingElement.clientHeight,
                          scrollingElement.scrollHeight,
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
