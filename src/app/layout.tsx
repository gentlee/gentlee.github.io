import './globals.css'

import Script from 'next/script'
import {PropsWithChildren} from 'react'

const AppLayout = async ({children}: PropsWithChildren) => {
  return (
    <>
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
        <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml" />
      </head>
      {process.env.NODE_ENV !== 'development' && (
        <Script data-collect-dnt="true" async src="https://scripts.simpleanalyticscdn.com/latest.js" />
      )}
      {children}
    </>
  )
}

export default AppLayout
