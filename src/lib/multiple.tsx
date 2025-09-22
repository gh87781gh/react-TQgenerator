import { useContext, useCallback } from 'react'
import styled from 'styled-components'
import { MultipleProps, TypeKeysEnum, ModeEnum, StatusEnum } from '../types'
import { MyContext } from '../TQgenerator'
import { getOptionLabel } from '../utils'
import { isEditable } from '../isEditable'

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
      optionScore: 0
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

  const editOptions = useCallback(
    (
      optionKey: string,
      key: 'label' | 'isChecked' | 'optionScore',
      value?: string | boolean | number
    ) => {
      let { answer, response, options, finalScore } = props
      if (key === 'isChecked') {
        if (context.status === StatusEnum.editing) {
          if (value && !(answer as string[])?.includes(optionKey)) {
            answer = [...(answer as string[]), optionKey]
          } else {
            answer = (answer as string[]).filter((key) => key !== optionKey)
          }
        }
        if (
          context.status === StatusEnum.waiting_for_response ||
          context.status === StatusEnum.waiting_for_correct
        ) {
          if (value && !(response as string[])?.includes(optionKey)) {
            response = [...(response as string[]), optionKey]
          } else {
            response = (response as string[]).filter((key) => key !== optionKey)
          }
          /**
           * 在問卷裡，分數做在答案上，所以只要有勾選，就要加進該題得分裡
           * 在測驗裡，分數做在題目上，所選答案要完全符合正確答案，才能獲得該題的分數
           */
          if (context.mode === ModeEnum.test) {
            // 檢查response是否完全符合answer，符合則加該題分數，不符合則得0分
            const isCorrect = (response as string[]).every((key) =>
              (answer as string[]).includes(key)
            )
            finalScore = isCorrect ? props.score : 0
          } else if (context.mode === ModeEnum.questionnaire) {
            // 抓所有已勾選的option，將其optionScore累加到該題得分裡
            const correctOptions = options.filter((option) =>
              (response as string[]).includes(option.key)
            )
            finalScore = correctOptions.reduce((acc, option) => {
              return (acc += option.optionScore || 0)
            }, 0)
          }
        }
        props.updateSection({ ...props, answer, response, finalScore })
      }

      if (key === 'label' || key === 'optionScore') {
        const newOptions = options.map((option) => {
          if (option.key === optionKey) {
            return { ...option, [key]: value }
          }
          return option
        })
        props.updateSection({ ...props, options: newOptions })
      }
    },
    [props, context]
  )
  const deleteOption = useCallback(
    (key: string) => {
      const { options } = props
      const newOptions = options.filter((option) => option.key !== key)
      props.updateSection({ ...props, options: newOptions })
    },
    [props]
  )
  const addOption = useCallback(() => {
    const { options } = props
    const newOptions = [...options]
    const key = new Date().getTime().toString()
    newOptions.push({
      key,
      label: '',
      value: key,
      optionScore: 0
    })
    props.updateSection({ ...props, options: newOptions })
  }, [props])

  const renderOptionsEditing = useCallback(() => {
    return props.options.map((option, index) => {
      return (
        <StyledEditingOption key={option.key}>
          <div>{getOptionLabel(index)}</div>
          <Input
            value={option.label}
            onChange={(e: any) =>
              editOptions(option.key, 'label', e.target.value)
            }
          />
          <div className='option-result'>
            {props.mode === ModeEnum.test && (
              <Checkbox
                checked={(props.answer as string[]).includes(option.key)}
                onChange={() =>
                  editOptions(
                    option.key,
                    'isChecked',
                    !(props.answer as string[])?.includes(option.key)
                  )
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
                  value={option.optionScore}
                  precision={0}
                  min={0}
                  onChange={(value: any) =>
                    editOptions(option.key, 'optionScore', Number(value) || 0)
                  }
                />
              </>
            )}
            {context.status === StatusEnum.editing && (
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
  }, [props])
  const renderOptionsResponse = useCallback(() => {
    const isDisabled = !isEditable(context, props)
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Checkbox
            disabled={isDisabled}
            checked={(props.response as string[])?.includes(option.key)}
            onChange={() =>
              editOptions(
                option.key,
                'isChecked',
                !(props.response as string[])?.includes(option.key)
              )
            }
          >
            {getOptionLabel(index)} {option.label}
          </Checkbox>
        </StyledOption>
      )
    })
  }, [props, context])

  const renderOptions = {
    [StatusEnum.editing]: renderOptionsEditing,
    [StatusEnum.preview_editing]: renderOptionsResponse,
    [StatusEnum.waiting_for_response]: renderOptionsResponse,
    [StatusEnum.waiting_for_correct]: renderOptionsResponse,
    [StatusEnum.finished]: renderOptionsResponse
  } as const
  return (
    <>
      <Label>選項</Label>
      {renderOptions[context.status as keyof typeof renderOptions]?.()}
      {context.status === StatusEnum.editing && (
        <BtnOutline size='small' onClick={() => addOption()}>
          新增選項
        </BtnOutline>
      )}
    </>
  )
}
