# React 組件重新創建導致 Input 失焦問題分析

## 問題現象

在 React 應用中，當用戶在 Input 輸入框中輸入文字時，每輸入一個字母後 Input 就會失去焦點，導致只能輸入一個字符。

## 問題根本原因

這是由於 **組件函數引用改變** 導致 React 認為是不同的組件類型，進而觸發組件的完全重新掛載（unmount → mount）。

## 具體案例分析

### 有問題的寫法（Hook 模式）：

```typescript
// true-false.tsx
export const useTrueFalse = () => {
  const TrueFalseComponent: React.FC<{...}> = ({ section, updateSection }) => {
    // 組件邏輯
    return <Input onChange={...} />
  }
  return { TrueFalseComponent }
}

// 在父組件中使用
const TQgenerator = () => {
  // ❌ 每次重新渲染都會創建新的組件函數引用
  const { TrueFalseComponent } = useTrueFalse()

  return <TrueFalseComponent {...props} />
}
```

### 正常的寫法（直接導出）：

```typescript
// single.tsx
export const SingleComponent = (props: ...) => {
  // 組件邏輯
  return <Input onChange={...} />
}

// 在父組件中使用
const TQgenerator = () => {
  // ✅ SingleComponent 始終是同一個函數引用
  return <SingleComponent {...props} />
}
```

## React 內部機制

### 有問題的流程：

1. 狀態更新 → 父組件重新渲染
2. `useTrueFalse()` 重新執行 → 創建新的 `TrueFalseComponent` 函數
3. React 看到不同的函數引用，認為是新的組件類型
4. 執行 unmount 舊組件 → mount 新組件
5. Input 元素被重新創建，失去焦點

### 正常的流程：

1. 狀態更新 → 父組件重新渲染
2. `SingleComponent` 仍是同一個函數引用
3. React 識別為相同組件類型，只更新 props
4. Input 元素保持，焦點不變

## 解決方案

### 方案 1：改為直接導出模式（推薦）

```typescript
export const TrueFalseComponent = (props: ...) => {
  // 組件邏輯
}
```

### 方案 2：用 useMemo 穩定組件引用

```typescript
const TQgenerator = () => {
  const trueFalseHook = useMemo(() => useTrueFalse(), [])
  const { TrueFalseComponent } = trueFalseHook
}
```

### 方案 3：將 Hook 調用移到組件外部

```typescript
const { TrueFalseComponent } = useTrueFalse()

const TQgenerator = () => {
  // 在這裡使用 TrueFalseComponent
}
```

## 關鍵學習點

- **組件函數引用的穩定性** 對 React 的 reconciliation 過程至關重要
- **在組件內部動態創建組件函數** 會導致不可預期的重新掛載
- **React.memo 無法解決函數引用改變的問題**，因為問題在於組件類型本身的改變
- 這類問題特別容易在 **自定義 Hook 返回組件** 的模式中出現

## 預防措施

1. 避免在組件內部動態創建組件函數
2. 優先使用直接導出的組件模式
3. 如必須使用 Hook 返回組件，確保組件引用的穩定性
4. 注意 `useState`、`useEffect` 等會觸發重新渲染的 Hook 的影響

## 偵錯技巧

1. 使用 React DevTools 查看組件是否被重新掛載
2. 在組件中添加 `console.log` 確認重新渲染次數
3. 檢查組件函數是否在父組件內部動態創建
4. 使用 `useRef` 來檢測組件引用是否改變

## 相關概念

- React Reconciliation
- Component Identity
- Function Reference Equality
- React.memo vs useMemo
- Custom Hooks Best Practices
