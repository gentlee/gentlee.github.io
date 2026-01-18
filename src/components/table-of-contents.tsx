'use client'

import '../app/globals.css'

import {Fragment, memo, useEffect, useRef, useState} from 'react'

import {Footer} from '~/components/footer'
import {NavigationBar} from '~/components/navigation-bar'
import {Language} from '~/utils/constants'

type Props = {
  lang: Language
  items: {id: string; title: string; titlePlain?: string}[]
}

export const TableOfContents = memo(function TableOfContentsInner({lang, items}: Props) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentItemId, setCurrentItemId] = useState<string>(items[0].id)
  const updatingCurrentRef = useRef(false)

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
    if (!isVisible) {
      return
    }

    const listener = (event?: unknown) => {
      if (updatingCurrentRef.current) {
        return
      }

      updatingCurrentRef.current = true

      const update = () => {
        const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
        const closestLiId = centerElement?.closest('li')?.id
        if (closestLiId) {
          setCurrentItemId(closestLiId)
        }
        updatingCurrentRef.current = false
      }

      if (event) {
        setTimeout(update, 64)
      } else {
        update()
      }
    }

    document.addEventListener('scroll', listener, {passive: true})
    listener()

    return () => {
      document.removeEventListener('scroll', listener)
    }
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div
      aria-hidden
      className="hidden toc:block sticky h-0 w-[260px] overflow-visible top-[var(--s-gap)] ml-[calc(50%-260px-var(--max-content-w)/2)] mt-[var(--s-gap)] -mb-[var(--s-gap)]"
    >
      <div className="bg-background big-shadow !p-0 !gap-0">
        <div style={{width: HEADER_FOOTER_WIDTH, height: 23}}>
          <NavigationBar lang={lang} subpath="articles" scale={HEADER_FOOTER_SCALE} />
        </div>

        <ul className="flex flex-col">
          {items.map((x, i) => {
            const isCurrent = currentItemId === x.id
            return (
              <Fragment key={x.id}>
                {i !== 0 && <div className="separator mx-4" />}
                <li
                  style={isCurrent ? {fontWeight: 'bold'} : undefined}
                  className="cursor-pointer py-2 px-4 [&_strong]:text-[var(--accent)]"
                  onClick={() => document.getElementById(x.id)?.scrollIntoView()}
                  dangerouslySetInnerHTML={{
                    __html: isCurrent ? '> ' + x.title : (x.titlePlain ?? x.title),
                  }}
                />
              </Fragment>
            )
          })}
        </ul>

        <div style={{width: HEADER_FOOTER_WIDTH, height: 17}}>
          <Footer lang={lang} scale={HEADER_FOOTER_SCALE} />
        </div>
      </div>
    </div>
  )
})

const TOGGLE_VISIBLE_WIDTH = 1451
const HEADER_FOOTER_WIDTH = 1200
const HEADER_FOOTER_SCALE = 245 / HEADER_FOOTER_WIDTH
