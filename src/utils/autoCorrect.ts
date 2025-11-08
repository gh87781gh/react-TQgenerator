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
      /**
         * 在問卷裡，分數做在答案上，所以只要有勾選，就要加進該題得分裡
         * 在測驗裡，分數做在題目上，所選答案要完全符合正確答案，才能獲得該題的分數
         */
      // if (context.mode === ModeEnum.test) {
      //   // 檢查response是否完全符合answer，符合則加該題分數，不符合則得0分
      //   const isPassedCalculation =
      //     (response as string[]).every((key) =>
      //       (answer as string[]).includes(key)
      //     ) && (answer as string[]).length === (response as string[]).length
      //   finalScore = isPassedCalculation ? props.score : 0
      //   isPass = isPassedCalculation
      // } else if (context.mode === ModeEnum.questionnaire) {
      //   // 抓所有已勾選的option，將其optionScore累加到該題得分裡
      //   const correctOptions = options.filter((option) =>
      //     (response as string[]).includes(option.key)
      //   )
      //   finalScore = correctOptions.reduce((acc, option) => {
      //     return (acc += option.optionScore || 0)
      //   }, 0)
      // }
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
