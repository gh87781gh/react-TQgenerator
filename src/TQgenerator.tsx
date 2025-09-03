import React, { useState } from 'react'
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
  SortableContext,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  initBaseSection,
  SectionProps,
  TypeKeysType,
  TQgeneratorProps
} from './types'
import { initTrueFalse, TrueFalseComponent } from './lib/true-false'
import { initSingle, SingleComponent } from './lib/single'
import { initMultiple, MultipleComponent } from './lib/multiple'
import { initField, FieldComponent } from './lib/field'
import { initEssay, EssayComponent } from './lib/essay'
import { initRating, RatingComponent } from './lib/rating'

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

    &:not(:last-child) {
      margin-bottom: calc(var(--gap-normal) * 2);
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

export type MyContextType = Omit<TQgeneratorProps, 'setRole' | 'setStatus'>
export const MyContext = React.createContext<MyContextType>({} as MyContextType)

// SortableItem 組件用於包裝每個可拖拉的 section
interface SortableItemProps {
  id: string
  children: React.ReactElement<{
    dragHandleProps?: {
      onPointerDown?: (event: React.PointerEvent) => void
      onMouseDown?: (event: React.MouseEvent) => void
      onTouchStart?: (event: React.TouchEvent) => void
      onKeyDown?: (event: React.KeyboardEvent) => void
    }
  }>
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '1rem'
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement, {
        dragHandleProps: listeners
      })}
    </div>
  )
}

// SectionContent 組件
interface SectionContentProps {
  section: SectionProps<TypeKeysType>
  index: number
  editSection: (id: string, data: Partial<SectionProps<TypeKeysType>>) => void
  switchSectionStatus: (id: string) => void
  deleteSection: (id: string) => void
  saveSection: (id: string, content: string) => void
  onUploadImage: (image: string) => void
  IconDrag: React.ComponentType<any>
  IconDeleteOutline: React.ComponentType<any>
  InputNumber: React.ComponentType<any>
  BtnGroup: React.ComponentType<any>
  BtnOutline: React.ComponentType<any>
  BtnText: React.ComponentType<any>
  Editor: React.ComponentType<any>
  props: TQgeneratorProps
  dragHandleProps?: {
    onPointerDown?: (event: React.PointerEvent) => void
    onMouseDown?: (event: React.MouseEvent) => void
    onTouchStart?: (event: React.TouchEvent) => void
    onKeyDown?: (event: React.KeyboardEvent) => void
  }
}

const SectionContent: React.FC<SectionContentProps> = ({
  section,
  index,
  editSection,
  switchSectionStatus,
  deleteSection,
  saveSection,
  onUploadImage,
  IconDrag,
  IconDeleteOutline,
  InputNumber,
  BtnGroup,
  BtnOutline,
  BtnText,
  Editor,
  props,
  dragHandleProps
}) => {
  return (
    <div className='section'>
      <div className='section-title'>
        <div className='section-title-drag' {...dragHandleProps}>
          <IconDrag />
        </div>
        <span>題目 {index + 1}</span>
        <span style={{ color: 'var(--color-disabled-icon)' }}>
          [ {section.type} ]
        </span>
        <span>
          {props.mode === 'test' && (
            <>
              <span style={{ marginRight: '0.5rem' }}>得分</span>
              <InputNumber
                style={{ width: '100px', marginRight: '1rem' }}
                value={section.score}
                precision={0}
                min={0}
                onChange={(value: any) =>
                  editSection(section.id, { score: Number(value) || 0 })
                }
              />
            </>
          )}
        </span>
        {!section.isEdit && (
          <BtnGroup className='clearfix' style={{ float: 'right' }}>
            <BtnOutline
              key='edit'
              size='small'
              onClick={() => switchSectionStatus(section.id)}
            >
              編輯
            </BtnOutline>
            <BtnText
              key='delete'
              theme='danger'
              onClick={() => deleteSection(section.id)}
            >
              <IconDeleteOutline />
            </BtnText>
          </BtnGroup>
        )}
      </div>
      <div className='section-body'>
        {section.isEdit ? (
          <div className='section-body-question active'>
            <Editor
              title=''
              height={200}
              value={section.question}
              onSave={(content: string) => {
                saveSection(section.id, content)
              }}
              onUploadImage={onUploadImage}
            />
          </div>
        ) : (
          <div
            className={`section-body-question ${!section.question && 'empty'}`}
            dangerouslySetInnerHTML={{ __html: section.question }}
          />
        )}
        <div className='section-body-question-option'>
          {section.type === '是非題' && (
            <TrueFalseComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysType>) =>
                editSection(section.id, data)
              }
            />
          )}
          {section.type === '單選題' && (
            <SingleComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysType>) =>
                editSection(section.id, data)
              }
            />
          )}
          {section.type === '多選題' && (
            <MultipleComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysType>) =>
                editSection(section.id, data)
              }
            />
          )}
          {section.type === '填充題' && (
            <FieldComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysType>) =>
                editSection(section.id, data)
              }
            />
          )}
          {section.type === '問答題' && (
            <EssayComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysType>) =>
                editSection(section.id, data)
              }
            />
          )}
          {section.type === '評分題' && (
            <RatingComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysType>) =>
                editSection(section.id, data)
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

const TQgenerator: React.FC<TQgeneratorProps> = (props) => {
  const { mode, role, status, sections, setSections, components, utility } =
    props

  if (!mode || !role || !status) {
    return null
  }

  const { icons } = utility
  const { IconDrag, IconDeleteOutline } = icons
  const { formItems, btnItems, editor } = components
  const { InputNumber, Select } = formItems
  const { BtnPrimary, BtnGroup, BtnOutline, BtnText } = btnItems
  const { component: Editor, onUploadImage } = editor

  const [type, setType] = useState<TypeKeysType>('是非題')
  const addSection = (type: TypeKeysType) => {
    const currentSections = sections.map((section) => {
      section.isEdit = false
      return section
    })
    const id = String(sections.length + 1)
    let newItem: Partial<SectionProps<TypeKeysType>> = {
      mode,
      id,
      ...initBaseSection
    }
    switch (type) {
      case '是非題':
        newItem = { ...newItem, ...initTrueFalse(id) }
        break
      case '單選題':
        newItem = { ...newItem, ...initSingle(id) }
        break
      case '多選題':
        newItem = { ...newItem, ...initMultiple(id) }
        break
      case '填充題':
        newItem = { ...newItem, ...initField }
        break
      case '問答題':
        newItem = { ...newItem, ...initEssay }
        break
      case '評分題':
        newItem = { ...newItem, ...initRating }
        break
      default:
        console.error('Invalid Section Type')
    }
    const newSections = [
      ...currentSections,
      { ...newItem }
    ] as SectionProps<TypeKeysType>[]
    setSections?.(newSections)
  }
  const switchSectionStatus = (id: string) => {
    const currentStatus = sections.find((section) => section.id === id)?.isEdit
    let newSections: SectionProps<TypeKeysType>[]
    if (currentStatus) {
      newSections = sections.map((section) =>
        section.id === id ? { ...section, isEdit: false } : section
      )
    } else {
      newSections = sections.map((section) =>
        section.id === id
          ? { ...section, isEdit: true }
          : { ...section, isEdit: false }
      )
    }
    setSections?.(newSections)
  }
  const editSection = (
    id: string,
    data: Partial<SectionProps<TypeKeysType>>
  ) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, ...data } : section
    )
    setSections?.(newSections as SectionProps<TypeKeysType>[])
  }
  const deleteSection = (id: string) => {
    const newSections = sections.filter((section) => section.id !== id)
    setSections?.(newSections)
  }
  const saveSection = (id: string, content: string) => {
    const newSections = sections.map((section) =>
      section.id === id
        ? { ...section, question: content, isEdit: false }
        : section
    )
    setSections?.(newSections)
  }

  // Drag and Drop 相關設定
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

  const getOptions = () => {
    const TypeKeysForTest = ['是非題', '單選題', '多選題', '填充題', '問答題']
    const TypeKeysForQuest = ['單選題', '多選題', '填充題', '問答題', '評分題']
    return mode === 'test'
      ? TypeKeysForTest.map((key) => {
          return {
            key,
            value: key,
            label: key
          }
        })
      : mode === 'questionnaire'
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
        role,
        status,
        sections,
        setSections,
        components,
        utility
      }}
    >
      <StyledTQgenerator>
        <DndContext
          sensors={[mouseSensor, pointerSensor]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section, index) => {
              return (
                <SortableItem key={section.id} id={section.id}>
                  <SectionContent
                    section={section}
                    index={index}
                    editSection={editSection}
                    switchSectionStatus={switchSectionStatus}
                    deleteSection={deleteSection}
                    saveSection={saveSection}
                    onUploadImage={onUploadImage}
                    IconDrag={IconDrag}
                    IconDeleteOutline={IconDeleteOutline}
                    InputNumber={InputNumber}
                    BtnGroup={BtnGroup}
                    BtnOutline={BtnOutline}
                    BtnText={BtnText}
                    Editor={Editor}
                    props={props}
                  />
                </SortableItem>
              )
            })}
          </SortableContext>
        </DndContext>
        <div className='section-body-add'>
          <Select
            allowClear={false}
            options={getOptions()}
            value={type}
            onChange={(value: any) => {
              setType(value as TypeKeysType)
            }}
          />
          <BtnPrimary onClick={() => addSection(type)}>新增</BtnPrimary>
        </div>
        <div className='version'>v{packageJson.version}</div>
      </StyledTQgenerator>
    </MyContext.Provider>
  )
}
export default TQgenerator
