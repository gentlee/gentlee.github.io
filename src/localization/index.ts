import {Language} from '~/utils/constants'

import enStrings from './en.json'
import ruStrings from './ru.json'

export const s = (lang: Language, key: keyof typeof enStrings) => {
  return (lang === 'en' ? enStrings[key] : ruStrings[key]) ?? key
}
