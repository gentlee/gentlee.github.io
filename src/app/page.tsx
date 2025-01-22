import {redirect} from 'next/navigation'

import {s} from '~/localization'

// "read more" link
// header full name
// check translation
// two modes - list with & without images

const RedirectToArticles = () => {
  redirect(`/en/articles`)
}

export const generateMetadata = () => {
  return {
    title: s('en', 'redirecting'),
  }
}

export default RedirectToArticles
