import React, { useState } from 'react'
import styled from 'styled-components'
import './variables.css'
import packageJson from '../package.json'

import {
  initBaseSection,
  SectionProps,
  TypeKeysType,
  TQgeneratorProps
} from './types'
import { useTrueFalse } from './lib/true-false'
import { useSingle } from './lib/single'
import { useMultiple } from './lib/multiple'
import { useField } from './lib/field'
import { useEssay } from './lib/essay'
import { useRating } from './lib/rating'

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
      cursor: move;
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

const TQgenerator: React.FC<TQgeneratorProps> = (props) => {
  const { mode, role, status, sections, setSections, components, utility } =
    props
  const { icons } = utility
  const { IconDrag, IconDeleteOutline } = icons
  const { formItems, btnItems, editor: Editor } = components
  const { InputNumber, Select } = formItems
  const { BtnPrimary, BtnGroup, BtnOutline, BtnText } = btnItems

  const { TrueFalseComponent, initTrueFalseData } = useTrueFalse()
  const { SingleComponent, initSingleData } = useSingle()
  const { MultipleComponent, initMultipleData } = useMultiple()
  const { FieldComponent, initFieldData } = useField()
  const { EssayComponent, initEssayData } = useEssay()
  const { RatingComponent, initRatingData } = useRating()

  const [type, setType] = useState<TypeKeysType>(
    mode === 'test' ? '是非題' : '單選題'
  )
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
        newItem = { ...newItem, ...initTrueFalseData(id) }
        break
      case '單選題':
        newItem = { ...newItem, ...initSingleData(id) }
        break
      case '多選題':
        newItem = { ...newItem, ...initMultipleData(id) }
        break
      case '填充題':
        newItem = { ...newItem, ...initFieldData() }
        break
      case '問答題':
        newItem = { ...newItem, ...initEssayData() }
        break
      case '評分題':
        newItem = { ...newItem, ...initRatingData() }
        break
      default:
        newItem = { ...newItem, ...initTrueFalseData(id) }
    }
    const newSections = [
      ...currentSections,
      { ...newItem }
    ] as SectionProps<TypeKeysType>[]
    setSections(newSections)
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
    setSections(newSections)
  }
  const editSection = (
    id: string,
    data: Partial<SectionProps<TypeKeysType>>
  ) => {
    const newSections = sections.map((section) =>
      section.id === id ? { ...section, ...data } : section
    )
    setSections(newSections as SectionProps<TypeKeysType>[])
  }
  const deleteSection = (id: string) => {
    const newSections = sections.filter((section) => section.id !== id)
    setSections(newSections)
  }
  const saveSection = (id: string, content: string) => {
    const newSections = sections.map((section) =>
      section.id === id
        ? { ...section, question: content, isEdit: false }
        : section
    )
    setSections(newSections)
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
        {sections.map((section, index) => {
          return (
            <div className='section' key={section.id}>
              <div className='section-title'>
                <div className='section-title-drag'>
                  <IconDrag />
                </div>
                <span>題目 {index + 1}</span>
                <span style={{ color: 'var(--color-disabled-icon)' }}>
                  [ {section.type} ]
                </span>
                <span>
                  {props.mode === 'test' && (
                    <InputNumber
                      style={{ width: '100px' }}
                      value={section.score}
                      precision={0}
                      min={0}
                      onChange={(value: any) =>
                        editSection(section.id, { score: Number(value) || 0 })
                      }
                    />
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
                      onSave={(
                        content: string
                        // setIsLoading: (value: boolean) => void,
                        // contentH: number | null
                      ) => {
                        saveSection(section.id, content)
                      }}
                      onUploadImage={() => console.log('onUploadImage')}
                    />
                  </div>
                ) : (
                  <div
                    className={`section-body-question ${
                      !section.question && 'empty'
                    }`}
                    dangerouslySetInnerHTML={{ __html: section.question }}
                  />
                )}
                <div className='section-body-question-option'>
                  {/* TODO */}
                  {section.type === '是非題' && (
                    <TrueFalseComponent
                      section={section}
                      updateSection={(data: SectionProps<TypeKeysType>) =>
                        editSection(section.id, data)
                      }
                    />
                  )}
                  {section.type === '單選題' && (
                    <SingleComponent
                      section={section}
                      updateSection={(data: SectionProps<TypeKeysType>) =>
                        editSection(section.id, data)
                      }
                    />
                  )}
                  {section.type === '多選題' && (
                    <MultipleComponent
                      section={section}
                      updateSection={(data: SectionProps<TypeKeysType>) =>
                        editSection(section.id, data)
                      }
                    />
                  )}
                  {section.type === '填充題' && (
                    <FieldComponent
                      section={section}
                      updateSection={(data: SectionProps<TypeKeysType>) =>
                        editSection(section.id, data)
                      }
                    />
                  )}
                  {section.type === '問答題' && (
                    <EssayComponent
                      section={section}
                      updateSection={(data: SectionProps<TypeKeysType>) =>
                        editSection(section.id, data)
                      }
                    />
                  )}
                  {section.type === '評分題' && (
                    <RatingComponent
                      section={section}
                      updateSection={(data: SectionProps<TypeKeysType>) =>
                        editSection(section.id, data)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
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
