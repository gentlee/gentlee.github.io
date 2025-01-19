import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import csharp from 'highlight.js/lib/languages/csharp'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import {JSDOM} from 'jsdom'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)

export const highlightCode = (htmlString: string): string => {
  const dom = new JSDOM(htmlString)
  const {document} = dom.window
  const codeBlocks = document.querySelectorAll('pre code')
  codeBlocks.forEach((block) => {
    const language = block.className.substring('language-'.length)
    const code = block.textContent
    const result = hljs.highlight(code!, {language})
    if (result.errorRaised) {
      throw result.errorRaised
    }
    block.innerHTML = result.value
  })
  return dom.serialize()
}
