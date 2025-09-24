import { useCallback, useContext } from 'react'
import { EssayProps, TypeKeysEnum, StatusEnum, ModeEnum } from '../types'
import { MyContext } from '../TQgenerator'
import { isEditable } from '../isEditable'

export const initEssay: Pick<EssayProps, 'type' | 'answer' | 'response'> = {
  type: TypeKeysEnum.問答題,
  answer: '',
  response: ''
}

export const EssayComponent = (props: EssayProps) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Label, Textarea, Input } = formItems

  const editSection = useCallback(
    (key: string, value: string | number) => {
      props.updateSection({ ...props, [key]: value })
    },
    [props]
  )
  const renderModeEditing = useCallback(() => {
    return (
      props.mode === ModeEnum.test && (
        <>
          <Label>解析</Label>
          <Textarea
            value={props.answer}
            onChange={(e: any) => editSection('answer', e.target.value)}
          />
        </>
      )
    )
  }, [props])

  const renderModeResponse = useCallback(() => {
    const isDisabled = !isEditable(context, props)
    return (
      <>
        <Label>答案</Label>
        <Input
          disabled={isDisabled}
          value={props.response}
          onChange={(e: any) => editSection('response', e.target.value)}
        />
      </>
    )
  }, [props, context])

  const renderMode = {
    [StatusEnum.editing]: renderModeEditing,
    [StatusEnum.preview_editing]: renderModeResponse,
    [StatusEnum.waiting_for_response]: renderModeResponse,
    [StatusEnum.waiting_for_correct]: renderModeResponse,
    [StatusEnum.finished]: renderModeResponse
  } as const
  return <>{renderMode[context.status as keyof typeof renderMode]?.()}</>
}
