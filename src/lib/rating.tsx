import React, { useContext } from 'react'
import styled from 'styled-components'
import { RatingProps } from '../types'
import { MyContext, MyContextType } from '../TQgenerator'

const StyledRatingType = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gap-small);
`
const StyledRatingResultItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gap-small);
  flex-wrap: no-wrap;

  > * {
    display: inline-block;
    white-space: nowrap;
    max-width: 150px;
    margin-right: var(--gap-small);
  }
`

export const useRating = () => {
  const RatingComponent: React.FC<{
    section: RatingProps
    updateSection: (data: any) => void
  }> = ({ section, updateSection }) => {
    const { components } = useContext<MyContextType>(MyContext)
    const { formItems } = components
    const { Label, Radio, InputNumber } = formItems
    const editRatingType = (value: RatingProps['ratingType']) => {
      const initDefaults = {
        rating: 0,
        min: 0,
        max: 5,
        ratingGap: 1
      }
      updateSection({
        ...section,
        ratingType: value,
        rating: initDefaults.rating,
        min: initDefaults.min,
        max: initDefaults.max,
        ratingGap: initDefaults.ratingGap
      })
    }
    const editRating = (
      key: 'rating' | 'ratingGap' | 'min' | 'max',
      value: number
    ) => {
      updateSection({ ...section, [key]: value })
    }

    const renderClickButton = (ratingProps: RatingProps) => {
      if (
        ratingProps.max === undefined ||
        ratingProps.min === undefined ||
        ratingProps.ratingGap === undefined
      )
        return null

      const step = (ratingProps.max - ratingProps.min) / ratingProps.ratingGap
      return Array.from({ length: step + 1 }, (_, index) => {
        const rating = ratingProps.min! + index * ratingProps.ratingGap!
        if (rating > ratingProps.max!) return null
        return (
          <Radio key={index} disabled={true}>
            {rating}
          </Radio>
        )
      })
    }
    return (
      <>
        <Label>選項</Label>
        <StyledRatingType>
          <Radio
            key='number'
            disabled={!section.isEdit}
            checked={section.ratingType === 'number'}
            onChange={() => editRatingType('number')}
          >
            自行輸入
          </Radio>
          <Radio
            key='click'
            disabled={!section.isEdit}
            checked={section.ratingType === 'click'}
            onChange={() => editRatingType('click')}
          >
            選項點選（系統自動產生選項）
          </Radio>
        </StyledRatingType>
        <StyledRatingResultItems>
          <span>最小值：</span>
          <InputNumber
            disabled={!section.isEdit}
            precision={0}
            min={0}
            value={section.min}
            onChange={(value: any) => editRating('min', Number(value) || 0)}
          />
          <span>最大值：</span>
          <InputNumber
            disabled={!section.isEdit}
            precision={0}
            min={0}
            value={section.max}
            onChange={(value: any) => editRating('max', Number(value) || 0)}
          />
          {section.ratingType === 'click' && (
            <>
              <span>分數間隔：</span>
              <InputNumber
                disabled={!section.isEdit}
                precision={0}
                min={0}
                value={section.ratingGap}
                onChange={(value: any) =>
                  editRating('ratingGap', Number(value) || 0)
                }
              />
            </>
          )}
        </StyledRatingResultItems>
        {section.ratingType === 'click' && (
          <div style={{ marginTop: 'var(--gap-normal)' }}>
            <hr />
            <span style={{ marginRight: 'var(--gap-normal)' }}>
              呈現按鈕範例：
            </span>
            {renderClickButton(section)}
          </div>
        )}
      </>
    )
  }

  const initRatingData = () => {
    return {
      type: '評分題' as const,
      ratingType: 'number' as RatingProps['ratingType'],
      rating: 0,
      min: 0,
      max: 5,
      ratingGap: 1
    }
  }

  return { RatingComponent, initRatingData }
}
