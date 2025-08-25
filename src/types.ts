export type ModeType = 'test' | 'questionnaire'
export type RoleType = 'editor' | 'responder' | 'corrector' | 'viewer'
export type StatusType = 'editing' | 'waiting_for_response' | 'waiting_for_correct' | 'finished' | 'archived'

export type TypeKeysType = "是非題" | "單選題" | "多選題" | "填充題" | "問答題" | "評分題"
export const TypeKeys: TypeKeysType[] = ["是非題", "單選題", "多選題", "填充題", "問答題", "評分題"]


interface BaseSectionProps {
  mode: ModeType
  id: string
  question: string
  isEdit: boolean
  updateSection: (section: SectionProps<TypeKeysType>) => void
  score?: number
}
export const initBaseSection: Omit<BaseSectionProps, 'id' | 'mode'> = {
  isEdit: true,
  question: '',
  updateSection: () => { },
  score: 0
}

export interface TrueFalseProps extends BaseSectionProps {
  type: '是非題'
  boolean: boolean | null
  options: {
    key: string
    label: string
    value: string
    isCorrect: boolean
  }[]
}

export interface SingleProps extends BaseSectionProps {
  type: '單選題'
  options: {
    key: string
    label: string
    value: string
    isCorrect: boolean
    score: number
  }[]
}

export interface MultipleProps extends BaseSectionProps {
  type: '多選題'
  options: {
    key: string
    label: string
    value: string
    isCorrect: boolean
    score: number
  }[]
}

export type FieldAnswerKeys = 'input' | 'number' | 'date'
export type FieldAnswerMap = {
  'input': string
  'number': number | null
  'date': string | null
}
export interface FieldProps<T extends FieldAnswerKeys> extends BaseSectionProps {
  type: '填充題'
  answerType: T
  answer: FieldAnswerMap[T]
}

export interface EssayProps extends BaseSectionProps {
  type: '問答題'
  answer: string
}

export interface RatingProps extends BaseSectionProps {
  type: '評分題'
  ratingType: 'number' | 'click'
  rating: number
  min?: number
  max?: number
  ratingGap?: number
}

export type SectionTypeMap = {
  '是非題': TrueFalseProps
  '單選題': SingleProps
  '多選題': MultipleProps
  '填充題': FieldProps<FieldAnswerKeys>
  '問答題': EssayProps
  '評分題': RatingProps
}
export type SectionProps<T extends TypeKeysType> = SectionTypeMap[T]

export type TQgeneratorProps = {
  mode: ModeType
  role: RoleType
  status: StatusType
  sections: SectionProps<TypeKeysType>[]
  setSections: (sections: SectionProps<TypeKeysType>[]) => void

  components: {
    formItems: {
      Select: React.ComponentType<any>
      InputNumber: React.ComponentType<any>,
      Input: React.ComponentType<any>
      Radio: React.ComponentType<any>
      Label: React.ComponentType<any>
    },
    btnItems: {
      BtnGroup: React.ComponentType<any>
      BtnPrimary: React.ComponentType<any>
      BtnOutline: React.ComponentType<any>
      BtnText: React.ComponentType<any>
    },
    editor: React.ComponentType<any>
  },
  utility: {
    icons: {
      IconDrag: React.ComponentType<any>
      IconDeleteOutline: React.ComponentType<any>
    },
    formatDate: (date: any) => string
  }
}