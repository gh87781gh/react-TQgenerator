import { SectionProps, TypeKeysEnum } from '../types'

export const validateTestResponse = (sections: SectionProps<TypeKeysEnum>[]): boolean => {
  for (const section of sections) {
    if (section.type === TypeKeysEnum.是非題 || section.type === TypeKeysEnum.單選題 || section.type === TypeKeysEnum.多選題 || section.type === TypeKeysEnum.填充題 || section.type === TypeKeysEnum.問答題) {
      if (!section.response) {
        return false
      }
    } else if (section.type === TypeKeysEnum.評分題) {
      if (!section.rating) {
        return false
      }
    }
  }
  return true
}