import { useCallback, useContext } from 'react'
import {
  EssayProps,
  TypeKeysEnum,
  StatusEnum,
  ModeEnum,
  RoleEnum
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

  const editSection = useCallback(
    (key: string, value: string | number | boolean) => {
      let { finalScore } = props

      if (key === 'isPass') {
        if (value === true) {
          finalScore = props.score
        } else {
          finalScore = 0
        }
      }

      props.updateSection({ ...props, finalScore, [key]: value })
    },
    [props]
  )

  const renderModeEditing = () => {
    return props.mode === ModeEnum.test ? (
      <>
        <Label>解析</Label>
        <Textarea
          value={props.answer}
          onChange={(e: any) => editSection('answer', e.target.value)}
        />
      </>
    ) : null
  }
  const renderModePreviewEditing = () => {
    return props.mode === ModeEnum.test ? (
      <>
        <Label>解析</Label>
        <Textarea
          disabled={true}
          value={props.answer}
          onChange={(e: any) => editSection('answer', e.target.value)}
        />
      </>
    ) : null
  }
  const renderModeResponse = () => {
    return (
      <>
        <Label>答案</Label>
        <Textarea
          disabled={props.role !== context.role}
          value={props.response}
          onChange={(e: any) => editSection('response', e.target.value)}
        />
      </>
    )
  }
  const renderModeCorrect = () => {
    return (
      <>
        <Label>答案</Label>
        <Textarea
          disabled={props.role !== context.role}
          value={props.response}
          onChange={(e: any) => editSection('response', e.target.value)}
        />
        {props.mode === ModeEnum.test && context.role === RoleEnum.reviewer && (
          <>
            <div style={{ textAlign: 'right' }}>
              <BtnGroup>
                <BtnPrimary
                  theme='danger'
                  onClick={() => editSection('isPass', false)}
                >
                  <IconFailedCircle /> 答錯
                </BtnPrimary>
                <BtnPrimary
                  theme='success'
                  onClick={() => editSection('isPass', true)}
                >
                  <IconPassedCircle /> 正確
                </BtnPrimary>
              </BtnGroup>
            </div>
            <Label>解析</Label>
            <Textarea
              value={props.answer}
              onChange={(e: any) => editSection('answer', e.target.value)}
            />
          </>
        )}
      </>
    )
  }
  const renderModeFinished = () => {
    return (
      <>
        <Label>答案</Label>
        <Textarea
          disabled={true}
          value={props.response}
          onChange={(e: any) => editSection('response', e.target.value)}
        />
        {props.mode === ModeEnum.test &&
          context.config?.isAllowReviewWithAnswer && (
            <>
              <Label>解析</Label>
              <Textarea
                disabled={true}
                value={props.answer}
                onChange={(e: any) => editSection('answer', e.target.value)}
              />
            </>
          )}
      </>
    )
  }

  const renderMode = {
    [StatusEnum.editing]: renderModeEditing,
    [StatusEnum.preview_editing]: renderModePreviewEditing,
    [StatusEnum.waiting_for_response]: renderModeResponse,
    [StatusEnum.waiting_for_correct]: renderModeCorrect,
    [StatusEnum.finished]: renderModeFinished
  } as const
  return <>{renderMode[context.status as keyof typeof renderMode]?.()}</>
}
