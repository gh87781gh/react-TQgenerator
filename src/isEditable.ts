import { StatusEnum, SectionTypeMap, TypeKeysEnum } from './types'
import { MyContextType } from './TQgenerator'


const isEditable = (context: MyContextType, props: SectionTypeMap[TypeKeysEnum]) => {
  let isEditable = null

  switch (context.status) {
    case StatusEnum.editing:
      isEditable = true
      break
    case StatusEnum.preview_editing:
      isEditable = false
      break
    case StatusEnum.waiting_for_response:
    case StatusEnum.waiting_for_correct:
      isEditable = props.role === context.role
      break
    case StatusEnum.finished:
      isEditable =
        props.role === context.role && context.config?.isAllowReCorrect && context.config?.isAllowUpdateAfterFinished
      break
    default:
      console.error('🔴 isEditable: status configuration is not valid')
      break
  }

  return isEditable
}

export { isEditable }