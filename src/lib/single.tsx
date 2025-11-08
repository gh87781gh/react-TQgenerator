import { useContext } from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import { v4 as uuid } from 'uuid'

import {
  SingleProps,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum,
  PermissionEnum
} from '../types'
import { MyContext } from '../TQgenerator'
import { getOptionLabel } from '../utils/getIndex2Letter'
import {
  optionDesignStyle,
  optionStyle,
  optionContentStyle,
  optionResultScoreStyle
} from '../style/common'

const StyledDesignOption = styled.div`
  ${optionDesignStyle}
`
const StyledOptionResult = styled.div`
  width: 300px;
  display: flex;
  align-items: center;
  flex-wrap: no-wrap;
  justify-content: flex-end;

  ${optionResultScoreStyle}
`
const StyledOption = styled.div`
  ${optionStyle}
  ${optionContentStyle}
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
  const onChangeOptionScore = (optionKey: string, value: number) => {
    const options = props.options.map((option) => {
      if (option.key === optionKey) {
        return { ...option, optionScore: value }
      } else return option
    })
    props.updateSection({ ...props, options })
  }

  const onDeleteOption = (key: string) => {
    const options = props.options.filter((option) => option.key !== key)
    props.updateSection({ ...props, options })
  }
  const onAddOption = () => {
    const options = _.cloneDeep(props.options)
    const key = uuid()
    options.push({
      key,
      label: '',
      value: key,
      optionScore: 0
    })
    props.updateSection({ ...props, options })
  }

  const getPassedClass = (option: SingleProps['options'][number]) => {
    if (
      context.permissions.includes(PermissionEnum.查看結果) &&
      props.response === option.key
    ) {
      return props.isPass ? 'passed' : 'failed'
    }
    return ''
  }
  const getAnswerClass = (option: SingleProps['options'][number]) => {
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
          <div>{getOptionLabel(index)}</div>
          <Textarea
            value={option.label}
            onChange={(e: any) =>
              onChangeOptionLabel(option.key, e.target.value)
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <StyledOptionResult>
            {props.mode === ModeEnum.test && (
              <Radio
                checked={option.key === props.answer}
                onChange={() => onChangeOptionChecked(option.key)}
              >
                正確答案
              </Radio>
            )}
            {props.mode === ModeEnum.questionnaire && (
              <>
                <div className='option-result-score'>分數</div>
                <InputNumber
                  value={option.optionScore}
                  precision={0}
                  min={0}
                  onChange={(value: number | null) =>
                    onChangeOptionScore(option.key, value ?? 0)
                  }
                />
              </>
            )}
            <BtnText
              key='delete'
              theme='danger'
              onClick={() => onDeleteOption(option.key)}
            >
              <icons.IconDeleteOutline />
            </BtnText>
          </StyledOptionResult>
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
    [StatusEnum.設計中]: renderOptionsDesign,
    [StatusEnum.作答中]: renderOptionsReply,
    [StatusEnum.唯讀]: renderOptionsRead
  } as const
  return (
    <>
      <Label>選項</Label>
      {renderOptions[context.status as keyof typeof renderOptions]?.()}
      {context.status === StatusEnum.設計中 && (
        <BtnOutline size='small' onClick={() => onAddOption()}>
          新增選項
        </BtnOutline>
      )}
    </>
  )
}
