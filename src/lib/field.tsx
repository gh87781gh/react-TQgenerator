import { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
dayjs.extend(weekday)
dayjs.extend(localeData)

import { MyContext } from '../TQgenerator'
import {
  FieldProps,
  FieldAnswerKeys,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum
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

  const [responseDate, setResponseDate] = useState<dayjs.Dayjs | null>(
    dayjs(props.response).isValid() ? dayjs(props.response) : null
  )
  useEffect(() => {
    console.log('🟢 responseDate', responseDate)
    if (!responseDate) return
    props.updateSection({
      ...props,
      response: responseDate?.toISOString() || null
    })
  }, [responseDate])

  const editSection = useCallback(
    (key: string, value: string | number) => {
      let { response } = props
      if (key === 'answerType') {
        if (value === 'date') response = null
        if (value === 'input') response = ''
        if (value === 'number') response = 0
      }
      props.updateSection({ ...props, response, [key]: value })
    },
    [props]
  )
  const renderModeEditing = () => (
    <>
      <Label>選項</Label>
      <StyledAnswerType>
        {Object.keys(AnswerTypeMap).map((key) => {
          return (
            <Radio
              disabled={!props.isEdit}
              key={key}
              checked={props.answerType === key}
              onChange={() => editSection('answerType', key as FieldAnswerKeys)}
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
            onChange={(e: any) => editSection('answer', e.target.value)}
          />
        </>
      )}
    </>
  )
  const renderModeResponse = () => (
    <>
      <Label>答案</Label>
      <div style={{ width: '300px' }}>
        {props.answerType === 'input' && (
          <Input
            value={props.response}
            onChange={(e: any) => editSection('response', e.target.value)}
          />
        )}
        {props.answerType === 'number' && (
          <InputNumber
            value={props.response}
            onChange={(val: any) => editSection('response', val || 0)}
          />
        )}
        {props.answerType === 'date' && (
          <DatePicker
            value={responseDate} // 用本地state來存比較安全，避免render錯誤
            onChange={(val: any) => setResponseDate(val)}
          />
        )}
      </div>
    </>
  )

  const renderOptions = {
    [StatusEnum.editing]: renderModeEditing,
    [StatusEnum.waiting_for_response]: renderModeResponse
  } as const
  return <>{renderOptions[context.status as keyof typeof renderOptions]?.()}</>
}
