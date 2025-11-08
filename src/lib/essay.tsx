import { useContext } from 'react'
import {
  EssayProps,
  TypeKeysEnum,
  StatusEnum,
  ModeEnum,
  PermissionEnum
} from '../types'
import { MyContext } from '../TQgenerator'

export const initEssay: Pick<EssayProps, 'type' | 'answer' | 'response'> = {
  type: TypeKeysEnum.問答題,
  answer: '',
  response: ''
}

export const EssayComponent = (props: EssayProps) => {
  const context = useContext(MyContext)
  const { components, utility } = context
  const { icons } = utility
  const { formItems, btnItems } = components
  const { Label, Textarea } = formItems
  const { BtnGroup, BtnPrimary } = btnItems
  const { IconFailedCircle, IconPassedCircle } = icons

  const renderAnswerDesign = () => {
    return null
  }
  const renderAnswerReply = () => {
    return (
      <>
        <Label>答案</Label>
        <Textarea
          disabled={props.role !== context.role}
          value={props.response}
          onChange={(e: any) =>
            props.updateSection({ ...props, response: e.target.value })
          }
        />
        {props.mode === ModeEnum.test &&
          context.permissions.includes(PermissionEnum.批改) && (
            <>
              <div style={{ textAlign: 'right' }}>
                <BtnGroup>
                  <BtnPrimary
                    theme='danger'
                    onClick={() =>
                      props.updateSection({ ...props, isPass: false })
                    }
                  >
                    <IconFailedCircle /> 答錯
                  </BtnPrimary>
                  <BtnPrimary
                    theme='success'
                    onClick={() =>
                      props.updateSection({ ...props, isPass: true })
                    }
                  >
                    <IconPassedCircle /> 正確
                  </BtnPrimary>
                </BtnGroup>
              </div>
              <Label>解析</Label>
              <Textarea disabled={true} value={props.answer} />
            </>
          )}
      </>
    )
  }
  const renderAnswerRead = () => {
    return (
      <>
        <Label>答案</Label>
        <Textarea disabled={true} value={props.response} />
        {props.mode === ModeEnum.test &&
          context.permissions.includes(PermissionEnum.查看答案) && (
            <>
              <Label>解析</Label>
              <Textarea disabled={true} value={props.answer} />
            </>
          )}
      </>
    )
  }

  const renderMode = {
    [StatusEnum.設計中]: renderAnswerDesign,
    [StatusEnum.作答中]: renderAnswerReply,
    [StatusEnum.唯讀]: renderAnswerRead
  } as const
  return <>{renderMode[context.status as keyof typeof renderMode]?.()}</>
}
