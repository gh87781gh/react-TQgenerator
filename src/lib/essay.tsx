import React, { useContext } from 'react'
import { EssayProps } from '../types'
import { MyContext, MyContextType } from '../TQgenerator'

export const useEssay = () => {
  const EssayComponent: React.FC<{
    section: EssayProps
    updateSection: (data: any) => void
  }> = ({ section, updateSection }) => {
    const { components } = useContext<MyContextType>(MyContext)
    const { formItems } = components
    const { Label, Textarea } = formItems
    const editAnswer = (value: string) => {
      updateSection({ ...section, answer: value })
    }
    return (
      <>
        {section.mode === 'test' && (
          <>
            <Label>建議答案</Label>
            <Textarea
              disabled={!section.isEdit}
              value={section.answer}
              onChange={(e: any) => editAnswer(e.target.value)}
            />
          </>
        )}
      </>
    )
  }

  const initEssayData = () => {
    return {
      type: '問答題' as const,
      answer: ''
    }
  }

  return { EssayComponent, initEssayData }
}
