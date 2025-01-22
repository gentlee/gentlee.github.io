import {redirect} from 'next/navigation'

import {s} from '~/localization'

const RedirectToArticles = () => {
  redirect(`/en/articles`)
}

export const generateMetadata = () => {
  return {
    title: s('en', 'redirecting'),
  }
}

export default RedirectToArticles
