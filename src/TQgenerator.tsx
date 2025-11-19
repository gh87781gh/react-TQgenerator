import React, { useState } from 'react'
import styled from 'styled-components'
import './style/variables.css'
import _ from 'lodash'
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
import { v4 as uuid } from 'uuid'

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

const StyledTQgenerator = styled.div`
  width: 100%;
  height: auto;
  background-color: var(--color-white);
  color: var(--color-black);
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-primary);

  .article-title,
  .article-footer {
    padding: 2rem;

    & > *:not(:last-child) {
      margin-bottom: var(--gap-normal);
    }
  }
  .article-title {
    border-bottom: 1px solid var(--color-border-base);
  }
  .article-footer {
    border-top: 1px solid var(--color-border-base);
  }

  .version {
    text-align: center;
    color: var(--color-disabled-icon);
    font-size: 0.8rem;
  }

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

    &.responding {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border-base);
    user-select: none;

    > * {
      display: inline-block;
      vertical-align: middle;
    }

    > span {
      color: var(--color-disabled-icon);

      &:not(:last-child)::after {
        content: '|';
        margin-left: 1rem;
        margin-right: 1rem;
      }
    }

    > .section-title-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
    }

    .section-title-status {
      font-style: normal;
      color: var(--color-white);
      background-color: var(--color-disabled);
      padding: 0.25rem 0.75rem;
      border-radius: 30px;

      &.passed {
        background-color: var(--color-success);
      }
      &.failed {
        background-color: var(--color-danger);
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

    // TODO 要增加空題報錯的樣式
    &.empty {
      background-color: var(--color-danger-light);
    }
  }

  .section-body-question-editor {
    width: 100%;
    height: 400px;
    overflow-y: auto;
    border: 1px solid var(--color-border-base);
  }

  .section-body-question-option {
    & > *:not(:last-child) {
      margin-bottom: var(--gap-small);
    }
  }
`

export const MyContext = React.createContext<TQgeneratorProps>(
  {} as TQgeneratorProps
)

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
  for (const key of Object.keys(props)) {
    if (
      props[key as keyof TQgeneratorProps] === undefined ||
      props[key as keyof TQgeneratorProps] === null
    ) {
      console.error(`${key} is required`)
      return null
    }
  }

  const { formItems, btnItems, spin: Spin } = props.components
  const { Select } = formItems
  const { BtnPrimary } = btnItems

  const [type, setType] = useState<TypeKeysEnum | null>(
    props.mode === ModeEnum.test
      ? TypeKeysForTest[0]
      : props.mode === ModeEnum.questionnaire
      ? TypeKeysForQuest[0]
      : null
  )
  const addSection = (type: TypeKeysEnum | null) => {
    if (!type) {
      console.error('Add section type is required')
      return
    }

    const id = uuid() as string

    let newItem = _.cloneDeep(initBaseSection)
    newItem.mode = props.mode as ModeEnum
    newItem.id = id as string

    switch (type) {
      case TypeKeysEnum.是非題:
        newItem = {
          ...newItem,
          answer: '',
          response: '',
          ...initTrueFalse(id)
        }
        break
      case TypeKeysEnum.單選題:
        newItem = { ...newItem, answer: '', response: '', ...initSingle(id) }
        break
      case TypeKeysEnum.多選題:
        newItem = {
          ...newItem,
          answer: [],
          response: [],
          ...initMultiple(id)
        }
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
      ...props.sections,
      { ...newItem }
    ] as SectionProps<TypeKeysEnum>[]
    props.setSections?.(newSections)
  }
  const editSection = (
    id: string,
    data: Partial<SectionProps<TypeKeysEnum>>
  ) => {
    if (!id) {
      console.error('🔴 Edit section: id is required')
      return
    }

    const newSections = props.sections.map((section) => {
      if (section.id === id) {
        return { ...section, ...data }
      } else {
        return section
      }
    })
    props.setSections?.(newSections as SectionProps<TypeKeysEnum>[])
  }
  const deleteSection = (id: string) => {
    if (!id) {
      console.error('Delete section id is required')
      return
    }

    const newSections = props.sections.filter((section) => section.id !== id)
    props.setSections?.(newSections)
  }
  const getOptions = () => {
    return props.mode === ModeEnum.test
      ? TypeKeysForTest.map((key) => {
          return {
            key,
            value: key,
            label: key
          }
        })
      : props.mode === ModeEnum.questionnaire
      ? TypeKeysForQuest.map((key) => {
          return {
            key,
            value: key,
            label: key
          }
        })
      : []
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
      const oldIndex = props.sections.findIndex(
        (section) => section.id === active.id
      )
      const newIndex = props.sections.findIndex(
        (section) => section.id === over.id
      )

      const newSections = arrayMove(props.sections, oldIndex, newIndex)
      props.setSections?.(newSections)
    }
  }

  return (
    <MyContext.Provider
      value={{
        mode: props.mode,
        status: props.status,
        role: props.role,
        sections: props.sections,
        setSections: props.setSections,
        renderArticleFooter: props.renderArticleFooter,
        permissions: props.permissions,
        applyRoleMap: props.applyRoleMap,
        components: props.components,
        utility: props.utility
      }}
    >
      <Spin spinning={props.isLoading ?? false}>
        <StyledTQgenerator>
          {props.renderArticleTitle && (
            <div className='section-body-title'>
              {props.renderArticleTitle?.()}
            </div>
          )}
          <DndContext
            sensors={[mouseSensor, pointerSensor]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={props.sections
                .map((section) => section.id)
                .filter((id): id is string => id !== null)}
              strategy={verticalListSortingStrategy}
            >
              {props.sections
                .filter((section) => section.id !== null)
                .map((section, index) => {
                  return (
                    <SortableItem key={section.id} id={section.id!}>
                      <SectionContent
                        section={section}
                        index={index}
                        editSection={editSection}
                        deleteSection={deleteSection}
                        onUploadQuestionImg={props.onUploadQuestionImg}
                      />
                    </SortableItem>
                  )
                })}
            </SortableContext>
          </DndContext>
          <div className='article-footer'>
            {props.status === StatusEnum.設計中 && (
              <>
                <Select
                  options={getOptions()}
                  value={type}
                  onChange={(value: TypeKeysEnum) => setType(value)}
                />
                <BtnPrimary onClick={() => addSection(type)}>新增</BtnPrimary>
              </>
            )}
            {props.renderArticleFooter && props.renderArticleFooter?.()}
            <div className='version'>v{packageJson.version}</div>
          </div>
        </StyledTQgenerator>
      </Spin>
    </MyContext.Provider>
  )
}
export default TQgenerator
