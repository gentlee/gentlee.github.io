import {notFound} from 'next/navigation'
import {PropsWithChildren} from 'react'

import {Footer} from '~/components/footer'
import {firaCodeFont, firaSansFont, fixedsysFont} from '~/utils/fonts'

type Props = PropsWithChildren & {
  params: Promise<{lang: string}>
}

const LangLayout = async ({children, params}: Props) => {
  const {lang} = await params

  if (lang !== 'en' && lang !== 'ru') {
    notFound()
  }

  return (
    <html lang={lang}>
      <body
        className={`${firaSansFont.variable} ${firaCodeFont.variable} ${fixedsysFont.variable} antialiased`}
      >
        {children}
        <Footer lang={lang} />
      </body>
    </html>
  )
}

export default LangLayout
