import React, { useContext, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SectionProps, TypeKeysEnum, ModeEnum, StatusEnum } from './types'
import { MyContext } from './TQgenerator'
import { TrueFalseComponent } from './lib/true-false'
import { SingleComponent } from './lib/single'
import { MultipleComponent } from './lib/multiple'
import { FieldComponent } from './lib/field'
import { EssayComponent } from './lib/essay'
import { RatingComponent } from './lib/rating'

type SortableItemProps = {
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

type SectionContentProps = {
  section: SectionProps<TypeKeysEnum>
  index: number
  editSection: (id: string, data: Partial<SectionProps<TypeKeysEnum>>) => void
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
      editSection(section.id || '', { isEdit: true })
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
        editSection(section.id || '', { isEdit: false })
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
        {context.status === StatusEnum.editing &&
          context.mode === ModeEnum.test && (
            <>
              <span style={{ marginRight: '0.5rem' }}>得分</span>
              <InputNumber
                style={{ width: '100px', marginRight: '1rem' }}
                value={section.score}
                precision={0}
                min={0}
                onChange={(value: any) =>
                  editSection(section.id || '', { score: Number(value) || 0 })
                }
              />
            </>
          )}
        {context.status === StatusEnum.editing && (
          <BtnGroup className='clearfix' style={{ float: 'right' }}>
            <BtnText
              key='delete'
              theme='danger'
              onClick={() => deleteSection(section.id || '')}
            >
              <IconDeleteOutline />
            </BtnText>
          </BtnGroup>
        )}
      </div>
      <div className='section-body'>
        {context.status === StatusEnum.editing && section.isEdit ? (
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
                editSection(section.id || '', { question: content })
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
          {section.type === TypeKeysEnum.是非題 && (
            <TrueFalseComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id || '', data)
              }
            />
          )}
          {section.type === TypeKeysEnum.單選題 && (
            <SingleComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id || '', data)
              }
            />
          )}
          {section.type === TypeKeysEnum.多選題 && (
            <MultipleComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id || '', data)
              }
            />
          )}
          {section.type === TypeKeysEnum.填充題 && (
            <FieldComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id || '', data)
              }
            />
          )}
          {section.type === TypeKeysEnum.問答題 && (
            <EssayComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id || '', data)
              }
            />
          )}
          {section.type === TypeKeysEnum.評分題 && (
            <RatingComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id || '', data)
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export {
  type SortableItemProps,
  type SectionContentProps,
  SectionContent,
  SortableItem
}
