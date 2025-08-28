import React, { useContext } from 'react'
import styled from 'styled-components'
import { MultipleProps } from '../types'
import { MyContext, MyContextType } from '../TQgenerator'

const StyledOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: no-wrap;

  &:not(:last-child) {
    margin-bottom: var(--gap-small);
  }

  > *:not(:last-child) {
    margin-right: var(--gap-normal);
  }

  .option-result {
    width: 300px;
    display: flex;
    align-items: center;
    flex-wrap: no-wrap;
    justify-content: flex-end;
  }
`

const answerOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export const useMultiple = () => {
  const MultipleComponent: React.FC<{
    section: MultipleProps
    updateSection: (data: any) => void
  }> = ({ section, updateSection }) => {
    const { components } = useContext<MyContextType>(MyContext)
    const { formItems, btnItems } = components
    const { Input, Label, InputNumber, Checkbox } = formItems
    const { BtnOutline, BtnText } = btnItems
    const editOptions = (
      key: string,
      optionKey: 'label' | 'isCorrect' | 'score',
      value: string | boolean | number
    ) => {
      const newOptions = section.options.map((option) => {
        if (option.key === key) {
          if (optionKey === 'isCorrect') {
            option.isCorrect = value as boolean
          } else if (optionKey === 'label') {
            option.label = value as string
          } else if (optionKey === 'score') {
            option.score = value as number
          }
        }
        return option
      })
      updateSection({ ...section, options: newOptions })
    }
    const deleteOption = (key: string) => {
      const newOptions = section.options.filter((option) => option.key !== key)
      updateSection({ ...section, options: newOptions })
    }
    const addOption = () => {
      const newOptions = [...section.options]
      const key = new Date().getTime().toString()
      newOptions.push({
        key,
        label: '',
        value: key,
        isCorrect: false,
        score: 0
      })
      updateSection({ ...section, options: newOptions })
    }
    const renderOptions = (isEdit: boolean) => {
      return section.options.map((option, index) => {
        return (
          <StyledOption key={option.key}>
            <div>{answerOptions[index]}</div>
            <Input
              disabled={!isEdit}
              value={option.label}
              onChange={(e: any) =>
                editOptions(option.key, 'label', e.target.value)
              }
            />
            <div className='option-result'>
              {section.mode === 'test' && (
                <Checkbox
                  disabled={!isEdit}
                  checked={option.isCorrect}
                  onChange={() =>
                    editOptions(option.key, 'isCorrect', !option.isCorrect)
                  }
                >
                  正確答案
                </Checkbox>
              )}
              {section.mode === 'questionnaire' && (
                <>
                  <div
                    style={{
                      width: '100px',
                      textAlign: 'right',
                      marginRight: 'var(--gap-normal)'
                    }}
                  >
                    分數
                  </div>
                  <InputNumber
                    value={option.score}
                    precision={0}
                    min={0}
                    onChange={(value: any) =>
                      editOptions(option.key, 'score', Number(value) || 0)
                    }
                  />
                </>
              )}
              {isEdit && (
                <BtnText
                  key='delete'
                  theme='danger'
                  onClick={() => deleteOption(option.key)}
                >
                  刪除
                </BtnText>
              )}
            </div>
          </StyledOption>
        )
      })
    }

    return (
      <>
        <Label>選項</Label>
        {renderOptions(section.isEdit)}
        {section.isEdit && (
          <BtnOutline size='small' onClick={() => addOption()}>
            新增選項
          </BtnOutline>
        )}
      </>
    )
  }

  const initMultipleData = (itemId: string) => {
    let initOptions: MultipleProps['options'] = []
    for (let i = 0; i < 4; i++) {
      const key = `${itemId}-${i}`
      initOptions.push({
        key,
        label: '',
        value: key,
        isCorrect: false,
        score: 0
      })
    }
    return {
      type: '多選題' as const,
      options: initOptions
    }
  }

  return { MultipleComponent, initMultipleData }
}
