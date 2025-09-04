import { useContext } from 'react'
import styled from 'styled-components'
import { MultipleProps, TypeKeysEnum, ModeEnum, StatusEnum } from '../types'
import { MyContext } from '../TQgenerator'
import { getOptionLabel } from '../utils'

const StyledEditingOption = styled.div`
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

const getInitOptions: (id: string) => MultipleProps['options'] = (
  id: string
) => {
  let options: MultipleProps['options'] = []
  for (let i = 0; i < 4; i++) {
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
export const initMultiple: (
  id: string
) => Pick<MultipleProps, 'type' | 'options'> = (id: string) => {
  return {
    type: TypeKeysEnum.多選題,
    options: getInitOptions(id)
  }
}
export const MultipleComponent = (props: MultipleProps) => {
  const context = useContext(MyContext)
  const { components, utility } = context
  const { icons } = utility
  const { IconDeleteOutline } = icons
  const { formItems, btnItems } = components
  const { Input, Label, InputNumber, Checkbox } = formItems
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
            {props.mode === ModeEnum.test && (
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
            {props.mode === ModeEnum.questionnaire && (
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
                <IconDeleteOutline />
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
          <Checkbox
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
      {context.status === StatusEnum.editing
        ? renderEditingOptions(props.isEdit)
        : renderStaticOptions()}
      {context.status === StatusEnum.editing && props.isEdit && (
        <BtnOutline size='small' onClick={() => addOption()}>
          新增選項
        </BtnOutline>
      )}
    </>
  )
}
