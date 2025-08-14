# React TQ Generator

一個功能強大的 React 題目生成器組件庫，支援多種題型的創建和管理。

## 功能特色

- 🎯 支援多種題型：是非題、單選題、多選題、填充題、問答題、評分題
- 🎨 可自定義樣式和組件
- 💪 TypeScript 支援
- 📱 響應式設計
- 🔧 易於集成和擴展

## 安裝

```bash
npm install react-tqgenerator
# 或
yarn add react-tqgenerator
```

## 依賴要求

```json
{
  "react": ">=16.8.0",
  "styled-components": ">=5.0.0"
}
```

## 基本使用

```tsx
import React, { useState } from 'react'
// 方式 1: default import
import TQgenerator, { SectionProps, TypeKeysType } from 'react-tqgenerator'

// 或方式 2: named import
// import { TQgenerator, SectionProps, TypeKeysType } from 'react-tqgenerator'

// 準備必要的組件
const components = {
  formItems: {
    InputNumber: MyInputNumber,
    Select: MySelect,
    Editor: MyEditor,
    BtnGroup: MyButtonGroup,
    BtnOutline: MyOutlineButton,
    BtnText: MyTextButton,
    Input: MyInput,
    Label: MyLabel,
    Radio: MyRadio
  },
  btnItems: {
    BtnPrimary: MyPrimaryButton
  }
}

const utility = {
  icons: {
    IconDrag: MyDragIcon,
    IconDeleteOutline: MyDeleteIcon
  },
  formatDate: (date: string) => new Date(date).toLocaleDateString()
}

function App() {
  const [sections, setSections] = useState<SectionProps<TypeKeysType>[]>([])

  return (
    <TQgenerator
      mode='test'
      role='teacher'
      status='editing'
      sections={sections}
      setSections={setSections}
      components={components}
      utility={utility}
    />
  )
}
```

## 支援的題型

### 是非題 (True/False)

- 支援兩個選項的對錯判斷
- 可設定正確答案

### 單選題 (Single Choice)

- 支援多個選項，單一答案
- 可自定義選項數量

### 多選題 (Multiple Choice)

- 支援多個選項，多個答案
- 靈活的答案組合

### 填充題 (Fill in the Blank)

- 支援文字填空
- 可設定標準答案

### 問答題 (Essay)

- 開放式問答
- 支援富文本編輯

### 評分題 (Rating)

- 評分量表題型
- 可自定義評分範圍

## API 文檔

### TQgeneratorProps

| 屬性        | 類型                                  | 必填 | 說明               |
| ----------- | ------------------------------------- | ---- | ------------------ |
| mode        | 'test' \| 'survey'                    | ✓    | 模式設定           |
| role        | 'teacher' \| 'student'                | ✓    | 角色設定           |
| status      | 'editing' \| 'preview' \| 'published' | ✓    | 狀態設定           |
| sections    | SectionProps[]                        | ✓    | 題目數據           |
| setSections | function                              | ✓    | 更新題目數據的函數 |
| components  | ComponentsType                        | ✓    | 自定義組件         |
| utility     | UtilityType                           | ✓    | 工具函數和圖標     |

### 必要組件接口

您需要提供以下組件：

```tsx
// formItems
InputNumber: React.ComponentType<any>
Select: React.ComponentType<any>
Editor: React.ComponentType<any>
BtnGroup: React.ComponentType<any>
BtnOutline: React.ComponentType<any>
BtnText: React.ComponentType<any>
Input: React.ComponentType<any>
Label: React.ComponentType<any>
Radio: React.ComponentType<any>

// btnItems
BtnPrimary: React.ComponentType<any>

// icons
IconDrag: React.ComponentType<any>
IconDeleteOutline: React.ComponentType<any>
```

## 樣式自定義

組件使用 styled-components，您可以通過 CSS 變數進行樣式自定義：

```css
:root {
  --color-white: #ffffff;
  --color-black: #000000;
  --color-primary: #1890ff;
  --color-border-base: #d9d9d9;
  --color-disabled-bgc: #f5f5f5;
  --color-disabled-icon: #bfbfbf;
  --color-danger-light: #fff2f0;
  --gap-normal: 16px;
  --gap-small: 8px;
}
```

## TypeScript 支援

完整的 TypeScript 類型定義，提供良好的開發體驗。

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 更新日誌

### 1.0.0

- 初始發布
- 支援六種基本題型
- 完整的 TypeScript 支援
