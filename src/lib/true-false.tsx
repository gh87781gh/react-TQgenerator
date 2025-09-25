import { useContext, useCallback } from 'react'
import { TrueFalseProps, TypeKeysEnum, ModeEnum, StatusEnum } from '../types'
import { MyContext } from '../TQgenerator'
import styled from 'styled-components'
import { isEditable } from '../isEditable'

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
`
const StyledOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &:not(:last-child) {
    margin-bottom: var(--gap-small);
  }

  &.passed {
    color: var(--color-success);
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
      isChecked: false
    })
  }
  return options
}
export const initTrueFalse: (
  id: string
) => Pick<TrueFalseProps, 'type' | 'boolean' | 'options'> = (id: string) => {
  return {
    type: TypeKeysEnum.是非題,
    boolean: null,
    options: getInitOptions(id)
  }
}

export const TrueFalseComponent = (props: TrueFalseProps) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Input, Label, Radio } = formItems

  const editOptions = useCallback(
    (
      optionKey: string,
      key: 'label' | 'isChecked',
      value?: string | boolean | number
    ) => {
      let { answer, response, options, finalScore } = props
      if (key === 'isChecked') {
        if (context.status === StatusEnum.editing) {
          answer = optionKey
        }
        if (
          context.status === StatusEnum.waiting_for_response ||
          context.status === StatusEnum.waiting_for_correct ||
          (context.status === StatusEnum.finished &&
            context.config?.isAllowReCorrect)
        ) {
          response = optionKey
          if (context.mode === ModeEnum.test) {
            finalScore = response === answer ? props.score : 0
          }
        }
        props.updateSection({ ...props, answer, response, finalScore })
      }

      if (key === 'label') {
        const newOptions = options.map((option) => {
          if (key === 'label') {
            if (option.key === optionKey) {
              option.label = value as string
            }
          }
          return option
        })
        props.updateSection({ ...props, options: newOptions })
      }
    },
    [props, context]
  )
  const renderOptionsEditing = useCallback(() => {
    return props.options.map((option, index) => {
      return (
        <StyledEditingOption key={option.key}>
          <div>{answerOptions[index]}</div>
          <Input
            value={option.label}
            onChange={(e: any) =>
              editOptions(option.key, 'label', e.target.value)
            }
          />
          {props.mode === ModeEnum.test && (
            <div style={{ width: '200px' }}>
              <Radio
                checked={option.key === props.answer}
                onChange={() => editOptions(option.key, 'isChecked')}
              >
                正確答案
              </Radio>
            </div>
          )}
        </StyledEditingOption>
      )
    })
  }, [props])
  const renderOptionsResponse = useCallback(() => {
    const isDisabled = !isEditable(context, props)
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Radio
            disabled={isDisabled}
            checked={option.key === props.response}
            onChange={() => editOptions(option.key, 'isChecked')}
          />
          <div>{answerOptions[index]}</div>
          <div>{option.label}</div>
        </StyledOption>
      )
    })
  }, [props, context])
  const renderOptionsFinished = useCallback(() => {
    return props.options.map((option, index) => {
      const isPassed =
        props.answer === props.response && props.response === option.key
      return (
        <StyledOption className={isPassed ? 'passed' : ''} key={option.key}>
          <Radio
            disabled={true}
            checked={option.key === props.response}
            onChange={() => editOptions(option.key, 'isChecked')}
          />
          <div>{answerOptions[index]}</div>
          <div>{option.label}</div>
        </StyledOption>
      )
    })
  }, [props])

  const renderOptions = {
    [StatusEnum.editing]: renderOptionsEditing,
    [StatusEnum.preview_editing]: renderOptionsResponse,
    [StatusEnum.waiting_for_response]: renderOptionsResponse,
    [StatusEnum.waiting_for_correct]: renderOptionsResponse,
    [StatusEnum.finished]: renderOptionsFinished
  } as const
  return (
    <>
      <Label>選項</Label>
      {context.status &&
        renderOptions[context.status as keyof typeof renderOptions]?.()}
    </>
  )
}
