import TQgenerator from './TQgenerator'
import {
  ModeEnum,
  StatusEnum,
  PermissionEnum,
  TQgeneratorProps,
  TypeKeysEnum,
  SectionProps,
  TrueFalseProps,
  SingleProps,
  MultipleProps,
  FieldProps,
  EssayProps,
  RatingProps
} from './types'
import { autoCorrectTest, autoCorrectQuestionnaire } from './utils/autoCorrect'

export { TQgenerator }
export { TypeKeysEnum, ModeEnum, StatusEnum, PermissionEnum }
export type {
  TQgeneratorProps,
  SectionProps,
  TrueFalseProps,
  SingleProps,
  MultipleProps,
  FieldProps,
  EssayProps,
  RatingProps
}
export { autoCorrectTest, autoCorrectQuestionnaire }