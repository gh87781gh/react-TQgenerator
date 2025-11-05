import React, { useState, useCallback, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import './variables.css'
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
import { autoCorrectQuestionnaire, autoCorrectTest } from './autoCorrect'
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
    assets,
    actions,
    mode,
    status,
    role,
    actorID,
    reviewerID,
    setSections,
    result,
    components,
    utility
  } = props

  if (!mode || !status) {
    console.error('mode or status is not set')
    return null
  }

  const { formItems, btnItems, modal: Modal } = components
  const { Select, SearchSelect, Textarea } = formItems
  const { BtnPrimary, BtnOutline, BtnGroup } = btnItems

  const [type, setType] = useState<TypeKeysEnum>(
    mode === ModeEnum.test
      ? TypeKeysForTest[0]
      : mode === ModeEnum.questionnaire
      ? TypeKeysForQuest[0]
      : TypeKeysEnum.是非題 // TODO 應該要是null
  )
  const addSection = (type: TypeKeysEnum) => {
    const id = uuid() as string

    let newItem = _.cloneDeep(initBaseSection)
    newItem.mode = mode as ModeEnum
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
    setSections?.(newSections)
  }
  const editSection = (
    id: string | null,
    data: Partial<SectionProps<TypeKeysEnum>>
  ) => {
    if (!id) return

    const newSections = props.sections.map((section) => {
      if (section.id === id) {
        return { ...section, ...data }
      } else {
        return section
      }
    })
    setSections?.(newSections as SectionProps<TypeKeysEnum>[])
  }
  const deleteSection = (id: string | null) => {
    if (!id) return

    const newSections = props.sections.filter((section) => section.id !== id)
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
      const oldIndex = props.sections.findIndex(
        (section) => section.id === active.id
      )
      const newIndex = props.sections.findIndex(
        (section) => section.id === over.id
      )
      const newSections = arrayMove(props.sections, oldIndex, newIndex)
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
          <BtnPrimary
            onClick={() => {
              // if (isShowJsonEditor) {
              //   const ok = saveJsonEditor()
              //   if (!ok) return
              // }
              actions?.onSubmitEditing?.()
            }}
          >
            儲存
          </BtnPrimary>
        </BtnGroup>
      )
    )
  }, [actions, status])
  const renderActionEditing = useCallback(() => {
    return (
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
  }, [type, status, addSection])
  const [isShowSelectReviewer, setIsShowSelectReviewer] = useState(false)
  const [selectedReviewerID, setSelectedReviewerID] = useState<string | null>(
    assets?.classTeacherID ?? null
  )
  const renderActionResponse = useCallback(() => {
    return (
      <div className='section-body-add'>
        <BtnPrimary
          onClick={() => {
            if (config?.isAllowSelectReviewer) {
              setIsShowSelectReviewer(true)
            } else {
              if (mode === ModeEnum.test) {
                const score = autoCorrectTest(props.sections)
                actions?.onSubmitResponse?.(score, null)
              } else if (mode === ModeEnum.questionnaire) {
                const score = autoCorrectQuestionnaire(props.sections)
                actions?.onSubmitResponse?.(score, null)
              }
            }
          }}
        >
          {config?.isAllowSelectReviewer ? '選擇評核者' : '提交'}
        </BtnPrimary>
      </div>
    )
  }, [props.sections, actions])
  const renderActionCorrect = useCallback(() => {
    let finalTotalScore = 0
    if (mode === ModeEnum.test) {
      finalTotalScore = autoCorrectTest(props.sections)
    } else if (mode === ModeEnum.questionnaire) {
      finalTotalScore = autoCorrectQuestionnaire(props.sections)
    }
    return (
      <>
        {config?.isAllowReSelectReviewer && (
          <div className='section-body-add'>
            <BtnPrimary onClick={() => setIsShowSelectReviewer(true)}>
              重新指派評核者
            </BtnPrimary>
          </div>
        )}
        {config?.isShowCurrentFinalTotalScore && (
          <div style={{ marginRight: '0.5rem' }}>
            總得分：
            {
              finalTotalScore // 即時分數
              // result?.score // 非即時分數
            }
          </div>
        )}
        {config?.isShowCorrectActionPass ? (
          <BtnGroup>
            <BtnOutline
              onClick={() =>
                actions?.onSubmitCorrect?.(
                  finalTotalScore,
                  assets?.ReviewResultMap?.評核為不通過 ?? null
                )
              }
            >
              {!config?.isReCorrecting ? '不通過' : '更新為不通過'}
            </BtnOutline>
            <BtnPrimary
              onClick={() =>
                actions?.onSubmitCorrect?.(
                  finalTotalScore,
                  assets?.ReviewResultMap?.評核為通過 ?? null
                )
              }
            >
              {!config?.isReCorrecting ? '通過' : '更新為通過'}
            </BtnPrimary>
          </BtnGroup>
        ) : null}
        {config?.isShowCorrectActionSubmit ? (
          <BtnPrimary
            onClick={() => {
              actions?.onSubmitCorrect?.(finalTotalScore, null)
            }}
          >
            {!config?.isReCorrecting
              ? `送出${
                  mode === ModeEnum.test
                    ? '批改'
                    : mode === ModeEnum.questionnaire
                    ? '評核'
                    : ''
                }`
              : `更新${
                  mode === ModeEnum.test
                    ? '批改'
                    : mode === ModeEnum.questionnaire
                    ? '評核'
                    : ''
                }`}
          </BtnPrimary>
        ) : null}
      </>
    )
  }, [mode, config, props.sections, actions, assets])
  const renderAction = {
    [StatusEnum.editing]: renderActionEditing,
    [StatusEnum.preview_editing]: () => null,
    [StatusEnum.waiting_for_response]: renderActionResponse,
    [StatusEnum.waiting_for_correct]: renderActionCorrect,
    [StatusEnum.finished]: () => null
  }

  useEffect(() => {
    if (actions?.isAutoSubmitResponse) {
      if (config?.isAllowSelectReviewer) {
        setIsShowSelectReviewer(true)
      } else {
        if (mode === ModeEnum.test) {
          const score = autoCorrectTest(props.sections)
          actions?.onSubmitResponse?.(score, null)
        } else if (mode === ModeEnum.questionnaire) {
          const score = autoCorrectQuestionnaire(props.sections)
          actions?.onSubmitResponse?.(score, null)
        }
      }
    }
  }, [actions?.isAutoSubmitResponse])

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

  const isShowSections = useMemo(() => {
    if (status === StatusEnum.waiting_for_correct) {
      return config?.isShowCorrectContent
    }

    if (status === StatusEnum.finished) {
      return config?.isShowCorrectContentResult
    }

    return true
  }, [config, status])

  const [isShowJsonEditor, setIsShowJsonEditor] = useState(false)
  const [jsonEditorValue, setJsonEditorValue] = useState<string>('')
  const [jsonEditorError, setJsonEditorError] = useState<string>('')
  // keep track of previous isShowJsonEditor so we only populate editor when opening
  // const prevIsShowJsonEditor = useRef<boolean>(isShowJsonEditor)

  useEffect(() => {
    console.log(
      '🔵 jsonEditorValue',
      jsonEditorValue,
      'jsonEditorError',
      jsonEditorError
    )
  }, [jsonEditorValue])

  // Simple immediate parser used while editing JSON.
  const tryParseAndSet = useCallback(
    (val: string) => {
      console.log('🔴 tryParseAndSet')
      console.log('val', val)
      setJsonEditorValue(val)
      if (!val || !val.trim()) {
        setJsonEditorError('內容為空，請輸入 JSON')
        return
      }
      try {
        const parsed = JSON.parse(val)
        if (!Array.isArray(parsed)) {
          setJsonEditorError('JSON 必須為陣列，格式不正確')
          return
        }
        const invalidIndex = parsed.findIndex(
          (s: any) => !s || typeof s.id !== 'string' || s.id.trim() === ''
        )
        if (invalidIndex !== -1) {
          setJsonEditorError(`第 ${invalidIndex + 1} 個 section 缺少有效的 id`)
          return
        }

        console.log('parsed', parsed)

        // parsed is valid JSON array -> immediately update sections
        // setSections?.(parsed as SectionProps<TypeKeysEnum>[]) //TODO
        setJsonEditorError('')
      } catch (e) {
        // show parse error but don't overwrite sections
        setJsonEditorError('JSON 格式錯誤，請檢查內容')
      }
    },
    [setSections, setJsonEditorError]
  )

  const saveJsonEditor = useCallback(() => {
    const stringStableLatestSections = JSON.stringify(props.sections, null, 2)
    if (!stringStableLatestSections.trim()) {
      setJsonEditorError('內容為空，請輸入 JSON')
      return false
    }
    try {
      const parsed = JSON.parse(stringStableLatestSections)

      if (!Array.isArray(parsed)) {
        setJsonEditorError('JSON 必須為陣列，格式不正確')
        return false
      }

      const invalidIndex = parsed.findIndex(
        (s: any) => !s || typeof s.id !== 'string' || s.id.trim() === ''
      )
      if (invalidIndex !== -1) {
        setJsonEditorError(`第 ${invalidIndex + 1} 個 section 缺少有效的 id`)
        return false
      }

      // Merge parsed sections with the latestSectionsRef to avoid losing
      // recently-edited fields (e.g. question text) that might not have
      // propagated into props.sections yet. Keep orig.question when parsed
      // has empty/undefined question.
      const merged = (parsed as SectionProps<TypeKeysEnum>[]).map((p) => {
        const orig = props.sections.find((s) => s.id === p.id)
        if (!orig) return p
        return {
          ...orig,
          ...p,
          question:
            p.question === '' || p.question === null || p.question === undefined
              ? orig.question
              : p.question
        } as SectionProps<TypeKeysEnum>
      })

      console.log('🔵 setSections merged', merged)
      setSections?.(merged) //TODO
      setJsonEditorError('')
      return true
    } catch (err: unknown) {
      setJsonEditorError('JSON 格式錯誤，請檢查內容')
      return false
    }
  }, [props.sections, setSections, setJsonEditorError])
  const renderActionJsonEditor = useCallback(() => {
    return (
      status === StatusEnum.editing && (
        <BtnGroup style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <BtnOutline onClick={() => setIsShowJsonEditor(true)}>
            JSON 編輯模式
          </BtnOutline>
          <BtnOutline
            onClick={() => {
              // if (isShowJsonEditor) {
              //   //TODO
              //   if (saveJsonEditor()) {
              //     setIsShowJsonEditor(false)
              //   }
              // } else {
              //   setIsShowJsonEditor(false)
              // }
              setIsShowJsonEditor(false)
            }}
          >
            UI 編輯模式
          </BtnOutline>
        </BtnGroup>
      )
    )
  }, [saveJsonEditor])

  const stablePropsSectionsString = useMemo(() => {
    return JSON.stringify(props.sections, null, 2)
  }, [JSON.stringify(props.sections)])
  useEffect(() => {
    setJsonEditorValue(stablePropsSectionsString)
    setJsonEditorError('')
    // Populate editor from latestSectionsRef when opening, and keep
    // the editor in sync with latestSectionsRef when closing.
    // if (isShowJsonEditor) {
    //   if (!prevIsShowJsonEditor.current) {
    //     console.log('🔴 reset', JSON.stringify(props.sections, null, 2))
    //     // opening: read from latestSectionsRef to avoid races
    //     setJsonEditorValue(JSON.stringify(props.sections, null, 2))
    //     setJsonEditorError('')
    //   }
    // } else {
    //   console.log('🔴 reset', JSON.stringify(props.sections, null, 2))
    //   // closing: update editor value to reflect latest sections
    //   setJsonEditorValue(JSON.stringify(props.sections, null, 2))
    //   setJsonEditorError('')
    // }
    // prevIsShowJsonEditor.current = isShowJsonEditor
  }, [stablePropsSectionsString])

  return (
    <MyContext.Provider
      value={{
        mode,
        status,
        role,
        sections: props.sections,
        setSections,
        actorID,
        reviewerID,
        components,
        utility,
        result,
        config
      }}
    >
      <StyledTQgenerator>
        {renderActionSubmitEditing?.()}
        {renderActionJsonEditor?.()}
        {/* {isShowSections &&
          props.sections
            .filter((section) => section.id !== null)
            .map((section, index) => {
              return (
                <SectionContent
                  key={section.id}
                  section={section}
                  index={index}
                  editSection={editSection}
                  deleteSection={deleteSection}
                />
              )
            })} */}

        {isShowSections && !isShowJsonEditor && (
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
                      />
                    </SortableItem>
                  )
                })}
            </SortableContext>
          </DndContext>
        )}
        {isShowJsonEditor && (
          <div>
            <Textarea
              style={{
                width: '100%',
                height: '300px',
                fontFamily: 'monospace',
                fontSize: '1em'
              }}
              value={jsonEditorValue}
              autoSize={true}
              onChange={(e: any) => {
                const val = e.target.value
                tryParseAndSet(val)
              }}
            />
            {jsonEditorError && (
              <div style={{ color: 'red', marginTop: '8px' }}>
                {jsonEditorError}
              </div>
            )}
          </div>
        )}
        <div
          style={{
            width: '100%',
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {status === StatusEnum.editing
            ? !isShowJsonEditor
              ? renderAction[status as keyof typeof renderAction]?.()
              : null
            : renderAction[status as keyof typeof renderAction]?.()}
        </div>

        <div className='version'>v{packageJson.version}</div>
      </StyledTQgenerator>

      <Modal
        title='訊息'
        open={isShowSelectReviewer}
        onCancel={() => setIsShowSelectReviewer(false)}
        footer={[
          <BtnOutline key='取消' onClick={() => setIsShowSelectReviewer(false)}>
            取消
          </BtnOutline>,
          <BtnPrimary
            key='確認'
            disabled={!selectedReviewerID}
            onClick={() => {
              setIsShowSelectReviewer(false)
              let score = 0
              if (mode === ModeEnum.test) {
                score = autoCorrectTest(props.sections)
              } else if (mode === ModeEnum.questionnaire) {
                score = autoCorrectQuestionnaire(props.sections)
              }
              actions?.onSubmitResponse?.(score, selectedReviewerID)
            }}
          >
            確認提交
          </BtnPrimary>
        ]}
      >
        <SearchSelect
          options={assets?.reviewerOptions}
          value={selectedReviewerID}
          onChange={(value: any) => {
            setSelectedReviewerID(value)
          }}
        />
      </Modal>
    </MyContext.Provider>
  )
}
export default TQgenerator
