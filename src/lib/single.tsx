import React, { useContext } from 'react'
import { SingleProps } from '../types'
import { MyContext, MyContextType } from '../TQgenerator'
import styled from 'styled-components'

const StyledOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

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

export const useSingle = () => {
  const SingleComponent: React.FC<{
    section: SingleProps
    updateSection: (data: any) => void
  }> = ({ section, updateSection }) => {
    const { components } = useContext<MyContextType>(MyContext)
    const { formItems, btnItems } = components
    const { Input, Label, Radio, InputNumber } = formItems
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
        } else {
          if (optionKey === 'isCorrect') {
            option.isCorrect = false
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
                <Radio
                  disabled={!isEdit}
                  checked={option.isCorrect}
                  onChange={() =>
                    editOptions(option.key, 'isCorrect', !option.isCorrect)
                  }
                >
                  正確答案
                </Radio>
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

  const initSingleData = (itemId: string) => {
    let initOptions: SingleProps['options'] = []
    for (let i = 0; i < 3; i++) {
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
      type: '單選題' as const,
      options: initOptions
    }
  }

  return { SingleComponent, initSingleData }
}
