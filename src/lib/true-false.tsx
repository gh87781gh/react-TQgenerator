import { useContext } from 'react'
import styled from 'styled-components'

import {
  TrueFalseProps,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum,
  PermissionEnum
} from '../types'
import { MyContext } from '../TQgenerator'
import {
  optionDesignStyle,
  optionStyle,
  optionContentStyle
} from '../style/common'

const StyledDesignOption = styled.div`
  ${optionDesignStyle}
`
const StyledOption = styled.div`
  ${optionStyle}
  ${optionContentStyle}
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
  const { Label, Radio, Textarea } = formItems

  const onChangeOptionChecked = (optionKey: string) => {
    let { answer, response } = props
    if (context.status === StatusEnum.設計中) {
      answer = optionKey
    }
    if (context.status === StatusEnum.作答中) {
      response = optionKey
    }
    props.updateSection({ ...props, answer, response })
  }
  const onChangeOptionLabel = (optionKey: string, value: string) => {
    const options = props.options.map((option) => {
      if (option.key === optionKey) {
        return { ...option, label: value }
      } else return option
    })
    props.updateSection({ ...props, options })
  }

  const getPassedClass = (option: TrueFalseProps['options'][number]) => {
    if (
      context.permissions.includes(PermissionEnum.查看結果) &&
      props.response === option.key
    ) {
      return props.isPass ? 'passed' : 'failed'
    }
    return ''
  }
  const getAnswerClass = (option: TrueFalseProps['options'][number]) => {
    if (
      context.permissions.includes(PermissionEnum.查看答案) &&
      props.answer === option.key
    ) {
      return 'answer'
    }
    return ''
  }

  const renderOptionsDesign = () => {
    return props.options.map((option, index) => {
      return (
        <StyledDesignOption key={option.key}>
          <div>{answerOptions[index]}</div>
          <Textarea
            value={option.label}
            onChange={(e: any) =>
              onChangeOptionLabel(option.key, e.target.value)
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          {props.mode === ModeEnum.test && (
            <div style={{ width: '200px' }}>
              <Radio
                checked={option.key === props.answer}
                onChange={() => onChangeOptionChecked(option.key)}
              >
                正確答案
              </Radio>
            </div>
          )}
        </StyledDesignOption>
      )
    })
  }
  const renderOptionsReply = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Radio
            disabled={context.role !== props.role}
            checked={option.key === props.response}
            onChange={() => onChangeOptionChecked(option.key)}
          >
            <div
              className={`option-content 
                ${getPassedClass(option)} 
                ${getAnswerClass(option)}`}
            >
              <span className='option-content-answer'>
                {answerOptions[index]}
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
  const renderOptionsRead = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Radio disabled={true} checked={option.key === props.response}>
            <div
              className={`option-content 
                ${getPassedClass(option)} 
                ${getAnswerClass(option)}`}
            >
              <span className='option-content-answer'>
                {answerOptions[index]}
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
    [StatusEnum.設計中]: renderOptionsDesign,
    [StatusEnum.作答中]: renderOptionsReply,
    [StatusEnum.唯讀]: renderOptionsRead
  } as const
  return (
    <>
      <Label>選項</Label>
      {context.status &&
        renderOptions[context.status as keyof typeof renderOptions]?.()}
    </>
  )
}
