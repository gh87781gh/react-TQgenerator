import React, { useContext } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  SectionProps,
  TypeKeysEnum,
  ModeEnum,
  StatusEnum,
  RoleEnum
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
  deleteSection
  // dragHandleProps
}) => {
  const context = useContext(MyContext)
  const { utility, components } = context
  const { icons } = utility
  const {
    //  IconDrag,
    IconDeleteOutline
  } = icons
  const {
    formItems,
    btnItems
    // editor
  } = components
  // const { component: Editor } = editor
  const { InputNumber, Radio, Textarea } = formItems
  const { BtnGroup, BtnText } = btnItems
  // const { component: Editor, onUploadImage } = editor

  return (
    <div
      className={`section ${context.role === section.role ? 'responding' : ''}`}
      tabIndex={0}
    >
      <div className='section-title'>
        {/* <div className='section-title-drag' {...dragHandleProps}>
          <IconDrag />
        </div> */}
        {context.mode === ModeEnum.test &&
          (context.status === StatusEnum.waiting_for_correct ||
            context.status === StatusEnum.finished) &&
          section.isPass !== null && (
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
        {context.mode === ModeEnum.test &&
          context.status === StatusEnum.editing && (
            <>
              得分 :
              <InputNumber
                style={{ width: '100px', marginLeft: '1rem' }}
                value={section.score}
                precision={1}
                min={0}
                step={0.1}
                onChange={(value: any) =>
                  editSection(section.id || '', { score: Number(value) || 0 })
                }
              />
            </>
          )}
        {context.mode === ModeEnum.test &&
          (context.status === StatusEnum.waiting_for_correct ||
            context.status === StatusEnum.finished) && (
            <span>得分 :{section.score !== null ? section.score : ''}</span>
          )}
        {context.status === StatusEnum.editing && (
          <BtnGroup className='clearfix' style={{ float: 'right' }}>
            <Radio
              key='actor'
              checked={section.role === RoleEnum.actor}
              onChange={() =>
                editSection(section.id || '', { role: RoleEnum.actor })
              }
            >
              填寫者
            </Radio>
            <Radio
              key='reviewer'
              checked={section.role === RoleEnum.reviewer}
              onChange={() =>
                editSection(section.id || '', { role: RoleEnum.reviewer })
              }
            >
              評核者
            </Radio>
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
        {context.status === StatusEnum.editing ? (
          <div className='section-body-question active'>
            <Textarea
              value={section.question}
              onChange={(e: any) =>
                editSection(section.id || '', { question: e.target.value })
              }
            />

            {/* TODO */}
            {/* <Editor /> */}
            {/* <Editor
              id={section.id}
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
            /> */}
          </div>
        ) : (
          <div
            className={`section-body-question ${!section.question && 'empty'}`}
            dangerouslySetInnerHTML={{
              __html: section.question.replace(/\n/g, '<br />')
            }}
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
