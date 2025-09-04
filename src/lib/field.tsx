import { useContext } from 'react'
import styled from 'styled-components'
import {
  FieldProps,
  FieldAnswerKeys,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum
} from '../types'
import { MyContext } from '../TQgenerator'

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
  'type' | 'answerType' | 'answer' | 'response'
> = {
  type: TypeKeysEnum.填充題,
  answerType: 'input',
  answer: '',
  response: ''
}

export const FieldComponent = (props: FieldProps<FieldAnswerKeys>) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Label, Radio, Textarea, Input, InputNumber, DatePicker } = formItems
  const update = (key: string, value: string | number) => {
    props.updateSection({ ...props, [key]: value })
  }
  const renderEditingMode = () => (
    <>
      <Label>選項</Label>
      <StyledAnswerType>
        {Object.keys(AnswerTypeMap).map((key) => {
          return (
            <Radio
              disabled={!props.isEdit}
              key={key}
              checked={props.answerType === key}
              onChange={() => update('answerType', key as FieldAnswerKeys)}
            >
              {AnswerTypeMap[key as FieldAnswerKeys]}
            </Radio>
          )
        })}
      </StyledAnswerType>
      {props.mode === ModeEnum.test && (
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
      <Label>答案</Label>
      <div style={{ width: '300px' }}>
        {props.answerType === 'input' && (
          <Input
            value={props.response}
            onChange={(e: any) => update('response', e.target.value)}
          />
        )}
        {props.answerType === 'number' && (
          <InputNumber
            value={props.response}
            onChange={(e: any) => update('response', e.target.value)}
          />
        )}
        {props.answerType === 'date' && (
          <DatePicker
            value={props.response}
            onChange={(e: any) => update('response', e.target.value)}
          />
        )}
      </div>
    </>
  )

  return (
    <>
      {context.status === StatusEnum.editing
        ? renderEditingMode()
        : renderStaticMode()}
    </>
  )
}
