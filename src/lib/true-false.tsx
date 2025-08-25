import React, { useContext, useMemo } from 'react'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'

import { TrueFalseProps } from '../types'
import { MyContext, MyContextType } from '../TQgenerator'

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
`

const answerOptions = ['A', 'B']

export const useTrueFalse = () => {
  const TrueFalseComponent: React.FC<{
    section: TrueFalseProps
    updateSection: (data: any) => void
  }> = ({ section, updateSection }) => {
    const { components } = useContext<MyContextType>(MyContext)
    const { formItems } = components
    const { Input, Label, Radio } = formItems

    const editOptions = (
      key: string,
      optionKey: 'label' | 'isCorrect',
      value: string | boolean | number
    ) => {
      const newOptions = section.options.map((option) => {
        if (option.key === key) {
          if (optionKey === 'isCorrect') {
            option.isCorrect = value as boolean
          } else if (optionKey === 'label') {
            option.label = value as string
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
            {section.mode === 'test' && (
              <div style={{ width: '200px' }}>
                <Radio
                  disabled={!isEdit}
                  checked={option.isCorrect}
                  onChange={() =>
                    editOptions(option.key, 'isCorrect', !option.isCorrect)
                  }
                >
                  正確答案
                </Radio>
              </div>
            )}
          </StyledOption>
        )
      })
    }

    return (
      <>
        <Label>選項</Label>
        {renderOptions(section.isEdit)}
      </>
    )
  }

  const initTrueFalseData: Pick<
    TrueFalseProps,
    'type' | 'boolean' | 'options'
  > = useMemo(() => {
    let initOptions: TrueFalseProps['options'] = []
    for (let i = 0; i < answerOptions.length; i++) {
      const key = uuid()
      initOptions.push({
        key,
        label: '',
        value: key,
        isCorrect: false
      })
    }
    return {
      type: '是非題',
      boolean: null,
      options: initOptions
    }
  }, [])

  return { TrueFalseComponent, initTrueFalseData }
}
