import _ from 'lodash'
import { SectionProps, TypeKeysEnum } from '../types'

export const autoCorrectTest = (sections: SectionProps<TypeKeysEnum>[]) => {
  const correctedSections = _.cloneDeep(sections).map((section) => {
    if (section.type === TypeKeysEnum.是非題 || section.type === TypeKeysEnum.單選題) {
      let { response, answer, score, finalScore, isPass } = section
      if (response === answer) {
        finalScore = score
        isPass = true
      } else {
        finalScore = 0
        isPass = false
      }
      return { ...section, finalScore, isPass }
    } else if (section.type === TypeKeysEnum.多選題) {
      // 在測驗裡，分數做在題目上，所選答案要完全符合正確答案，才能獲得該題的分數
      let { response, answer, score, finalScore } = section
      const isPass =
        (response as string[]).every((key) =>
          (answer as string[]).includes(key)
        ) && (answer as string[]).length === (response as string[]).length
      finalScore = isPass ? score : 0
      return { ...section, finalScore, isPass }
    } else if (section.type === TypeKeysEnum.填充題 || section.type === TypeKeysEnum.問答題) {
      let { isPass, score } = section
      return { ...section, finalScore: isPass ? score : 0 }
    }
    else {
      console.error('🔴 autoCorrectTest error: Invalid section type')
    }
  })

  let correctedTotalFinalScore = 0
  correctedSections.forEach((section, index) => {
    if (typeof section?.finalScore !== 'number') {
      console.error(`🔴 autoCorrectTest error: finalScore is not a number at index: ${index}`)
    }
    correctedTotalFinalScore += section?.finalScore ?? 0
  })

  return { correctedSections, correctedTotalFinalScore }
}

export const autoCorrectQuestionnaire = (sections: SectionProps<TypeKeysEnum>[]) => {
  const correctedSections = _.cloneDeep(sections).map((section) => {
    if (section.type === TypeKeysEnum.單選題) {
      const finalScore =
        section.options.find((option) => option.key === section.response)?.optionScore ||
        0
      return { ...section, finalScore }
    } else if (section.type === TypeKeysEnum.多選題) {
      // 在問卷裡，分數做在答案上，所以只要有勾選，就要加進該題得分裡
      const checkedOptions = section.options.filter((option) =>
        (section.response as string[]).includes(option.key)
      )
      const finalScore = checkedOptions.reduce((acc, option) => {
        return (acc += option.optionScore || 0)
      }, 0)
      return { ...section, finalScore }
    } else if (section.type === TypeKeysEnum.填充題 || section.type === TypeKeysEnum.問答題) {
      // 問卷裡，填充題跟問答題都沒有分數
      return section
    } else if (section.type === TypeKeysEnum.評分題) {
      return { ...section, finalScore: section.rating }
    } else {
      console.error('🔴 autoCorrectQuestionnaire error: Invalid section type')
    }
  })

  let correctedTotalFinalScore = 0
  correctedSections.forEach((section, index) => {
    if (typeof section?.finalScore !== 'number') {
      console.error(`🔴 autoCorrectQuestionnaire error: finalScore is not a number at index: ${index}`)
    }
    correctedTotalFinalScore += section?.finalScore ?? 0
  })

  return { correctedSections, correctedTotalFinalScore }
}