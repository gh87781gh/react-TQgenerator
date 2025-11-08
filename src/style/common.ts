export const optionDesignStyle = `
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:not(:last-child) {
    margin-bottom: var(--gap-small);
  }

  > *:not(:last-child) {
    margin-right: var(--gap-normal);
  }
`
export const optionStyle = `
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &:not(:last-child) {
    margin-bottom: var(--gap-small);
  }

  > *:not(:last-child) {
    margin-right: var(--gap-normal);
  }
`
export const optionContentStyle = `
  .option-content {
    display: flex;
    align-items: baseline;

    &.answer {
      font-weight: 800;
      color: var(--color-black) !important;
    }
    &.passed {
      font-weight: 400;
      color: var(--color-success) !important;
    }
    &.failed {
      font-weight: 400;
      color: var(--color-danger) !important;
    }
  }
  .option-content-answer {
    min-width: 1em;
    margin-right: 2px;
  }
  .option-content-label {
    line-height: 1.3;
  }
`
export const optionResultStyle = `
  .option-result {
    width: 300px;
    display: flex;
    align-items: center;
    flex-wrap: no-wrap;
    justify-content: flex-end;
  }
`

export const optionResultScoreStyle = `
  .option-result-score {
    width: 100px;
    text-align: right;
    margin-right: var(--gap-normal);
  }
`