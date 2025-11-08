import { SectionProps, TypeKeysEnum } from '../types'

const autoCorrectTest = (sections: SectionProps<TypeKeysEnum>[]) => {
  const newSections = sections.map((section) => {
    switch (section.type) {
      case TypeKeysEnum.是非題:
        let { response, answer, score, finalScore, isPass } = section
        if (response === answer) {
          finalScore = score
          isPass = true
        } else {
          finalScore = 0
          isPass = false
        }
        return { ...section, finalScore, isPass }
      case TypeKeysEnum.單選題:
      case TypeKeysEnum.多選題:
      case TypeKeysEnum.填充題:
      case TypeKeysEnum.問答題:
      default:
        console.error('🔴 autoCorrectTest error: Invalid section type')
    }
  })

  let totalScore = 0
  for (const section of newSections) {
    totalScore += section?.finalScore ?? 0
  }

  return { newSections, totalScore }
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
