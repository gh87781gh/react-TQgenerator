import { useContext } from 'react'
import { SingleProps } from '../types'
import { MyContext } from '../TQgenerator'
import { getOptionLabel } from '../utils'
import styled from 'styled-components'

const StyledEditingOption = styled.div`
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

const StyledOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &:not(:last-child) {
    margin-bottom: var(--gap-small);
  }

  > *:not(:last-child) {
    margin-right: var(--gap-normal);
  }
`

const getInitOptions: (id: string) => SingleProps['options'] = (id: string) => {
  let options: SingleProps['options'] = []
  for (let i = 0; i < 3; i++) {
    const key = `${id}-${i}`
    options.push({
      key,
      label: '',
      value: key,
      isCorrect: false,
      score: 0,
      isChecked: false
    })
  }
  return options
}
export const initSingle: (
  id: string
) => Pick<SingleProps, 'type' | 'options'> = (id: string) => {
  return {
    type: '單選題',
    options: getInitOptions(id)
  }
}

export const SingleComponent = (props: SingleProps) => {
  const context = useContext(MyContext)
  const { components, utility } = context
  const { icons } = utility
  const { formItems, btnItems } = components
  const { Input, Label, Radio, InputNumber } = formItems
  const { BtnOutline, BtnText } = btnItems

  const editOptions = (
    key: string,
    optionKey: 'label' | 'isCorrect' | 'score' | 'isChecked',
    value: string | boolean | number
  ) => {
    const { options } = props
    const newOptions = options.map((option) => {
      if (option.key === key) {
        if (optionKey === 'isCorrect') {
          option.isCorrect = value as boolean
        } else if (optionKey === 'label') {
          option.label = value as string
        } else if (optionKey === 'score') {
          option.score = value as number
        } else if (optionKey === 'isChecked') {
          option.isChecked = value as boolean
        }
      } else {
        if (optionKey === 'isCorrect') {
          option.isCorrect = false
        } else if (optionKey === 'isChecked') {
          option.isChecked = false
        }
      }
      return option
    })
    props.updateSection({ ...props, options: newOptions })
  }
  const deleteOption = (key: string) => {
    const { options } = props
    const newOptions = options.filter((option) => option.key !== key)
    props.updateSection({ ...props, options: newOptions })
  }
  const addOption = () => {
    const { options } = props
    const newOptions = [...options]
    const key = new Date().getTime().toString()
    newOptions.push({
      key,
      label: '',
      value: key,
      isCorrect: false,
      score: 0,
      isChecked: false
    })
    props.updateSection({ ...props, options: newOptions })
  }

  const renderEditingOptions = (isEdit: boolean) => {
    return props.options.map((option, index) => {
      return (
        <StyledEditingOption key={option.key}>
          <div>{getOptionLabel(index)}</div>
          <Input
            disabled={!isEdit}
            value={option.label}
            onChange={(e: any) =>
              editOptions(option.key, 'label', e.target.value)
            }
          />
          <div className='option-result'>
            {props.mode === 'test' && (
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
            {props.mode === 'questionnaire' && (
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
                <icons.IconDeleteOutline />
              </BtnText>
            )}
          </div>
        </StyledEditingOption>
      )
    })
  }

  const renderStaticOptions = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <div>{getOptionLabel(index)}</div>
          <div>{option.label}</div>
          <Radio
            checked={option.isChecked || false}
            onChange={() =>
              editOptions(option.key, 'isChecked', !option.isChecked)
            }
          />
        </StyledOption>
      )
    })
  }
  return (
    <>
      <Label>選項</Label>
      {context.status === 'editing'
        ? renderEditingOptions(props.isEdit)
        : renderStaticOptions()}
      {context.status === 'editing' && props.isEdit && (
        <BtnOutline size='small' onClick={() => addOption()}>
          新增選項
        </BtnOutline>
      )}
    </>
  )
}
