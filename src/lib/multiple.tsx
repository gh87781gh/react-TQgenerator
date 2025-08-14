import styled from 'styled-components'
import { MultipleProps, TQgeneratorProps } from '../types'

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
let initOptions: MultipleProps['options'] = []
for (let i = 0; i < 4; i++) {
  const key = `${new Date().getTime().toString()}-${i}`
  initOptions.push({
    key,
    label: '',
    value: key,
    isCorrect: false,
    score: 0
  })
}
export const initMultiple: Pick<MultipleProps, 'type' | 'options'> = {
  type: '多選題',
  options: initOptions
}
export const MultipleComponent = (
  props: MultipleProps & {
    components: TQgeneratorProps['components']
    utility: TQgeneratorProps['utility']
  }
) => {
  const { components, utility } = props
  const { icons } = utility
  const { IconDeleteOutline } = icons
  const { formItems, btnItems } = components
  const { Input, Label, InputNumber, Checkbox } = formItems
  const { BtnOutline, BtnText } = btnItems
  const editOptions = (
    key: (typeof answerOptions)[number],
    optionKey: 'label' | 'isCorrect' | 'score',
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
      score: 0
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
          <div className='option-result'>
            {props.mode === 'test' && (
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
                <IconDeleteOutline />
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
      {renderOptions(props.isEdit)}
      {props.isEdit && (
        <BtnOutline size='small' onClick={() => addOption()}>
          新增選項
        </BtnOutline>
      )}
    </>
  )
}

MultipleComponent.displayName = 'MultipleComponent'
