# 編輯邀請碼功能 — 實作說明

## 背景

原本會員後台「管理我的邀請碼」頁面，點選任一邀請碼的「編輯」按鈕後，表單內容永遠顯示同一筆硬寫的假資料（FP123ABC），與實際點選的邀請碼無關，造成混亂。

---

## 調整目標

點選特定邀請碼的「編輯」→ 表單預填該邀請碼的實際資料 → 修改邀請碼內容與活動資訊 → 確認送出。

---

## 前端已完成的部分

**檔案：`app/manageCode/page.js`**

### 1. `editCode(codeId)` 函式

從畫面上的 `codes` 陣列找到對應邀請碼，將 `platform`、`code` 預填入表單。

```js
const editCode = (codeId) => {
    const target = codes.find((c) => c.id === codeId);
    if (!target) return;

    setEditingCodeId(codeId);
    setFormData({
        platform: target.platform,
        customPlatform: '',
        inviteCode: target.code,
        description: '',
        expiryDate: ''
    });
    setShowModal(true);
    document.body.style.overflow = 'hidden';
};
```

### 2. 編輯模式 Modal 表單

- **平台名稱**：唯讀顯示，不可更改
- **邀請碼**：預填當前值，可修改
- **更新活動資訊**：選填文字欄位
- **有效期限**：選填日期欄位
- **送出按鈕**：文字改為「確認送出」（新增模式為「新增邀請碼」）

### 3. 暫時下架邀請碼的處理

若該邀請碼狀態為 `suspended`（累積 5 人回報），編輯後送出時自動清除回報記錄並重新上架。

---

## 尚未完成（需要工程師接手）

目前專案尚無後端資料庫，`handleSubmit()` 送出後只顯示前端提示，資料並未實際儲存。

### 需要實作的 API

```
PATCH /api/invite-codes/:id
```

**Request body：**

| 欄位 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `code` | string | ✅ | 更新後的邀請碼 |
| `description` | string | 選填 | 活動說明 |
| `expiryDate` | string (ISO date) | 選填 | 有效期限 |

### `handleSubmit()` 需補上的呼叫

```js
await fetch(`/api/invite-codes/${editingCodeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: formData.inviteCode,
        description: formData.description,
        expiryDate: formData.expiryDate,
    }),
});
```

### 資料庫需更新的欄位

| 欄位 | 說明 |
|---|---|
| `code` | 邀請碼內容 |
| `activityDescription` | 活動說明 |
| `expiresAt` | 有效期限 |
| `status` | 若原為 `suspended`，改回 `active` |
| `reportRecords` | 若原為 `suspended`，清除所有回報記錄 |

### API 成功後前端需做的事

送出成功後，重新載入該筆邀請碼的最新資料，更新畫面上的卡片內容。

---

## 給工程師的一句話

> 前端編輯 Modal 已完成（預填資料、UI 流程、暫時下架自動重新上架），但 `handleSubmit` 裡缺少實際呼叫後端 API 的邏輯，需要對接 `PATCH /api/invite-codes/:id` 並在成功後重新載入該筆邀請碼的最新資料。
