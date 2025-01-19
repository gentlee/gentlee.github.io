import {PropsWithChildren} from 'react'

import {Footer} from '~/components/footer'
import {Language} from '~/utils/constants'
import {firaCodeFont, firaSansFont, fixedsysFont} from '~/utils/fonts'

type Props = PropsWithChildren & {
  params: Promise<{slug: string; lang: Language}>
}

const LangLayout = async ({children, params}: Props) => {
  const {lang} = await params

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
