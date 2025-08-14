import styled from 'styled-components'
import {
  FieldProps,
  FieldAnswerKeys,
  FieldAnswerMap,
  TQgeneratorProps
} from '../types'

const StyledAnswerType = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gap-small);
`

const AnswerTypeMap: Record<FieldAnswerKeys, string> = {
  input: '文數字輸入',
  number: '數字輸入',
  date: '日期格式輸入'
}
export const initField: Pick<
  FieldProps<FieldAnswerKeys>,
  'type' | 'answerType' | 'answer'
> = {
  type: '填充題',
  answerType: 'input',
  answer: ''
}

export const FieldComponent = (
  props: FieldProps<FieldAnswerKeys> & {
    components: TQgeneratorProps['components']
    utility: TQgeneratorProps['utility']
  }
) => {
  const { components } = props
  const { formItems } = components
  const { Label, Radio, Textarea } = formItems
  const editAnswerType = (value: FieldAnswerKeys) => {
    props.updateSection({ ...props, answerType: value })
  }
  const editAnswer = (value: FieldAnswerMap[FieldAnswerKeys]) => {
    props.updateSection({ ...props, answer: value })
  }
  return (
    <>
      <Label>選項</Label>
      <StyledAnswerType>
        {Object.keys(AnswerTypeMap).map((key) => {
          return (
            <Radio
              disabled={!props.isEdit}
              key={key}
              checked={props.answerType === key}
              onChange={() => editAnswerType(key as FieldAnswerKeys)}
            >
              {AnswerTypeMap[key as FieldAnswerKeys]}
            </Radio>
          )
        })}
      </StyledAnswerType>
      {props.mode === 'test' && (
        <>
          <Label>建議答案</Label>
          <Textarea
            disabled={!props.isEdit}
            value={(props.answer as FieldAnswerMap[FieldAnswerKeys]) || ''}
            onChange={(e: any) => editAnswer(e.target.value)}
          />
        </>
      )}

      {/* TODO 這是填寫者要用的 */}
      {/* <div style={{ width: '300px' }}>
        {props.answerType === 'input' && (
          <Input
            disabled={!props.isEdit}
            value={(props.answer as FieldAnswerMap['input']) || ''}
            onChange={(e) => editAnswer(e.target.value)}
          />
        )}
        {props.answerType === 'number' && (
          <InputNumber
            disabled={!props.isEdit}
            value={(props.answer as FieldAnswerMap['number']) || ''}
            onChange={(value) => editAnswer(value)}
          />
        )}
        {props.answerType === 'date' && (
          <DatePicker
            disabled={!props.isEdit}
            value={
              (props.answer as FieldAnswerMap['date'])
                ? dayjs(props.answer as FieldAnswerMap['date'])
                : null
            }
            onChange={(day: Dayjs) => editAnswer(formatDate(day))}
          />
        )}
      </div> */}
    </>
  )
}

FieldComponent.displayName = 'FieldComponent'
