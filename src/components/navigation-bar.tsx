import Link from 'next/link'
import {ComponentProps, Fragment} from 'react'

import {DonateButton} from '~/components/donate-button'
import {DonateModal} from '~/components/donate-modal'
import {selectionArrowElement} from '~/components/selection-arrow'
import {s} from '~/localization'
import {Language, LANGUAGES} from '~/utils/constants'
import {fixedsysFont} from '~/utils/fonts'

export const NavigationBar = ({
  lang,
  subpath,
  scale,
}: {
  lang: Language
  subpath: 'contacts' | 'articles' | 'articles/${slug}'
  scale?: number
}) => {
  const nextLang: Language = lang === 'en' ? 'ru' : 'en'
  const ariaHidden = !!scale
  const tabIndex = ariaHidden ? -1 : undefined

  return (
    <nav
      aria-hidden={ariaHidden}
      style={
        scale
          ? {
              transform: `scale(${scale})`,
              transformOrigin: 'left top',
              userSelect: 'none',
            }
          : undefined
      }
      className={`${fixedsysFont.className} bg-background border-b-[4px] sm:border-b-[13px] dark:border-b-[2px] border-foreground flex flex-row items-start gap-y-2 gap-x-1 p-2 sm:gap-4 sm:p-4`}
    >
      <div className="hidden lg:flex flex-1 gap-2 sm:gap-4 items-center">
        {renderLink({
          'aria-label': s(lang, 'open-home-page'),
          tabIndex,
          href: `/${lang}/articles`,
          lang,
          hrefLang: lang,
          children: s(lang, 'dev-blog'),
          selected: subpath === 'articles',
        })}
      </div>

      <Link
        className="self-center"
        aria-label={s(lang, 'open-home-page')}
        href={`/${lang}/articles`}
        lang={lang}
        hrefLang={lang}
        tabIndex={tabIndex}
      >
        <h1
          className={`${fixedsysFont.className} text-[24px] xs:text-[26px] sm:text-[38px] lg:text-[48px] leading-[1] text-nowrap`}
        >
          <span className="hidden sm:inline">{s(lang, 'full-name')}</span>
          <span className="hidden xs:inline sm:hidden">{s(lang, 'full-name-sm')}</span>
          <span className="xs:hidden">{s(lang, 'full-name-xs')}</span>
        </h1>
      </Link>

      <div className="flex flex-1 gap-1 sm:gap-4 justify-end items-center">
        <DonateButton lang={lang} tabIndex={tabIndex} />
        {!ariaHidden && <DonateModal lang={lang} />}

        {renderLink({
          'aria-label': `${s(lang, 'change-language-to')}${s(lang, nextLang)}`,
          tabIndex,
          href: `/${nextLang}/${subpath}`,
          lang,
          hrefLang: nextLang,
          children: LANGUAGES.map((x, i) => (
            <Fragment key={x}>
              {i !== 0 && ' | '}
              {x === lang && selectionArrowElement}
              {s(x, x)}
            </Fragment>
          )),
        })}
      </div>
    </nav>
  )
}

const renderLink = ({
  selected,
  ...props
}: ComponentProps<typeof Link> & {
  selected?: boolean
}) => {
  return (
    <Link className={`!inline big-shadow big-button whitespace-pre`} aria-current {...props}>
      {selected && selectionArrowElement}
      {props.children}
    </Link>
  )
}
