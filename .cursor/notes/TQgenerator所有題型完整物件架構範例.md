# TQgenerator 所有題型完整物件架構範例

## 概述

本文件記錄 TQgenerator 系統中所有題型的完整物件架構範例，包含基礎屬性說明與各題型特有屬性。

---

## 基礎屬性說明

所有題型都繼承自 `BaseSectionProps`，包含以下共同屬性：

| 屬性            | 類型                                                  | 說明                                           |
| --------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `id`            | `string \| null`                                      | 題目唯一識別碼                                 |
| `mode`          | `ModeEnum \| null`                                    | 模式：`test`（測驗）或 `questionnaire`（問卷） |
| `role`          | `string \| null`                                      | 進入者角色（取決於對接系統內有什麼角色）       |
| `updateSection` | `Function`                                            | 更新題目的回調函數                             |
| `question`      | `string`                                              | 題目內容                                       |
| `answer`        | `string \| number \| null \| string[] \| dayjs.Dayjs` | 正確答案或解析（測驗模式使用）                 |
| `response`      | `string \| number \| null \| string[] \| dayjs.Dayjs` | 使用者的回答                                   |
| `score`         | `number`                                              | 題目設定的應得分數（測驗才用得到）             |
| `finalScore`    | `number`                                              | 實際得分                                       |
| `isPass`        | `boolean \| null`                                     | 是否通過                                       |

---

## 1. 是非題 (TrueFalseProps)

### 類型定義

```typescript
type: TypeKeysEnum.是非題
```

### 特有屬性

- `boolean`: `boolean | null` - 布林值標記
- `options`: 固定兩個選項（O/X）

### 完整範例

```typescript
{
  // 基礎屬性
  id: "section-uuid-123",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "台灣的首都是台北市",
  answer: "section-uuid-123-0",  // 正確答案的 option key
  response: "section-uuid-123-0",  // 使用者回答的 option key
  score: 10,
  finalScore: 10,
  isPass: true,

  // 是非題特有屬性
  type: TypeKeysEnum.是非題,
  boolean: null,
  options: [
    {
      key: "section-uuid-123-0",
      label: "正確，台北市是台灣的首都",
      value: "section-uuid-123-0",
      isChecked: false
    },
    {
      key: "section-uuid-123-1",
      label: "錯誤，台灣的首都不是台北市",
      value: "section-uuid-123-1",
      isChecked: false
    }
  ]
}
```

### 選項結構

```typescript
{
  key: string // 選項唯一識別碼
  label: string // 選項說明文字
  value: string // 選項值（與 key 相同）
  isChecked: boolean // 是否被選中
}
```

---

## 2. 單選題 (SingleProps)

### 類型定義

```typescript
type: TypeKeysEnum.單選題
```

### 特有屬性

- `options`: 選項陣列，預設 3 個選項

### 完整範例

```typescript
{
  // 基礎屬性
  id: "section-uuid-456",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "以下哪個是程式語言？",
  answer: "section-uuid-456-1",  // 正確答案的 option key
  response: "section-uuid-456-1",  // 使用者選擇的 option key
  score: 5,
  finalScore: 5,
  isPass: true,

  // 單選題特有屬性
  type: TypeKeysEnum.單選題,
  options: [
    {
      key: "section-uuid-456-0",
      label: "HTML",
      value: "section-uuid-456-0",
      optionScore: 0  // 問卷模式才使用
    },
    {
      key: "section-uuid-456-1",
      label: "JavaScript",
      value: "section-uuid-456-1",
      optionScore: 5
    },
    {
      key: "section-uuid-456-2",
      label: "CSS",
      value: "section-uuid-456-2",
      optionScore: 0
    }
  ]
}
```

### 選項結構

```typescript
{
  key: string            // 選項唯一識別碼
  label: string          // 選項內容
  value: string          // 選項值（與 key 相同）
  optionScore?: number   // 選項分數（問卷模式使用）
}
```

---

## 3. 多選題 (MultipleProps)

### 類型定義

```typescript
type: TypeKeysEnum.多選題
```

### 特有屬性

- `options`: 選項陣列，預設 4 個選項
- `answer` 和 `response` 為 `string[]` 陣列類型

### 完整範例

```typescript
{
  // 基礎屬性
  id: "section-uuid-789",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "以下哪些是前端框架？",
  answer: ["section-uuid-789-0", "section-uuid-789-2"],  // 正確答案陣列
  response: ["section-uuid-789-0", "section-uuid-789-2"],  // 使用者選擇陣列
  score: 10,
  finalScore: 10,
  isPass: true,

  // 多選題特有屬性
  type: TypeKeysEnum.多選題,
  options: [
    {
      key: "section-uuid-789-0",
      label: "React",
      value: "section-uuid-789-0",
      optionScore: 5
    },
    {
      key: "section-uuid-789-1",
      label: "Node.js",
      value: "section-uuid-789-1",
      optionScore: 0
    },
    {
      key: "section-uuid-789-2",
      label: "Vue",
      value: "section-uuid-789-2",
      optionScore: 5
    },
    {
      key: "section-uuid-789-3",
      label: "Angular",
      value: "section-uuid-789-3",
      optionScore: 5
    }
  ]
}
```

### 選項結構

```typescript
{
  key: string            // 選項唯一識別碼
  label: string          // 選項內容
  value: string          // 選項值（與 key 相同）
  optionScore?: number   // 選項分數（問卷模式使用）
}
```

---

## 4. 填充題 (FieldProps)

### 類型定義

```typescript
type: TypeKeysEnum.填充題
```

### 特有屬性

- `answerType`: `'input' | 'number' | 'date'` - 答案類型

### 4.1 文數字輸入類型 (input)

```typescript
{
  // 基礎屬性
  id: "section-uuid-111",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "JavaScript 的作者是誰？",
  answer: "參考答案：Brendan Eich",  // 解析內容
  response: "Brendan Eich",  // 使用者輸入的文字
  score: 5,
  finalScore: 5,
  isPass: true,

  // 填充題特有屬性
  type: TypeKeysEnum.填充題,
  answerType: "input"
}
```

### 4.2 數字輸入類型 (number)

```typescript
{
  id: "section-uuid-222",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "1 + 1 = ?",
  answer: "答案是 2",  // 解析內容
  response: 2,  // 使用者輸入的數字
  score: 5,
  finalScore: 5,
  isPass: true,

  type: TypeKeysEnum.填充題,
  answerType: "number"
}
```

### 4.3 日期格式輸入 (date)

```typescript
{
  id: "section-uuid-333",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "台灣光復節是哪一天？",
  answer: "1945年10月25日",  // 解析內容
  response: dayjs("1945-10-25"),  // 介面操作時是 dayjs 物件，但實際儲存 sections 時會是 ISO 字串
  score: 5,
  finalScore: 5,
  isPass: true,

  type: TypeKeysEnum.填充題,
  answerType: "date"
}
```

### 答案類型映射

```typescript
FieldAnswerMap = {
  'input': string
  'number': number | null
  'date': dayjs.Dayjs | null
}
```

---

## 5. 問答題 (EssayProps)

### 類型定義

```typescript
type: TypeKeysEnum.問答題
```

### 特有屬性

- `answer` 和 `response` 固定為 `string` 類型

### 完整範例

```typescript
{
  // 基礎屬性
  id: "section-uuid-444",
  mode: ModeEnum.test,
  role: "student",
  updateSection: (section) => {},
  question: "請說明 React Hooks 的優點",
  answer: "參考答案：\n1. 更簡潔的程式碼\n2. 更好的邏輯複用\n3. 避免 class component 的複雜性",
  response: "React Hooks 讓我們可以在 function component 中使用 state 和其他 React 功能...",
  score: 20,
  finalScore: 18,
  isPass: true,

  // 問答題特有屬性
  type: TypeKeysEnum.問答題
}
```

### 特性

- 需要人工批改（`PermissionEnum.批改`）
- 在批改模式下會顯示「答錯」和「正確」按鈕
- 可以查看解析內容

---

## 6. 評分題 (RatingProps)

### 類型定義

```typescript
type: TypeKeysEnum.評分題
```

### 特有屬性

- `ratingType`: `'number' | 'click'` - 評分方式
- `rating`: `number` - 評分結果
- `min`: `number` - 最小值
- `max`: `number` - 最大值
- `ratingGap`: `number` - 分數間隔（click 模式使用）

### 6.1 數字輸入類型 (number)

```typescript
{
  // 基礎屬性
  id: "section-uuid-555",
  mode: ModeEnum.questionnaire,
  role: "student",
  updateSection: (section) => {},
  question: "請為本次課程評分（0-100分）",
  answer: null,
  response: null,
  score: 0,
  finalScore: 0,
  isPass: null,

  // 評分題特有屬性
  type: TypeKeysEnum.評分題,
  ratingType: "number",
  rating: 85,  // 使用者給的評分
  min: 0,
  max: 100,
  ratingGap: 1
}
```

### 6.2 選項點選類型 (click)

```typescript
{
  id: "section-uuid-666",
  mode: ModeEnum.questionnaire,
  role: "student",
  updateSection: (section) => {},
  question: "請為講師的表現評分",
  answer: null,
  response: null,
  score: 0,
  finalScore: 0,
  isPass: null,

  type: TypeKeysEnum.評分題,
  ratingType: "click",
  rating: 4,  // 使用者選擇的評分
  min: 0,
  max: 5,
  ratingGap: 1  // 會產生 0, 1, 2, 3, 4, 5 六個選項
}
```

### 計算公式

選項數量 = `(max - min) / ratingGap + 1`

範例：min=0, max=5, ratingGap=1 → 產生 6 個選項 (0, 1, 2, 3, 4, 5)

---

## 關鍵概念說明

### 1. 模式差異 (Mode)

| 模式                     | 說明     | 特性                                                          |
| ------------------------ | -------- | ------------------------------------------------------------- |
| `ModeEnum.test`          | 測驗模式 | - 有正確答案<br>- 需要批改<br>- 計算分數<br>- 顯示通過/不通過 |
| `ModeEnum.questionnaire` | 問卷模式 | - 無正確答案<br>- 不需批改<br>- 選項可設定分數                |

### 2. 狀態類型 (Status)

| 狀態                | 說明                                 |
| ------------------- | ------------------------------------ |
| `StatusEnum.設計中` | 設計題目階段，可編輯題目、選項、答案 |
| `StatusEnum.作答中` | 作答階段，可填寫 response            |
| `StatusEnum.唯讀`   | 唯讀模式，僅能查看                   |

### 3. 權限類型 (Permission)

| 權限                      | 說明                           |
| ------------------------- | ------------------------------ |
| `PermissionEnum.admin`    | 系統管理（上帝視角）           |
| `PermissionEnum.設計`     | 可以設計題目、選項、解析、分數 |
| `PermissionEnum.作答`     | 可以作答                       |
| `PermissionEnum.批改`     | 可以批改各題作答是否通過       |
| `PermissionEnum.查看內容` | 可以查看題目、選項、作答內容   |
| `PermissionEnum.查看結果` | 可以查看各題通過結果           |
| `PermissionEnum.查看答案` | 可以查看正確答案（含解析）     |

### 4. 資料欄位說明

| 欄位         | 說明           | 使用時機                                    |
| ------------ | -------------- | ------------------------------------------- |
| `answer`     | 正確答案或解析 | 測驗模式：正確答案<br>問卷模式：通常為 null |
| `response`   | 使用者回答     | 作答階段填寫                                |
| `score`      | 應得分數       | 題目設計時設定                              |
| `finalScore` | 實際得分       | 批改後計算                                  |
| `isPass`     | 是否通過       | 批改後設定（測驗模式）                      |

### 5. 初始化函數

每個題型都有對應的初始化函數：

```typescript
// 是非題
initTrueFalse(id: string): Pick<TrueFalseProps, 'type' | 'boolean' | 'options'>

// 單選題
initSingle(id: string): Pick<SingleProps, 'type' | 'options'>

// 多選題
initMultiple(id: string): Pick<MultipleProps, 'type' | 'options'>

// 填充題
initField: Pick<FieldProps, 'type' | 'answerType' | 'answer' | 'response'>

// 問答題
initEssay: Pick<EssayProps, 'type' | 'answer' | 'response'>

// 評分題
initRating: Pick<RatingProps, 'type' | 'ratingType' | 'rating' | 'min' | 'max' | 'ratingGap'>
```

---

## 使用範例

### 建立新題目

```typescript
import { v4 as uuid } from 'uuid'
import { initBaseSection, initSingle, TypeKeysEnum } from './types'

const newSection = {
  ...initBaseSection,
  ...initSingle(uuid()),
  id: uuid(),
  mode: ModeEnum.test,
  role: 'student',
  question: '請選擇正確答案',
  score: 10
}
```

### 更新題目

```typescript
const updateSection = (updatedSection: SectionProps<TypeKeysEnum>) => {
  setSections(
    sections.map((section) =>
      section.id === updatedSection.id ? updatedSection : section
    )
  )
}
```

---

## 注意事項

1. **選項 key 的唯一性**：每個選項的 `key` 必須唯一，建議使用 `${sectionId}-${index}` 或 UUID
2. **answer/response 類型對應**：不同題型的 answer/response 類型不同，需注意類型匹配
3. **問卷模式特性**：問卷模式下 `answer` 通常為 null，不需要批改
4. **日期處理**：填充題的日期類型使用 dayjs 物件，需要額外處理序列化
5. **多選題陣列處理**：多選題的 answer/response 為陣列，操作時需注意陣列方法的使用
6. **評分題的計算**：click 模式下選項數量由 min、max、ratingGap 計算得出
