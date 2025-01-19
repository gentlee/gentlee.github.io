import {Fira_Code, Fira_Sans} from 'next/font/google'
import localFont from 'next/font/local'

export const fixedsysFont = localFont({
  variable: '--fixedsys',
  src: '../assets/fonts/fixedsys.ttf',
})

export const firaSansFont = Fira_Sans({
  variable: '--fira-sans',
  weight: ['400', '700'],
  subsets: ['latin', 'cyrillic'],
})

export const firaCodeFont = Fira_Code({
  variable: '--fira-code',
  weight: ['400', '700'],
  subsets: ['latin', 'cyrillic'],
})
