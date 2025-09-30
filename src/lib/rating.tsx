import { useCallback, useContext } from 'react'
import styled from 'styled-components'
import { RatingProps, TypeKeysEnum, StatusEnum } from '../types'
import { MyContext } from '../TQgenerator'

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

export const initRating: Pick<
  RatingProps,
  'type' | 'ratingType' | 'rating' | 'min' | 'max' | 'ratingGap'
> = {
  type: TypeKeysEnum.評分題,
  ratingType: 'number',
  rating: 0,
  min: 0,
  max: 5,
  ratingGap: 1
}

export const RatingComponent = (props: RatingProps) => {
  const context = useContext(MyContext)
  const { components } = context
  const { formItems } = components
  const { Label, Radio, InputNumber } = formItems

  const editRatingType = (value: RatingProps['ratingType']) => {
    props.updateSection({
      ...props,
      ratingType: value,
      rating: initRating.rating,
      min: initRating.min,
      max: initRating.max,
      ratingGap: initRating.ratingGap
    })
  }
  const editSection = (
    key: 'rating' | 'ratingGap' | 'min' | 'max',
    value: number
  ) => {
    let { finalScore } = props
    if (key === 'rating') finalScore = value
    props.updateSection({ ...props, finalScore, [key]: value })
  }

  const renderClickButton = useCallback(
    (isDisabled: boolean) => {
      if (
        props.max === undefined ||
        props.min === undefined ||
        props.ratingGap === undefined
      )
        return null

      const step = (props.max - props.min) / props.ratingGap
      return Array.from({ length: step + 1 }, (_, index) => {
        const rating = props.min! + index * props.ratingGap!
        if (rating > props.max!) return null
        return (
          <Radio
            key={index}
            disabled={isDisabled}
            checked={props.rating === rating}
            onChange={() => editSection('rating', rating)}
          >
            {rating}
          </Radio>
        )
      })
    },
    [props]
  )

  const renderModeEditing = useCallback(() => {
    return (
      <>
        <Label>選項</Label>
        <StyledRatingType>
          <Radio
            key='number'
            checked={props.ratingType === 'number'}
            onChange={() => editRatingType('number')}
          >
            自行輸入
          </Radio>
          <Radio
            key='click'
            checked={props.ratingType === 'click'}
            onChange={() => editRatingType('click')}
          >
            選項點選（系統自動產生選項）
          </Radio>
        </StyledRatingType>
        <StyledRatingResultItems>
          <span>最小值：</span>
          <InputNumber
            precision={0}
            min={0}
            value={props.min}
            onChange={(value: any) => editSection('min', Number(value) || 0)}
          />
          <span>最大值：</span>
          <InputNumber
            precision={0}
            min={0}
            value={props.max}
            onChange={(value: any) => editSection('max', Number(value) || 0)}
          />
          {props.ratingType === 'click' && (
            <>
              <span>分數間隔：</span>
              <InputNumber
                precision={0}
                min={0}
                value={props.ratingGap}
                onChange={(value: any) =>
                  editSection('ratingGap', Number(value) || 0)
                }
              />
            </>
          )}
        </StyledRatingResultItems>
        {props.ratingType === 'click' && (
          <div style={{ marginTop: 'var(--gap-normal)' }}>
            <hr />
            <span style={{ marginRight: 'var(--gap-normal)' }}>
              呈現按鈕範例：
            </span>
            {renderClickButton(false)}
          </div>
        )}
      </>
    )
  }, [props])
  const renderModePreviewEditing = () => {
    return (
      <>
        <Label>評分</Label>
        {props.ratingType === 'number' ? (
          <InputNumber
            disabled={true}
            value={props.rating}
            min={props.min}
            max={props.max}
            precision={0}
            onChange={(value: any) => editSection('rating', Number(value) || 0)}
            style={{ width: '150px' }}
          />
        ) : (
          <StyledRatingType>{renderClickButton(true)}</StyledRatingType>
        )}
      </>
    )
  }
  const renderModeResponse = () => {
    return (
      <>
        <Label>評分</Label>
        {props.ratingType === 'number' ? (
          <InputNumber
            disabled={props.role !== context.role}
            value={props.rating}
            min={props.min}
            max={props.max}
            precision={0}
            onChange={(value: any) => editSection('rating', Number(value) || 0)}
            style={{ width: '150px' }}
          />
        ) : (
          <StyledRatingType>{renderClickButton(false)}</StyledRatingType>
        )}
      </>
    )
  }
  const renderModeFinished = () => {
    return (
      <>
        <Label>評分</Label>
        {props.ratingType === 'number' ? (
          <InputNumber
            disabled={true}
            value={props.rating}
            min={props.min}
            max={props.max}
            precision={0}
            onChange={(value: any) => editSection('rating', Number(value) || 0)}
            style={{ width: '150px' }}
          />
        ) : (
          <StyledRatingType>{renderClickButton(true)}</StyledRatingType>
        )}
      </>
    )
  }

  const renderMode = {
    [StatusEnum.editing]: renderModeEditing,
    [StatusEnum.preview_editing]: renderModePreviewEditing,
    [StatusEnum.waiting_for_response]: renderModeResponse,
    [StatusEnum.waiting_for_correct]: renderModeResponse,
    [StatusEnum.finished]: renderModeFinished
  } as const
  return <>{renderMode[context.status as keyof typeof renderMode]?.()}</>
}
