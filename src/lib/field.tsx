import { useContext, useEffect, useState } from 'react'
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
  PermissionEnum
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
  answerType: Object.keys(AnswerTypeMap)[0] as FieldAnswerKeys,
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
  })
  useEffect(() => {
    if (props.answerType !== 'date') return
    const newResponse = responseDate?.isValid()
      ? responseDate.toISOString()
      : null
    if (props.response !== newResponse) {
      props.updateSection({
        ...props,
        response: newResponse
      })
    }
  }, [responseDate])

  const onChangeAnswerType = (value: FieldAnswerKeys) => {
    let { response } = props
    if (value === 'date') response = null
    if (value === 'input') response = ''
    if (value === 'number') response = 0
    props.updateSection({ ...props, response, answerType: value })
  }

  const renderAnswerDesign = () => {
    return (
      <>
        <Label>選項</Label>
        <StyledAnswerType>
          {Object.keys(AnswerTypeMap).map((key) => {
            return (
              <Radio
                key={key}
                checked={props.answerType === key}
                onChange={() => onChangeAnswerType(key as FieldAnswerKeys)}
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
              onChange={(e: any) =>
                props.updateSection({ ...props, answer: e.target.value })
              }
            />
          </>
        )}
      </>
    )
  }
  const renderAnswerReply = () => {
    return (
      <>
        <Label>答案</Label>
        {props.answerType === 'input' && (
          <div style={{ width: '100%' }}>
            <Input
              disabled={context.role !== props.role}
              value={props.response}
              onChange={(e: any) =>
                props.updateSection({ ...props, response: e.target.value })
              }
            />
          </div>
        )}
        {props.answerType === 'number' && (
          <div style={{ width: '300px' }}>
            <InputNumber
              disabled={context.role !== props.role}
              value={props.response}
              onChange={(val: any) =>
                props.updateSection({ ...props, response: val || 0 })
              }
            />
          </div>
        )}
        {props.answerType === 'date' && (
          <div style={{ width: '300px' }}>
            <DatePicker
              disabled={context.role !== props.role}
              value={responseDate} // 用本地state來存比較安全，避免render錯誤
              onChange={(val: any) => setResponseDate(val)}
            />
          </div>
        )}
        {props.mode === ModeEnum.test &&
          context.permissions.includes(PermissionEnum.批改) && (
            <>
              <div style={{ textAlign: 'right' }}>
                <BtnGroup>
                  <BtnPrimary
                    theme='danger'
                    onClick={() =>
                      props.updateSection({ ...props, isPass: false })
                    }
                  >
                    <IconFailedCircle /> 答錯
                  </BtnPrimary>
                  <BtnPrimary
                    theme='success'
                    onClick={() =>
                      props.updateSection({ ...props, isPass: true })
                    }
                  >
                    <IconPassedCircle /> 正確
                  </BtnPrimary>
                </BtnGroup>
              </div>
              <Label>解析</Label>
              <Textarea disabled={true} value={props.answer} />
            </>
          )}
      </>
    )
  }
  const renderAnswerRead = () => {
    return (
      <>
        <Label>答案</Label>
        {props.answerType === 'input' && (
          <div style={{ width: '100%' }}>
            <Input disabled={true} value={props.response} />
          </div>
        )}
        {props.answerType === 'number' && (
          <div style={{ width: '300px' }}>
            <InputNumber disabled={true} value={props.response} />
          </div>
        )}
        {props.answerType === 'date' && (
          <div style={{ width: '300px' }}>
            <DatePicker
              disabled={true}
              value={responseDate} // 用本地state來存比較安全，避免render錯誤
            />
          </div>
        )}
        {props.mode === ModeEnum.test &&
          context.permissions.includes(PermissionEnum.查看答案) && (
            <>
              <Label>解析</Label>
              <Textarea disabled={true} value={props.answer} />
            </>
          )}
      </>
    )
  }

  const renderOptions = {
    [StatusEnum.設計中]: renderAnswerDesign,
    [StatusEnum.作答中]: renderAnswerReply,
    [StatusEnum.唯讀]: renderAnswerRead
  } as const
  return <>{renderOptions[context.status as keyof typeof renderOptions]?.()}</>
}
