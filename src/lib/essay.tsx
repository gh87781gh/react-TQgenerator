import { useCallback, useContext } from 'react'
import { EssayProps, TypeKeysEnum, StatusEnum } from '../types'
import { MyContext } from '../TQgenerator'

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
  const renderModeEditing = useCallback(
    () => (
      <>
        <Label>解析</Label>
        <Textarea
          disabled={!props.isEdit}
          value={props.answer}
          onChange={(e: any) => editSection('answer', e.target.value)}
        />
      </>
    ),
    [props]
  )

  const renderModeResponse = useCallback(
    () => (
      <>
        <Label>答案</Label>
        <Input
          value={props.response}
          onChange={(e: any) => editSection('response', e.target.value)}
        />
      </>
    ),
    [props]
  )

  const renderMode = {
    [StatusEnum.editing]: renderModeEditing,
    [StatusEnum.waiting_for_response]: renderModeResponse
  } as const
  return <>{renderMode[context.status as keyof typeof renderMode]?.()}</>
}
