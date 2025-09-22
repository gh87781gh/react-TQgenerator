import { SectionProps, TypeKeysEnum } from './types'

const autoCorrectTest = (sections: SectionProps<TypeKeysEnum>[]) => {
  let totalScore = 0
  sections.forEach((section) => {
    switch (section.type) {
      case TypeKeysEnum.是非題:
      case TypeKeysEnum.單選題:
      case TypeKeysEnum.多選題:
        totalScore += section.finalScore || 0
        break
      default:
        break
    }
  })

  return totalScore
}
const autoCorrectQuestionnaire = (sections: SectionProps<TypeKeysEnum>[]) => {
  // TODO 下次交付：檢查各section的response是否為空

  let totalScore = 0
  sections.forEach((section) => {
    switch (section.type) {
      case TypeKeysEnum.單選題:
      case TypeKeysEnum.多選題:
      case TypeKeysEnum.評分題:
        totalScore += section.finalScore || 0
        break
      default:
        break
    }
  })
  return totalScore
}

export { autoCorrectQuestionnaire, autoCorrectTest }
