import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'
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

interface SectionContentProps {
  section: SectionProps<TypeKeysType>
  index: number
  editSection: (id: string, data: Partial<SectionProps<TypeKeysType>>) => void
  deleteSection: (id: string) => void
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
  deleteSection,
  dragHandleProps
}) => {
  const context = useContext(MyContext)
  const { utility, components } = context
  const { icons } = utility
  const { IconDrag, IconDeleteOutline } = icons
  const { formItems, btnItems, editor } = components
  const { InputNumber } = formItems
  const { BtnGroup, BtnText } = btnItems
  const { component: Editor, onUploadImage } = editor

  const sectionRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<number | null>(null)

  const handleFocus = () => {
    // 清除任何待執行的失焦處理
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }

    if (!section.isEdit) {
      // 聚焦時自動進入編輯模式，同時讓其他 section 離開編輯模式
      editSection(section.id, { isEdit: true })
    }
  }

  const handleBlur = (event: React.FocusEvent) => {
    // 檢查新的焦點目標是否仍在此 section 內
    const relatedTarget = event.relatedTarget as Node
    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return // 焦點仍在 section 內，不做任何處理
    }

    // 延遲檢查，給 Editor 組件和其他元素時間完成焦點設置
    blurTimeoutRef.current = setTimeout(() => {
      // 檢查當前 document.activeElement 是否在此 section 內
      const activeElement = document.activeElement
      if (activeElement && sectionRef.current?.contains(activeElement)) {
        return // 焦點實際上仍在 section 內
      }

      // 確認 section 仍處於編輯狀態才執行失焦邏輯
      if (section.isEdit) {
        editSection(section.id, { isEdit: false })
      }
      blurTimeoutRef.current = null
    }, 50) // 增加延遲時間，給 Editor 更多時間初始化
  }

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className={`section ${section.isEdit ? 'editing' : ''}`}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className='section-title'>
        <div className='section-title-drag' {...dragHandleProps}>
          <IconDrag />
        </div>
        <span>題目 {index + 1}</span>
        <span style={{ color: 'var(--color-disabled-icon)' }}>
          [ {section.type} ]
        </span>
        {context.status === 'editing' && context.mode === 'test' && (
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
        {context.status === 'editing' && (
          <BtnGroup className='clearfix' style={{ float: 'right' }}>
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
        {context.status === 'editing' && section.isEdit ? (
          <div className='section-body-question active'>
            <Editor
              title=''
              height={200}
              value={section.question}
              onSave={(
                content: string
                // setIsLoading: (value: boolean) => void,
                // contentH: number | null
              ) => {
                editSection(section.id, { question: content })
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
  const {
    mode,
    role,
    status,
    setStatus,
    sections,
    setSections,
    totalScore,
    setTotalScore,
    components,
    utility
  } = props

  if (!mode || !role || !status) {
    return null
  }

  const { formItems, btnItems } = components
  const { Select } = formItems
  const { BtnPrimary } = btnItems
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
  const editSection = (
    id: string,
    data: Partial<SectionProps<TypeKeysType>>
  ) => {
    const newSections = sections.map((section) => {
      if (section.id === id) {
        return { ...section, ...data }
      } else if (data.isEdit === true) {
        // 如果要設定某個 section 為編輯模式，確保其他 section 都離開編輯模式
        return { ...section, isEdit: false }
      } else {
        return section
      }
    })
    setSections?.(newSections as SectionProps<TypeKeysType>[])
  }
  const deleteSection = (id: string) => {
    const newSections = sections.filter((section) => section.id !== id)
    setSections?.(newSections)
  }
  const onSubmitTest = useCallback(() => {
    let totalScore = 0
    sections.forEach((section) => {
      if (section.type === '是非題') {
        const correctOption = section.options.find(
          (option) => option.isCorrect && option.isChecked
        )
        if (correctOption) {
          totalScore += section.score || 0
        }
      } else if (section.type === '單選題') {
        const correctOption = section.options.find(
          (option) => option.isCorrect && option.isChecked
        )
        if (correctOption) {
          totalScore += section.score || 0
        }
      } else if (section.type === '多選題') {
        const correctedItems = section.options.filter(
          (option) => option.isCorrect
        )
        const correctedItemsKeys = correctedItems.map((option) => option.key)
        const checkedItems = section.options.filter(
          (option) => option.isChecked
        )
        const checkedItemsKeys = checkedItems.map((option) => option.key)
        const intersectionKeys = correctedItemsKeys.filter((key) =>
          checkedItemsKeys.includes(key)
        )
        if (intersectionKeys.length === correctedItemsKeys.length) {
          totalScore += section.score || 0
        }
      } else if (section.type === '填充題') {
        // TOCHECK 無法自動閱卷
      } else if (section.type === '問答題') {
        // TOCHECK 無法自動閱卷
      }

      return section
    })
    setStatus?.('waiting_for_correct')
    setTotalScore?.(totalScore)
  }, [sections])
  const onSubmitQuestionnaire = useCallback(() => {
    // TODO
    console.log('submit', sections)
  }, [sections])

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
                    deleteSection={deleteSection}
                  />
                </SortableItem>
              )
            })}
          </SortableContext>
        </DndContext>
        {role === 'editor' && status === 'editing' && (
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
        )}
        {status === 'waiting_for_response' && (
          <div className='section-body-add'>
            <BtnPrimary
              onClick={() =>
                mode === 'test'
                  ? onSubmitTest()
                  : mode === 'questionnaire'
                  ? onSubmitQuestionnaire()
                  : console.error('Invalid Mode')
              }
            >
              提交測驗
            </BtnPrimary>
          </div>
        )}
        {status === 'waiting_for_correct' && (
          <div style={{ textAlign: 'center' }}>總得分：{totalScore}</div>
        )}

        <div className='version'>v{packageJson.version}</div>
      </StyledTQgenerator>
    </MyContext.Provider>
  )
}
export default TQgenerator
