import React, { useContext } from 'react'
import styled from 'styled-components'
import { FieldProps, FieldAnswerKeys, FieldAnswerMap } from '../types'
import { MyContext, MyContextType } from '../TQgenerator'

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

export const useField = () => {
  const FieldComponent: React.FC<{
    section: FieldProps<FieldAnswerKeys>
    updateSection: (data: any) => void
  }> = ({ section, updateSection }) => {
    const { components } = useContext<MyContextType>(MyContext)
    const { formItems } = components
    const { Label, Radio, Textarea } = formItems
    const editAnswerType = (value: FieldAnswerKeys) => {
      updateSection({ ...section, answerType: value })
    }
    const editAnswer = (value: FieldAnswerMap[FieldAnswerKeys]) => {
      updateSection({ ...section, answer: value })
    }
    return (
      <>
        <Label>選項</Label>
        <StyledAnswerType>
          {Object.keys(AnswerTypeMap).map((key) => {
            return (
              <Radio
                disabled={!section.isEdit}
                key={key}
                checked={section.answerType === key}
                onChange={() => editAnswerType(key as FieldAnswerKeys)}
              >
                {AnswerTypeMap[key as FieldAnswerKeys]}
              </Radio>
            )
          })}
        </StyledAnswerType>
        {section.mode === 'test' && (
          <>
            <Label>建議答案</Label>
            <Textarea
              disabled={!section.isEdit}
              value={(section.answer as FieldAnswerMap[FieldAnswerKeys]) || ''}
              onChange={(e: any) => editAnswer(e.target.value)}
            />
          </>
        )}

        {/* TODO 這是填寫者要用的 */}
        {/* <div style={{ width: '300px' }}>
          {section.answerType === 'input' && (
            <Input
              disabled={!section.isEdit}
              value={(section.answer as FieldAnswerMap['input']) || ''}
              onChange={(e) => editAnswer(e.target.value)}
            />
          )}
          {section.answerType === 'number' && (
            <InputNumber
              disabled={!section.isEdit}
              value={(section.answer as FieldAnswerMap['number']) || ''}
              onChange={(value) => editAnswer(value)}
            />
          )}
          {section.answerType === 'date' && (
            <DatePicker
              disabled={!section.isEdit}
              value={
                (section.answer as FieldAnswerMap['date'])
                  ? dayjs(section.answer as FieldAnswerMap['date'])
                  : null
              }
              onChange={(day: Dayjs) => editAnswer(formatDate(day))}
            />
          )}
        </div> */}
      </>
    )
  }

  const initFieldData = () => {
    return {
      type: '填充題' as const,
      answerType: 'input' as FieldAnswerKeys,
      answer: ''
    }
  }

  return { FieldComponent, initFieldData }
}
