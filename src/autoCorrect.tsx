import { SectionProps, TypeKeysEnum } from './types'

const autoCorrectTest = (sections: SectionProps<TypeKeysEnum>[]) => {
  console.log('autoCorrectTest', sections)

  let totalScore = 0
  // sections.forEach((section) => {
  //   // TODO: 實作測驗自動評分邏輯
  //   totalScore += section.finalScore || 0
  // })

  return totalScore
}
const autoCorrectQuestionnaire = (sections: SectionProps<TypeKeysEnum>[]) => {
  console.log('onSubmitQuestionnaire', sections)
  // TODO 下次交付：檢查各section的response是否為空

  // NOTE 問卷的分數是在答案裡
  let totalScore = 0
  sections.forEach((section) => {
    switch (section.type) {
      case TypeKeysEnum.單選題:
        if (section.answer === section.response) {
          section.finalScore =
            section.options.find((option) => option.key === section.answer)
              ?.optionScore || 0
          totalScore += section.finalScore
        }
        break
      case TypeKeysEnum.多選題:
        if (
          (section.answer as string[])?.every((answer) =>
            (section.response as string[])?.includes(answer)
          )
        ) {
          const optionScores = section.options
            .map((option) => option.optionScore)
            .filter((score) => score !== undefined)
          section.finalScore = optionScores.reduce((acc, curr) => acc + curr, 0)
          totalScore += section.finalScore
        }
        break
      case TypeKeysEnum.評分題:
        totalScore += section.finalScore
        break
      default:
        break
    }
  })
  return totalScore
}

export { autoCorrectQuestionnaire, autoCorrectTest }
