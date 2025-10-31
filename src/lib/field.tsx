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
  StatusEnum,
  RoleEnum
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
  const { components, utility } = context
  const { icons } = utility
  const { IconPassedCircle, IconFailedCircle } = icons
  const { formItems, btnItems } = components
  const { Label, Radio, Textarea, Input, InputNumber, DatePicker } = formItems
  const { BtnGroup, BtnPrimary } = btnItems

  const [responseDate, setResponseDate] = useState<dayjs.Dayjs | null>(() => {
      if (props.answerType !== 'date') return null
      if (!props.response) return null

      const date = dayjs(props.response)
      return date.isValid() ? date : null
    }
  )
  useEffect(() => {
    if (props.answerType !== 'date') return
    const newResponse = responseDate?.isValid() ? responseDate.toISOString() : null
    if (props.response !== newResponse) {
      props.updateSection({
        ...props,
        response: newResponse
      })
    }
  }, [responseDate])

  const editSection = useCallback(
    (key: string, value: string | number | boolean) => {
      let { response, finalScore } = props
      if (key === 'answerType') {
        if (value === 'date') response = null
        if (value === 'input') response = ''
        if (value === 'number') response = 0
      }

      if (key === 'isPass') {
        if (value === true) {
          finalScore = props.score
        } else {
          finalScore = 0
        }
      }
      props.updateSection({ ...props, response, finalScore, [key]: value })
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
            value={props.answer}
            onChange={(e: any) => editSection('answer', e.target.value)}
          />
        </>
      )}
    </>
  )
  const renderModePreviewEditing = () => (
    <>
      <Label>答案</Label>
      {props.answerType === 'input' && (
        <div style={{ width: '100%' }}>
          <Input
            disabled={true}
            value={props.response}
            onChange={(e: any) => editSection('response', e.target.value)}
          />
        </div>
      )}
      {props.answerType === 'number' && (
        <div style={{ width: '300px' }}>
          <InputNumber
            disabled={true}
            value={props.response}
            onChange={(val: any) => editSection('response', val || 0)}
          />
        </div>
      )}
      {props.answerType === 'date' && (
        <div style={{ width: '300px' }}>
          <DatePicker
            disabled={true}
            value={responseDate} // 用本地state來存比較安全，避免render錯誤
            onChange={(val: any) => setResponseDate(val)}
          />
        </div>
      )}
    </>
  )
  const renderModeResponse = () => {
    return (
      <>
        <Label>答案</Label>
        {props.answerType === 'input' && (
          <div style={{ width: '100%' }}>
            <Input
              disabled={props.role !== context.role}
              value={props.response}
              onChange={(e: any) => editSection('response', e.target.value)}
            />
          </div>
        )}
        {props.answerType === 'number' && (
          <div style={{ width: '300px' }}>
            <InputNumber
              disabled={props.role !== context.role}
              value={props.response}
              onChange={(val: any) => editSection('response', val || 0)}
            />
          </div>
        )}
        {props.answerType === 'date' && (
          <div style={{ width: '300px' }}>
            <DatePicker
              disabled={props.role !== context.role}
              value={responseDate} // 用本地state來存比較安全，避免render錯誤
              onChange={(val: any) => setResponseDate(val)}
            />
          </div>
        )}
      </>
    )
  }
  const renderModeCorrect = () => {
    return (
      <>
        <Label>答案</Label>
        {props.answerType === 'input' && (
          <div style={{ width: '100%' }}>
            <Input
              disabled={props.role !== context.role}
              value={props.response}
              onChange={(e: any) => editSection('response', e.target.value)}
            />
          </div>
        )}
        {props.answerType === 'number' && (
          <div style={{ width: '300px' }}>
            <InputNumber
              disabled={props.role !== context.role}
              value={props.response}
              onChange={(val: any) => editSection('response', val || 0)}
            />
          </div>
        )}
        {props.answerType === 'date' && (
          <div style={{ width: '300px' }}>
            <DatePicker
              disabled={props.role !== context.role}
              value={responseDate} // 用本地state來存比較安全，避免render錯誤
              onChange={(val: any) => setResponseDate(val)}
            />
          </div>
        )}
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
        {props.answerType === 'input' && (
          <div style={{ width: '100%' }}>
            <Input
              disabled={true}
              value={props.response}
              onChange={(e: any) => editSection('response', e.target.value)}
            />
          </div>
        )}
        {props.answerType === 'number' && (
          <div style={{ width: '300px' }}>
            <InputNumber
              disabled={true}
              value={props.response}
              onChange={(val: any) => editSection('response', val || 0)}
            />
          </div>
        )}
        {props.answerType === 'date' && (
          <div style={{ width: '300px' }}>
            <DatePicker
              disabled={true}
              value={responseDate} // 用本地state來存比較安全，避免render錯誤
              onChange={(val: any) => setResponseDate(val)}
            />
          </div>
        )}
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

  const renderOptions = {
    [StatusEnum.editing]: renderModeEditing,
    [StatusEnum.preview_editing]: renderModePreviewEditing,
    [StatusEnum.waiting_for_response]: renderModeResponse,
    [StatusEnum.waiting_for_correct]: renderModeCorrect,
    [StatusEnum.finished]: renderModeFinished
  } as const
  return <>{renderOptions[context.status as keyof typeof renderOptions]?.()}</>
}
