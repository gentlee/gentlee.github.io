'use client'

import Image from 'next/image'

import {DONATE_MODAL_ID} from '~/components/donate-modal'
import {s} from '~/localization'
import {Language} from '~/utils/constants'
import {fixedsysFont} from '~/utils/fonts'

export const LikeButton = ({lang}: {lang: Language}) => {
  const openDialog = () => {
    ;(document.getElementById(DONATE_MODAL_ID) as HTMLDialogElement)?.showModal()
  }

  return (
    <button
      aria-haspopup="dialog"
      aria-label={s(lang, 'like-by-donating')}
      className="flex flex-row items-center self-start active:scale-90"
      onClick={openDialog}
    >
      <Image src={`/images/like.webp`} alt={s(lang, 'heart')} width={44} height={44} />
      <span className={`${fixedsysFont.className} text-[19px] text-foreground leading-none ml-3`}>
        {s(lang, 'like')}
      </span>
    </button>
  )
}
