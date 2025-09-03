import { useContext } from 'react'
import { EssayProps } from '../types'
import { MyContext } from '../TQgenerator'

export const initEssay: Pick<EssayProps, 'type' | 'answer' | 'response'> = {
  type: '問答題',
  answer: '',
  response: ''
}

export const EssayComponent = (props: EssayProps) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Label, Textarea, Input } = formItems
  const update = (key: string, value: string | number) => {
    props.updateSection({ ...props, [key]: value })
  }

  const renderEditingMode = () => (
    <>
      {props.mode === 'test' && (
        <>
          <Label>解析</Label>
          <Textarea
            disabled={!props.isEdit}
            value={props.answer}
            onChange={(e: any) => update('answer', e.target.value)}
          />
        </>
      )}
    </>
  )

  const renderStaticMode = () => (
    <>
      {props.mode === 'test' && (
        <>
          <Label>答案</Label>
          <Input
            value={props.response}
            onChange={(e: any) => update('response', e.target.value)}
          />
        </>
      )}
    </>
  )

  return (
    <>
      {context.status === 'editing' ? renderEditingMode() : renderStaticMode()}
    </>
  )
}
