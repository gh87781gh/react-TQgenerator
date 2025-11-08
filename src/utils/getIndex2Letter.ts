/**
 * 生成 Excel 式的字母序列
 * 例如：A, B, C, ..., Z, AA, AB, AC, ..., AZ, BA, BB, ...
 * @param index 選項的索引（從 0 開始）
 * @returns 對應的字母標籤
 */
export const getOptionLabel = (index: number): string => {
  let result = ''
  let current = index

  do {
    result = String.fromCharCode(65 + (current % 26)) + result
    current = Math.floor(current / 26) - 1
  } while (current >= 0)

  return result
}

/**
 * 生成指定數量的選項標籤陣列
 * @param count 需要生成的標籤數量
 * @returns 字母標籤陣列
 */
export const generateOptionLabels = (count: number): string[] => {
  return Array.from({ length: count }, (_, index) => getOptionLabel(index))
}
