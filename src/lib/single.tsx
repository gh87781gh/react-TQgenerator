import { useContext, useCallback, useMemo } from 'react'
import { SingleProps, TypeKeysEnum, ModeEnum, StatusEnum } from '../types'
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

  .option-content {
    display: flex;
    align-items: baseline;

    &.answer {
      font-weight: 800;
      color: var(--color-black);
    }
    &.passed {
      color: var(--color-success) !important;
    }
    &.failed {
      color: var(--color-danger) !important;
    }
  }

  .option-content-answer {
    min-width: 1em;
    margin-right: 2px;
  }

  .option-content-label {
    line-height: 1.3;
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
      optionScore: 0
    })
  }
  return options
}
export const initSingle: (
  id: string
) => Pick<SingleProps, 'type' | 'options'> = (id: string) => {
  return {
    type: TypeKeysEnum.單選題,
    options: getInitOptions(id)
  }
}

export const SingleComponent = (props: SingleProps) => {
  const context = useContext(MyContext)
  const { components, utility } = context
  const { icons } = utility
  const { formItems, btnItems } = components
  const { Label, Radio, InputNumber, Textarea } = formItems
  const { BtnOutline, BtnText } = btnItems

  const editOptions = useCallback(
    (
      optionKey: string,
      key: 'label' | 'isChecked' | 'optionScore',
      value?: string | boolean | number
    ) => {
      let { answer, response, options, finalScore, isPass } = props

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
            if (response === answer) {
              finalScore = props.score
              isPass = true
            } else {
              finalScore = 0
              isPass = false
            }
          } else if (context.mode === ModeEnum.questionnaire) {
            finalScore =
              options.find((option) => option.key === optionKey)?.optionScore ||
              0
          }
        }
        props.updateSection({ ...props, answer, response, finalScore, isPass })
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

  const passedClass = useMemo(
    () => (option: SingleProps['options'][number]) => {
      if (context.mode === ModeEnum.test) {
        const theme = props.isPass ? 'passed' : 'failed'
        if (props.response === option.key) {
          return theme
        } else return ''
      }
    },
    [context, props]
  )
  const answerClass = useMemo(
    () => (option: SingleProps['options'][number]) => {
      if (context.mode === ModeEnum.test)
        return props.answer === option.key ? 'answer' : ''

      return ''
    },
    [context, props]
  )

  const renderOptionsEditing = () => {
    return props.options.map((option, index) => {
      return (
        <StyledEditingOption key={option.key}>
          <div>{getOptionLabel(index)}</div>
          <Textarea
            value={option.label}
            onChange={(e: any) =>
              editOptions(option.key, 'label', e.target.value)
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <div className='option-result'>
            {props.mode === ModeEnum.test && (
              <Radio
                checked={option.key === props.answer}
                onChange={() => editOptions(option.key, 'isChecked')}
              >
                正確答案
              </Radio>
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
            <BtnText
              key='delete'
              theme='danger'
              onClick={() => deleteOption(option.key)}
            >
              <icons.IconDeleteOutline />
            </BtnText>
          </div>
        </StyledEditingOption>
      )
    })
  }
  const renderOptionsPreviewEditing = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Radio disabled={true} checked={option.key === props.response}>
            <div className='option-content'>
              <span className='option-content-answer'>
                {getOptionLabel(index)}
              </span>
              <span
                className='option-content-label'
                dangerouslySetInnerHTML={{
                  __html: option.label.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </Radio>
        </StyledOption>
      )
    })
  }
  const renderOptionsResponse = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Radio
            disabled={props.role !== context.role}
            checked={option.key === props.response}
            onChange={() => editOptions(option.key, 'isChecked')}
          >
            <div className='option-content'>
              <span className='option-content-answer'>
                {getOptionLabel(index)}
              </span>
              <span
                className='option-content-label'
                dangerouslySetInnerHTML={{
                  __html: option.label.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </Radio>
        </StyledOption>
      )
    })
  }
  const renderOptionsCorrectAndFinished = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Radio
            disabled={
              props.role !== context.role ||
              context.status === StatusEnum.finished
            }
            checked={option.key === props.response}
            onChange={() => {
              if (context.status === StatusEnum.waiting_for_correct) {
                editOptions(option.key, 'isChecked')
              }
            }}
          >
            <div
              className={`option-content ${passedClass(option)} ${answerClass(
                option
              )}`}
            >
              <span className='option-content-answer'>
                {getOptionLabel(index)}
              </span>
              <span
                className='option-content-label'
                dangerouslySetInnerHTML={{
                  __html: option.label.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </Radio>
        </StyledOption>
      )
    })
  }

  const renderOptions = {
    [StatusEnum.editing]: renderOptionsEditing,
    [StatusEnum.preview_editing]: renderOptionsPreviewEditing,
    [StatusEnum.waiting_for_response]: renderOptionsResponse,
    [StatusEnum.waiting_for_correct]: renderOptionsCorrectAndFinished,
    [StatusEnum.finished]: renderOptionsCorrectAndFinished
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
