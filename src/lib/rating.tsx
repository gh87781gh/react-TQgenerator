import styled from 'styled-components'
import { RatingProps, TQgeneratorProps } from '../types'

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
  type: '評分題',
  ratingType: 'number',
  rating: 0,
  min: 0,
  max: 5,
  ratingGap: 1
}

export const RatingComponent = (
  props: RatingProps & {
    components: TQgeneratorProps['components']
    utility: TQgeneratorProps['utility']
  }
) => {
  const { components } = props
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
  const editRating = (
    key: 'rating' | 'ratingGap' | 'min' | 'max',
    value: number
  ) => {
    props.updateSection({ ...props, [key]: value })
  }

  const renderClickButton = (props: RatingProps) => {
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
          disabled={!props.isEdit}
          checked={props.ratingType === 'number'}
          onChange={() => editRatingType('number')}
        >
          自行輸入
        </Radio>
        <Radio
          key='click'
          disabled={!props.isEdit}
          checked={props.ratingType === 'click'}
          onChange={() => editRatingType('click')}
        >
          選項點選（系統自動產生選項）
        </Radio>
      </StyledRatingType>
      <StyledRatingResultItems>
        <span>最小值：</span>
        <InputNumber
          disabled={!props.isEdit}
          precision={0}
          min={0}
          value={props.min}
          onChange={(value: any) => editRating('min', Number(value) || 0)}
        />
        <span>最大值：</span>
        <InputNumber
          disabled={!props.isEdit}
          precision={0}
          min={0}
          value={props.max}
          onChange={(value: any) => editRating('max', Number(value) || 0)}
        />
        {props.ratingType === 'click' && (
          <>
            <span>分數間隔：</span>
            <InputNumber
              disabled={!props.isEdit}
              precision={0}
              min={0}
              value={props.ratingGap}
              onChange={(value: any) =>
                editRating('ratingGap', Number(value) || 0)
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
          {renderClickButton(props)}
        </div>
      )}
    </>
  )
}

RatingComponent.displayName = 'RatingComponent'
