import React, { useContext } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  SectionProps,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum,
  PermissionEnum
} from './types'
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
  const { InputNumber, Radio } = formItems
  const { BtnGroup, BtnText } = btnItems
  const { component: Editor, onUploadImage } = editor

  const renderSectionTitleScore = () => {
    if (context.mode !== ModeEnum.test) return null

    if (context.status === StatusEnum.設計中) {
      return (
        <>
          得分 :
          <InputNumber
            style={{ width: '100px', marginLeft: '1rem' }}
            value={section.score}
            precision={1}
            min={0}
            step={0.1}
            onChange={(value: any) =>
              editSection(section.id!, { score: Number(value) || 0 })
            }
          />
        </>
      )
    } else if (context.status === StatusEnum.唯讀 && section.score !== null) {
      // TOCHECK 要確認可以看到得分呈現的判斷條件
      return <span>得分 :{section.score}</span>
    } else return null
  }
  const renderSectionQuestion = () => {
    if (context.status === StatusEnum.設計中) {
      return (
        <div className='section-body-question active'>
          <div className='section-body-question-editor'>
            <Editor
              id={section.id}
              value={section.question}
              onChange={(content: string) => {
                editSection(section.id!, { question: content })
              }}
              onUploadImage={onUploadImage}
            />
          </div>
        </div>
      )
    } else {
      return (
        <div
          className={`section-body-question ${!section.question && 'empty'}`}
          dangerouslySetInnerHTML={{
            __html: section.question.replace(/\n/g, '<br />')
          }}
        />
      )
    }
  }

  return (
    <div
      className={`section ${context.role === section.role ? 'responding' : ''}`}
      tabIndex={0}
    >
      <div className='section-title'>
        {context.status === StatusEnum.設計中 && (
          <div className='section-title-drag' {...dragHandleProps}>
            <IconDrag />
          </div>
        )}
        {context.mode === ModeEnum.test &&
          section.isPass !== null &&
          context.permissions.includes(PermissionEnum.查看結果) && (
            <span>
              <em
                className={`section-title-status ${
                  section.isPass ? 'passed' : 'failed'
                }`}
              >
                {section.isPass ? '答對' : '答錯'}
              </em>
            </span>
          )}
        <span>題目 {index + 1}</span>
        <span>{section.type}</span>
        {renderSectionTitleScore()}
        <div className='section-title-actions clearfix'>
          {context.mode === ModeEnum.questionnaire &&
            context.status === StatusEnum.設計中 &&
            Array.isArray(context.replyRoleMap) && (
              <BtnGroup style={{ float: 'right' }}>
                {context.replyRoleMap.map((role) => (
                  <Radio
                    key={role.key}
                    checked={section.role === role.key}
                    onChange={() =>
                      editSection(section.id!, { role: role.key })
                    }
                  >
                    {role.value}
                  </Radio>
                ))}
              </BtnGroup>
            )}
          {context.status === StatusEnum.設計中 && (
            <BtnText
              key='delete'
              theme='danger'
              onClick={() => deleteSection(section.id!)}
            >
              <IconDeleteOutline />
            </BtnText>
          )}
        </div>
      </div>
      <div className='section-body'>
        {renderSectionQuestion()}
        <div className='section-body-question-option'>
          {section.type === TypeKeysEnum.是非題 && (
            <TrueFalseComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id!, data)
              }
            />
          )}
          {section.type === TypeKeysEnum.單選題 && (
            <SingleComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id!, data)
              }
            />
          )}
          {section.type === TypeKeysEnum.多選題 && (
            <MultipleComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id!, data)
              }
            />
          )}
          {section.type === TypeKeysEnum.填充題 && (
            <FieldComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id!, data)
              }
            />
          )}
          {section.type === TypeKeysEnum.問答題 && (
            <EssayComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id!, data)
              }
            />
          )}
          {section.type === TypeKeysEnum.評分題 && (
            <RatingComponent
              {...section}
              updateSection={(data: SectionProps<TypeKeysEnum>) =>
                editSection(section.id!, data)
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
