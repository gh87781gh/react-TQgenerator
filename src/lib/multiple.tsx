import { useContext } from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import { v4 as uuid } from 'uuid'

import {
  MultipleProps,
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
  optionResultStyle,
  optionResultScoreStyle
} from '../style/common'

const StyledDesignOption = styled.div`
  ${optionDesignStyle}
  ${optionResultStyle}
`
const StyledOption = styled.div`
  ${optionStyle}
  ${optionContentStyle}
  ${optionResultScoreStyle}

  .ant-checkbox {
    align-self: flex-start;
    padding: 12px 0;
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
  const { Label, InputNumber, Checkbox, Textarea } = formItems
  const { BtnOutline, BtnText } = btnItems

  const onChangeOptionChecked = (optionKey: string, value: boolean) => {
    let { answer, response } = props
    if (context.status === StatusEnum.設計中) {
      if (value && !(answer as string[])?.includes(optionKey)) {
        answer = [...(answer as string[]), optionKey]
      } else {
        answer = (answer as string[]).filter((key) => key !== optionKey)
      }
    }
    if (context.status === StatusEnum.作答中) {
      if (value && !(response as string[])?.includes(optionKey)) {
        response = [...(response as string[]), optionKey]
      } else {
        response = (response as string[]).filter((key) => key !== optionKey)
      }
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

  const getPassedClass = (option: MultipleProps['options'][number]) => {
    if (
      context.permissions.includes(PermissionEnum.查看結果) &&
      props.response === option.key
    ) {
      return props.isPass ? 'passed' : 'failed'
    }
    return ''
  }
  const getAnswerClass = (option: MultipleProps['options'][number]) => {
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
          <div className='option-result'>
            {props.mode === ModeEnum.test && (
              <Checkbox
                checked={(props.answer as string[]).includes(option.key)}
                onChange={() =>
                  onChangeOptionChecked(
                    option.key,
                    !(props.answer as string[])?.includes(option.key)
                  )
                }
              >
                正確答案
              </Checkbox>
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
            {context.status === StatusEnum.設計中 && (
              <BtnText
                key='delete'
                theme='danger'
                onClick={() => onDeleteOption(option.key)}
              >
                <IconDeleteOutline />
              </BtnText>
            )}
          </div>
        </StyledDesignOption>
      )
    })
  }
  const renderOptionsReply = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Checkbox
            disabled={context.role !== props.role}
            checked={(props.response as string[])?.includes(option.key)}
            onChange={() =>
              onChangeOptionChecked(
                option.key,
                !(props.response as string[])?.includes(option.key)
              )
            }
          >
            <div
              className={`option-content 
                ${getPassedClass(option)} 
                ${getAnswerClass(option)}`}
            >
              <span className={'option-content-answer'}>
                {getOptionLabel(index)}
              </span>
              <span
                className='option-content-label'
                dangerouslySetInnerHTML={{
                  __html: option.label.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </Checkbox>
        </StyledOption>
      )
    })
  }
  const renderOptionsRead = () => {
    return props.options.map((option, index) => {
      return (
        <StyledOption key={option.key}>
          <Checkbox
            disabled={true}
            checked={(props.response as string[])?.includes(option.key)}
          >
            <div
              className={`option-content 
                ${getPassedClass(option)} 
                ${getAnswerClass(option)}`}
            >
              <span className={'option-content-answer'}>
                {getOptionLabel(index)}
              </span>
              <span
                className='option-content-label'
                dangerouslySetInnerHTML={{
                  __html: option.label.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </Checkbox>
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
