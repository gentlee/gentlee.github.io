'use client'

import Image from 'next/image'

import {DONATE_MODAL_ID} from '~/components/donate-modal'
import {s} from '~/localization'
import {Language} from '~/utils/constants'

export const DonateButton = ({lang}: {lang: Language}) => {
  const openDialog = () => {
    ;(document.getElementById(DONATE_MODAL_ID) as HTMLDialogElement)?.showModal()
  }

  return (
    <button
      aria-label={s(lang, 'open-donate-modal')}
      aria-haspopup="dialog"
      className="h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] active:scale-90"
      onClick={openDialog}
    >
      <Image
        className="inline h-[32px] w-[24px] sm:h-[40px] sm:w-[30px]"
        src={`/images/donation.webp`}
        alt={s(lang, 'donate')}
        width={32}
        height={24}
      />
    </button>
  )
}
