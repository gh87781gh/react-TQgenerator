import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import './variables.css'
import packageJson from '../package.json'
import {
  DndContext,
  MouseSensor,
  useSensor,
  PointerSensor
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  verticalListSortingStrategy,
  SortableContext
} from '@dnd-kit/sortable'

import {
  initBaseSection,
  SectionProps,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum,
  TQgeneratorProps
} from './types'
import { initTrueFalse } from './lib/true-false'
import { initSingle } from './lib/single'
import { initMultiple } from './lib/multiple'
import { initField } from './lib/field'
import { initEssay } from './lib/essay'
import { initRating } from './lib/rating'

import { SortableItem } from './SortableSection'
import { SectionContent } from './SortableSection'
import { autoCorrectQuestionnaire } from './autoCorrect'
// import { autoCorrectTest } from './autoCorrect'

const StyledTQgenerator = styled.div`
  width: 100%;
  height: auto;
  background-color: var(--color-white);
  color: var(--color-black);
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-primary);

  .section {
    background-color: var(--color-white);
    border-radius: 0.5rem;
    border: 1px solid var(--color-border-base);
    transition: all 0.2s ease;
    cursor: pointer;

    &:not(:last-child) {
      margin-bottom: calc(var(--gap-normal) * 2);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    &.editing {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .section-title {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border-base);
    user-select: none;

    > * {
      display: inline-block;
      vertical-align: middle;

      &:not(:last-child) {
        margin-right: 1rem;
      }
    }

    .section-title-drag {
      cursor: grab;
      padding: 0.5rem;
      margin-right: 0.5rem;
      user-select: none;
      border-radius: 4px;

      &:active {
        cursor: grabbing;
      }

      &:hover {
        background-color: var(--color-hover, #f5f5f5);
      }
    }
  }

  .section-body {
    padding: 1rem;

    & > *:not(:last-child) {
      margin-bottom: var(--gap-normal);
    }
  }

  .section-body-question {
    &:not(.active) {
      background-color: var(--color-disabled-bgc);
      padding: 1rem;
      border-radius: 0.5rem;
    }

    &.empty {
      background-color: var(--color-danger-light);
    }
  }

  .section-body-question-option {
    & > *:not(:last-child) {
      margin-bottom: var(--gap-small);
    }
  }

  .section-body-add {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 300px;
    margin: 0 auto;

    > *:not(:last-child) {
      margin-right: 1rem;
    }
  }

  .version {
    text-align: center;
    color: var(--color-disabled-icon);
    font-size: 0.8rem;
    margin-top: var(--gap-normal);
  }
`

export type MyContextType = Omit<TQgeneratorProps, 'setStatus'>
export const MyContext = React.createContext<MyContextType>({} as MyContextType)

const TypeKeysForTest = [
  TypeKeysEnum.是非題,
  TypeKeysEnum.單選題,
  TypeKeysEnum.多選題,
  TypeKeysEnum.填充題,
  TypeKeysEnum.問答題
]
const TypeKeysForQuest = [
  TypeKeysEnum.單選題,
  TypeKeysEnum.多選題,
  TypeKeysEnum.填充題,
  TypeKeysEnum.問答題,
  TypeKeysEnum.評分題
]

const TQgenerator: React.FC<TQgeneratorProps> = (props) => {
  const {
    config,
    actions,
    mode,
    status,
    actorID,
    reviewerID,
    sections,
    setSections,
    result,
    components,
    utility
  } = props

  if (!mode || !status) {
    console.error('mode or status is not set')
    return null
  }

  const { formItems, btnItems } = components
  const { Select } = formItems
  const { BtnPrimary, BtnOutline, BtnGroup } = btnItems

  // NOTE Section 資料處理
  const [type, setType] = useState<TypeKeysEnum>(
    mode === ModeEnum.test
      ? TypeKeysForTest[0]
      : mode === ModeEnum.questionnaire
      ? TypeKeysForQuest[0]
      : TypeKeysEnum.是非題 // TODO 應該要是null
  )
  const addSection = (type: TypeKeysEnum) => {
    const currentSections = sections.map((section) => {
      section.isEdit = false
      return section
    })

    const id = String(sections.length + 1)

    let newItem = { ...initBaseSection }
    newItem.mode = mode as ModeEnum
    newItem.id = id as string

    switch (type) {
      case TypeKeysEnum.是非題:
        newItem = { ...newItem, answer: '', response: '', ...initTrueFalse(id) }
        break
      case TypeKeysEnum.單選題:
        newItem = { ...newItem, answer: '', response: '', ...initSingle(id) }
        break
      case TypeKeysEnum.多選題:
        newItem = { ...newItem, answer: [], response: [], ...initMultiple(id) }
        break
      case TypeKeysEnum.填充題:
        newItem = { ...newItem, ...initField }
        break
      case TypeKeysEnum.問答題:
        newItem = { ...newItem, ...initEssay }
        break
      case TypeKeysEnum.評分題:
        newItem = { ...newItem, ...initRating }
        break
      default:
        console.error('Invalid Section Type')
    }
    const newSections = [
      ...currentSections,
      { ...newItem }
    ] as SectionProps<TypeKeysEnum>[]
    setSections?.(newSections)
  }
  const editSection = (
    id: string | null,
    data: Partial<SectionProps<TypeKeysEnum>>
  ) => {
    if (!id) return

    const newSections = sections.map((section) => {
      if (section.id === id) {
        return { ...section, ...data }
      } else if (data.isEdit === true) {
        return { ...section, isEdit: false }
      } else {
        return section
      }
    })
    setSections?.(newSections as SectionProps<TypeKeysEnum>[])
  }
  const deleteSection = (id: string | null) => {
    if (!id) return

    const newSections = sections.filter((section) => section.id !== id)
    setSections?.(newSections)
  }

  // NOTE DND
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  })
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10
    }
  })
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id)
      const newIndex = sections.findIndex((section) => section.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections?.(newSections)
    }
  }

  const renderActionSubmitEditing = useCallback(() => {
    return (
      status === StatusEnum.editing && (
        <BtnGroup style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <BtnOutline onClick={() => actions?.onPreviewEditing?.()}>
            預覽
          </BtnOutline>
          <BtnPrimary onClick={() => actions?.onSubmitEditing?.()}>
            儲存
          </BtnPrimary>
        </BtnGroup>
      )
    )
  }, [actions, status])
  const renderActionEditing = useCallback(() => {
    return (
      status === StatusEnum.editing && (
        <div className='section-body-add'>
          <Select
            allowClear={false}
            options={getOptions()}
            value={type}
            onChange={(value: any) => {
              setType(value as TypeKeysEnum)
            }}
          />
          <BtnPrimary onClick={() => addSection(type)}>新增</BtnPrimary>
        </div>
      )
    )
  }, [type, status])
  const renderActionResponse = useCallback(() => {
    return (
      <div className='section-body-add'>
        <BtnPrimary
          onClick={() => {
            const score = autoCorrectQuestionnaire(sections)
            actions?.onSubmitResponse?.(score)
          }}
        >
          提交測驗
        </BtnPrimary>
      </div>
    )
  }, [sections, actions])
  const renderActionCorrect = useCallback(() => {
    const finalTotalScore = result?.score || 0
    return (
      <>
        {status === StatusEnum.waiting_for_correct && (
          <div>總得分：{result?.score}</div>
        )}
        {config?.isShowCorrectActionPass ? (
          <>
            <BtnOutline
              onClick={() =>
                actions?.onSubmitCorrect?.(
                  finalTotalScore,
                  config?.ReviewResultMap?.不通過 ?? null
                )
              }
            >
              不通過
            </BtnOutline>
            <BtnPrimary
              onClick={() =>
                actions?.onSubmitCorrect?.(
                  finalTotalScore,
                  config?.ReviewResultMap?.通過 ?? null
                )
              }
            >
              通過
            </BtnPrimary>
          </>
        ) : config?.isShowCorrectActionSubmit ? (
          <BtnPrimary
            onClick={() => {
              actions?.onSubmitCorrect?.(finalTotalScore, null)
            }}
          >
            送出
          </BtnPrimary>
        ) : null}
      </>
    )
  }, [mode, config, result?.score, actions])
  const renderActionFinish = useCallback(() => {
    if (config?.isAllowReviewScore) {
      return (
        <div
          style={{
            width: '100%',
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          總得分：{result?.score}
        </div>
      )
    }
    return <></>
  }, [result?.score, config, actions])
  const renderAction = {
    [StatusEnum.editing]: renderActionEditing,
    [StatusEnum.waiting_for_response]: renderActionResponse,
    [StatusEnum.waiting_for_correct]: renderActionCorrect,
    [StatusEnum.finished]: renderActionFinish
  }

  const getOptions = () => {
    return mode === ModeEnum.test
      ? TypeKeysForTest.map((key) => {
          return {
            key,
            value: key,
            label: key
          }
        })
      : mode === ModeEnum.questionnaire
      ? TypeKeysForQuest.map((key) => {
          return {
            key,
            value: key,
            label: key
          }
        })
      : []
  }
  return (
    <MyContext.Provider
      value={{
        mode,
        status,
        sections,
        setSections,
        actorID,
        reviewerID,
        components,
        utility,
        result
      }}
    >
      <StyledTQgenerator>
        {renderActionSubmitEditing?.()}

        <DndContext
          sensors={[mouseSensor, pointerSensor]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections
              .map((section) => section.id)
              .filter((id): id is string => id !== null)}
            strategy={verticalListSortingStrategy}
          >
            {sections
              .filter((section) => section.id !== null)
              .map((section, index) => {
                return (
                  <SortableItem key={section.id} id={section.id!}>
                    <SectionContent
                      section={section}
                      index={index}
                      editSection={editSection}
                      deleteSection={deleteSection}
                    />
                  </SortableItem>
                )
              })}
          </SortableContext>
        </DndContext>

        <div
          style={{
            width: '100%',
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {renderAction[status as keyof typeof renderAction]?.()}
        </div>

        <div className='version'>v{packageJson.version}</div>
      </StyledTQgenerator>
    </MyContext.Provider>
  )
}
export default TQgenerator
