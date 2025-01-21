'use client'

import Image from 'next/image'
import {MouseEventHandler, useState} from 'react'

import info from '~/assets/info.json'
import {s} from '~/localization'
import {Language} from '~/utils/constants'
import {fixedsysFont} from '~/utils/fonts'

type Coin = 'btc' | 'eth' | 'usdt-tron' | 'ton' | 'doge'

export const DonateModal = ({lang}: {lang: Language}) => {
  const [selectedCoin, setSelectedCoin] = useState(info.coins[0] as Coin)
  const [currentToastTimeout, setCurrentToastTimeout] = useState<NodeJS.Timeout>()

  const onOpenedDialogClick: MouseEventHandler<HTMLDialogElement> = (e) => {
    if ([DONATE_MODAL_ID, CLOSE_DONATE_MODAL_BUTTON_ID].includes((e.nativeEvent.target as HTMLElement)?.id)) {
      ;(document.getElementById(DONATE_MODAL_ID) as HTMLDialogElement)?.close()
    }
  }

  const onCoinClick = (coin: Coin) => {
    const button = document.getElementById(coin)
    if (!button) {
      return
    }

    // Select coin
    setSelectedCoin(coin)

    // Copy to clipboard
    navigator.clipboard.writeText(getAddress(coin))

    // Show toast and hide after timeout
    if (currentToastTimeout !== undefined) {
      clearTimeout(currentToastTimeout)
    }
    setCurrentToastTimeout(setTimeout(setCurrentToastTimeout, 1000, undefined))
  }

  return (
    <dialog
      id={DONATE_MODAL_ID}
      className="bg-transparent text-[--foreground]"
      aria-modal={true}
      aria-labelledby={DONATE_LABEL_ID}
      onClick={onOpenedDialogClick}
    >
      <div
        role="radiogroup"
        className={`${fixedsysFont.className} text-[18px] !px-[--l-gap] !py-[--s-gap] !gap-[28px] big-shadow bg-white dark:bg-black max-w-full flex flex-col flex-wrap items-center justify-center`}
      >
        <div id={DONATE_LABEL_ID} className="flex flex-col items-center gap-[8px]">
          <h2 className={`${fixedsysFont.className} leading-none mb-[-5px]`}>{s(lang, 'donate')}</h2>
          <span id={HINT_ID} className={`${fixedsysFont.className} leading-none text-[18px] text-center`}>
            {' (' + s(lang, 'click-to-select-and-copy') + ')'}
          </span>
        </div>

        <div className="flex items-center justify-center">
          {/* Render all for preload and fast switch */}
          {(info.coins as Coin[]).map((coin) => {
            return (
              <Image
                key={coin}
                className={`dark:invert ${coin !== selectedCoin ? 'hidden' : ''}`}
                src={`/images/${coin}.webp`}
                alt={`${s(lang, 'qr-code-for')} ${s(lang, selectedCoin)}`}
                width={200}
                height={200}
                priority
              />
            )
          })}
          <span className="uppercase text-[28px] absolute max-w-[60px] text-wrap leading-none">
            {selectedCoin.replace('-', ' ')}
          </span>
        </div>

        {(info.coins as Coin[]).map((coin) => {
          const isSelected = coin === selectedCoin
          const showToast = isSelected && currentToastTimeout !== undefined

          return (
            <button
              role="radio"
              id={coin}
              key={coin + isSelected}
              onClick={() => onCoinClick(coin)}
              className="flex text-start w-full leading-none whitespace-pre pr-[18px]"
              aria-label={`${s(lang, 'crypto-address-for')} ${s(lang, coin)}`}
              aria-describedby={HINT_ID}
              aria-checked={isSelected}
            >
              <span className="whitespace-pre">{(isSelected ? '> ' : '  ') + s(lang, coin) + ': '}</span>
              {showToast ? (
                /* Keeping the same width with fillSpaces */
                fillSpaces(s(lang, 'copied') + '!', getAddress(coin).length)
              ) : (
                <>
                  <span className="overflow-hidden text-ellipsis">{info[`${coin}1`]}</span>
                  {/* rtl for ellipsis in the middle */}
                  <span dir="rtl" className="overflow-hidden">
                    {info[`${coin}2`]}
                  </span>
                </>
              )}
            </button>
          )
        })}

        <button id={CLOSE_DONATE_MODAL_BUTTON_ID} autoFocus className="small-button small-shadow">
          {s(lang, 'close')}
        </button>
      </div>
    </dialog>
  )
}

/** Returns string that starts with input and is filled with spaces to match provided size. */
const fillSpaces = (input: string, size: number) => {
  return input + ' '.repeat(size - input.length)
}

const getAddress = (coin: Coin) => {
  return info[`${coin}1`] + info[`${coin}2`]
}

export const DONATE_MODAL_ID = 'donate-modal'
const CLOSE_DONATE_MODAL_BUTTON_ID = 'close-donate-modal-button'
const DONATE_LABEL_ID = 'donate-label'
const HINT_ID = 'hint'
