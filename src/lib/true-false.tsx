import { useContext } from 'react'
import { TrueFalseProps } from '../types'
import { MyContext } from '../TQgenerator'
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
`

const answerOptions = ['O', 'X']
const getInitOptions: (id: string) => TrueFalseProps['options'] = (
  id: string
) => {
  let options: TrueFalseProps['options'] = []
  for (let i = 0; i < answerOptions.length; i++) {
    const key = `${id}-${i}`
    options.push({
      key,
      label: '',
      value: key,
      isCorrect: false
    })
  }
  return options
}
export const initTrueFalse: (
  id: string
) => Pick<TrueFalseProps, 'type' | 'boolean' | 'options'> = (id: string) => {
  return {
    type: '是非題',
    boolean: null,
    options: getInitOptions(id)
  }
}

export const TrueFalseComponent = (props: TrueFalseProps) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Input, Label, Radio } = formItems

  const editOptions = (
    key: string,
    optionKey: 'label' | 'isCorrect',
    value: string | boolean | number
  ) => {
    const { options } = props
    const newOptions = options.map((option) => {
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
    props.updateSection({ ...props, options: newOptions })
  }
  const renderOptions = (isEdit: boolean) => {
    return props.options.map((option, index) => {
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
          {props.mode === 'test' && (
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
      {renderOptions(props.isEdit)}
    </>
  )
}
