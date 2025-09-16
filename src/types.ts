import dayjs from 'dayjs'

export enum ModeEnum {
  test = 'test',
  questionnaire = 'questionnaire'
}

export enum StatusEnum {
  editing = 'editing',
  preview_editing = 'preview_editing',
  waiting_for_response = 'waiting_for_response',
  waiting_for_correct = 'waiting_for_correct',
  finished = 'finished',
}
export enum RoleEnum {
  actor = 'actor',
  reviewer = 'reviewer'
}

export type ModeType = keyof typeof ModeEnum
export type StatusType = keyof typeof StatusEnum

export enum TypeKeysEnum {
  是非題 = '是非題',
  單選題 = '單選題',
  多選題 = '多選題',
  填充題 = '填充題',
  問答題 = '問答題',
  評分題 = '評分題'
}

export type TypeKeysType = keyof typeof TypeKeysEnum
export const TypeKeys = Object.values(TypeKeysEnum)


interface BaseSectionProps {
  id: string | null
  mode: ModeEnum | null
  role: RoleEnum | null
  updateSection: (section: SectionProps<TypeKeysEnum>) => void
  question: string // 問題
  answer: string | number | null | string[] | dayjs.Dayjs  // 解析
  response: string | number | null | string[] | dayjs.Dayjs // 回答
  score: number // 分數
  finalScore: number //得分
}
export const initBaseSection: BaseSectionProps = {
  id: null,
  mode: null,
  role: RoleEnum.actor,
  updateSection: () => { },
  question: '',
  answer: null,
  response: null,
  score: 0,
  finalScore: 0
}

export interface TrueFalseProps extends BaseSectionProps {
  type: TypeKeysEnum.是非題
  boolean: boolean | null
  options: {
    key: string
    label: string
    value: string
    isChecked: boolean
  }[]
}

export interface SingleProps extends BaseSectionProps {
  type: TypeKeysEnum.單選題
  options: {
    key: string
    label: string
    value: string
    optionScore?: number
  }[]
}

export interface MultipleProps extends BaseSectionProps {
  type: TypeKeysEnum.多選題
  options: {
    key: string
    label: string
    value: string
    optionScore?: number
  }[]
}

export type FieldAnswerKeys = 'input' | 'number' | 'date'
export type FieldAnswerMap = {
  'input': string
  'number': number | null
  'date': dayjs.Dayjs | null
}
export interface FieldProps<T extends FieldAnswerKeys> extends Omit<BaseSectionProps, 'answer' | 'response'> {
  type: TypeKeysEnum.填充題
  answerType: T
  answer: FieldAnswerMap[T]
  response: FieldAnswerMap[T]
}

export interface EssayProps extends BaseSectionProps {
  type: TypeKeysEnum.問答題
  answer: string
  response: string
}

export interface RatingProps extends BaseSectionProps {
  type: TypeKeysEnum.評分題
  ratingType: 'number' | 'click'
  rating: number
  min: number
  max: number
  ratingGap: number
}

export type SectionTypeMap = {
  [TypeKeysEnum.是非題]: TrueFalseProps
  [TypeKeysEnum.單選題]: SingleProps
  [TypeKeysEnum.多選題]: MultipleProps
  [TypeKeysEnum.填充題]: FieldProps<FieldAnswerKeys>
  [TypeKeysEnum.問答題]: EssayProps
  [TypeKeysEnum.評分題]: RatingProps
}
export type SectionProps<T extends TypeKeysEnum> = SectionTypeMap[T]

export type TQgeneratorProps = {
  config?: {
    isAllowSelectReviewer?: boolean | null
    isAllowReCorrect?: boolean | null
    isPreviewEditing?: boolean | null
    isAllowReview?: boolean | null
    isAllowReviewScore?: boolean | null
    isAllowReviewWithAnswer?: boolean | null
    isShowCorrectContent?: boolean | null
    isShowCorrectActionPass?: boolean | null
    isShowCorrectActionSubmit?: boolean | null
  }
  assets?: {
    ReviewResultMap?: {
      [key: string]: number | null
    },
    reviewerOptions?: {
      key: string
      label: string
      value: string
    }[]
  }
  actions?: {
    onSubmitEditing?: () => void
    onPreviewEditing?: () => void
    onSubmitResponse?: (totalScore: number, reviewerID: string | null) => void
    onSubmitCorrect?: (totalScore: number, reviewResult: number | null) => void
    onSubmitFinish?: () => void
  }

  mode: ModeEnum | null
  status: StatusEnum | null
  role: RoleEnum | null
  sections: SectionProps<TypeKeysEnum>[]
  setSections?: (sections: SectionProps<TypeKeysEnum>[]) => void
  actorID: string | null //填寫者
  reviewerID: string | null //評核者
  result: {
    score: number | null
    reviewResult?: number | null
    targetUserID?: string | null
    // specifyUserID?: string | null
  }

  components: {
    formItems: {
      Select: React.ComponentType<any>
      InputNumber: React.ComponentType<any>
      Input: React.ComponentType<any>
      Radio: React.ComponentType<any>
      Label: React.ComponentType<any>
      Checkbox: React.ComponentType<any>
      Textarea: React.ComponentType<any>
      DatePicker: React.ComponentType<any>
    },
    btnItems: {
      BtnGroup: React.ComponentType<any>
      BtnPrimary: React.ComponentType<any>
      BtnOutline: React.ComponentType<any>
      BtnText: React.ComponentType<any>
    },
    editor: {
      component: React.ComponentType<any>,
      onUploadImage: (image: string) => void
    },
    modal: React.ComponentType<any>,
  },
  utility: {
    icons: {
      IconDrag: React.ComponentType<any>
      IconDeleteOutline: React.ComponentType<any>
    },
    formatDate: (date: any) => string
  }
}
