import { useContext } from 'react'
import { EssayProps } from '../types'
import { MyContext } from '../TQgenerator'

export const initEssay: Pick<EssayProps, 'type' | 'answer'> = {
  type: '問答題',
  answer: ''
}

export const EssayComponent = (props: EssayProps) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Label, Textarea } = formItems
  const editAnswer = (value: string) => {
    props.updateSection({ ...props, answer: value })
  }
  return (
    <>
      {props.mode === 'test' && (
        <>
          <Label>解析</Label>
          <Textarea
            disabled={!props.isEdit}
            value={props.answer}
            onChange={(e: any) => editAnswer(e.target.value)}
          />
        </>
      )}
    </>
  )
}
