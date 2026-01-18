import Image from 'next/image'
import Link from 'next/link'

import info from '~/assets/info.json'
import {s} from '~/localization'
import {Language} from '~/utils/constants'
import {fixedsysFont} from '~/utils/fonts'

const ICON_SIZE = 44

export const Footer = ({lang, scale}: {lang: Language; scale?: number}) => {
  const ariaHidden = !!scale
  const tabIndex = ariaHidden ? -1 : undefined

  return (
    <footer
      aria-hidden={!!scale}
      style={
        scale
          ? {
              transform: `scale(${scale})`,
              transformOrigin: 'left top',
              userSelect: 'none',
            }
          : undefined
      }
      className={`${fixedsysFont.className} flex flex-wrap items-center justify-center p-[16px] gap-[16px] text-center bg-background border-t-2 border-foreground min-h-[44px] text-[19px] leading-none mt-auto`}
    >
      <div className="flex items-center gap-[16px]">
        <Link className="active:scale-90" lang={lang} href={'mailto:' + info.email} tabIndex={tabIndex}>
          <Image alt={s(lang, 'email')} src={'/images/email.webp'} width={ICON_SIZE} height={ICON_SIZE} />
        </Link>
        <Link
          className="dark:invert active:scale-90"
          lang={lang}
          hrefLang="en"
          href={'https://www.github.com/gentlee'}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={tabIndex}
        >
          <Image alt={s(lang, 'github')} src={'/images/github.webp'} width={ICON_SIZE} height={ICON_SIZE} />
        </Link>
        <Link
          className="active:scale-90"
          lang={lang}
          hrefLang="en"
          href={'https://www.linkedin.com/in/alexander-d-5a068b97/'}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={tabIndex}
        >
          <Image
            alt={s(lang, 'linkedin')}
            src={'/images/linkedin.webp'}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
        </Link>
        <Link
          className="active:scale-90"
          lang={lang}
          hrefLang="ru"
          href={'https://www.instagram.com/aa.danilov/'}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={tabIndex}
        >
          <Image
            alt={s(lang, 'instagram')}
            src={'/images/instagram.webp'}
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
        </Link>
      </div>

      <span className="flex-1 sm:text-end min-w-[180px]">{`© 2024 - ${new Date().getFullYear()} ${s(lang, 'full-name')}`}</span>

      <div className="flex items-center justify-center gap-[var(--b-shadow)]">
        <a
          className="small-button small-shadow bg-rss"
          lang="en"
          hrefLang="en"
          href="/rss.xml"
          tabIndex={tabIndex}
        >
          RSS
        </a>
        <a
          className="small-button small-shadow bg-atom"
          lang="en"
          hrefLang="en"
          href="/atom.xml"
          tabIndex={tabIndex}
        >
          Atom
        </a>
      </div>
    </footer>
  )
}
