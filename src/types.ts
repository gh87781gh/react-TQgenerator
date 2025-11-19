import dayjs from 'dayjs'

export enum ModeEnum {
  test = 'test',
  questionnaire = 'questionnaire'
}

export enum StatusEnum {
  設計中,
  作答中,
  唯讀
}

/**
 * TQgenerator 內部的權限定義，決定畫面呈現及操作範圍，未來可視需求增加更多種權限（已建立的權限不能刪除且不能改變定義）
 * 
 * admin: 系統管理（上帝視角）
 * 設計: 可以設計題目、選項、解析、分數、選擇各題作答者的身份
 * 作答: 可以作答
 * 批改: 可以批改各題作答是否通過（答對/答錯）
 * 查看內容: 可以查看題目、選項、作答內容
 * 查看結果: 可以查看各題通過結果（答對/答錯）
 * 查看答案: 可以查看正確答案（含解析）
 * 
 */
export enum PermissionEnum {
  admin,
  設計,
  作答,
  批改,
  查看內容,
  查看結果,
  查看答案,
}

export enum TypeKeysEnum {
  是非題 = '是非題',
  單選題 = '單選題',
  多選題 = '多選題',
  填充題 = '填充題',
  問答題 = '問答題',
  評分題 = '評分題'
}

interface BaseSectionProps {
  id: string | null
  mode: ModeEnum | null
  role: string | null // 進入者角色（取決於對接系統內有什麼角色）
  updateSection: (section: SectionProps<TypeKeysEnum>) => void
  question: string // 問題
  answer: string | number | null | string[] | dayjs.Dayjs  // 解析
  response: string | number | null | string[] | dayjs.Dayjs // 回答
  score: number // 題目設定的應得分數，測驗才用得到
  finalScore: number // 實際得分
  isPass: boolean | null // 是否通過
}
export const initBaseSection: BaseSectionProps = {
  id: null,
  mode: null,
  role: null,
  updateSection: () => { },
  question: '',
  answer: null,
  response: null,
  score: 0,
  finalScore: 0,
  isPass: null
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
  isLoading?: boolean
  mode: ModeEnum | null
  status: StatusEnum | null
  role: string | null
  sections: SectionProps<TypeKeysEnum>[]
  setSections?: (sections: SectionProps<TypeKeysEnum>[]) => void
  renderArticleTitle?: () => React.ReactNode
  renderArticleFooter?: () => React.ReactNode
  permissions: PermissionEnum[]
  applyRoleMap?: { key: string, value: string }[] // 由對接系統傳入的作答者設定，供 design 時選擇作答者用
  onUploadQuestionImg?: (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
  ) => Promise<string>

  components: {
    formItems: {
      Select: React.ComponentType<any>
      SearchSelect: React.ComponentType<any>
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
    // TODO 即將拿掉
    // editor: {
    //   component: React.ComponentType<any>,
    //   onUploadImage?: (
    //     file: File,
    //     onProgress?: (event: { progress: number }) => void,
    //     abortSignal?: AbortSignal
    //   ) => Promise<string>
    // },
    modal: React.ComponentType<any>,
    message: any,
    spin: React.ComponentType<any>
  },
  utility: {
    icons: {
      IconDrag: React.ComponentType<any>
      IconDeleteOutline: React.ComponentType<any>,
      IconPassedCircle: React.ComponentType<any>,
      IconFailedCircle: React.ComponentType<any>
    },
    formatDate: (date: any) => string
  }

  // TODO 待檢查
  // config?: {
  //   isAllowSelectReviewer?: boolean | null
  //   isAllowReSelectReviewer?: boolean | null
  //   isAllowReCorrect?: boolean | null
  //   isReCorrecting?: boolean
  //   isPreviewEditing?: boolean | null
  //   isAllowReview?: boolean | null
  //   isAllowReviewWithAnswer?: boolean | null
  //   isShowCorrectContent?: boolean | null
  //   isShowCurrentFinalTotalScore?: boolean | null
  //   isShowCorrectActionPass?: boolean | null
  //   isShowCorrectActionSubmit?: boolean | null
  // }
  // assets?: {
  //   ReviewResultMap?: {
  //     [key: string]: number | null
  //   },
  //   reviewerOptions?: {
  //     key: string
  //     label: string
  //     value: string
  //   }[],
  //   classTeacherID?: string | null
  // }
  // actions?: {
  //   onSubmitEditing?: () => void
  //   onPreviewEditing?: () => void
  //   onSubmitResponse?: (totalScore: number, reviewerID: string | null) => void
  //   onSubmitCorrect?: (totalScore: number, reviewResult: number | null, isReCorrecting?: boolean) => void
  //   isAutoSubmitResponse?: boolean
  // }
  // actorID: string | null //填寫者
  // reviewerID: string | null //評核者
  // totalScore?: number | null // 預計總分
  // result: {
  //   score: number | null // 得分
  //   reviewResult?: number | null // 評核為通過或不通過
  //   targetUserID?: string | null // TODO 中山不用，但門諾要，要再加上相關邏輯
  //   // specifyUserID?: string | null
  // }
}
