import { EssayProps, TQgeneratorProps } from '../types'

export const initEssay: Pick<EssayProps, 'type' | 'answer'> = {
  type: '問答題',
  answer: ''
}

export const EssayComponent = (
  props: EssayProps & {
    components: TQgeneratorProps['components']
    utility: TQgeneratorProps['utility']
  }
) => {
  const { components } = props
  const { formItems } = components
  const { Label, Textarea } = formItems
  const editAnswer = (value: string) => {
    props.updateSection({ ...props, answer: value })
  }
  return (
    <>
      {props.mode === 'test' && (
        <>
          <Label>建議答案</Label>
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

EssayComponent.displayName = 'EssayComponent'
