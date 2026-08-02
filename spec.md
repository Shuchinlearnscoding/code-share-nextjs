# 邀請碼大全 — 待修復規格 (spec.md)

依修復規模由小到大排序。每一項包含問題描述、相關檔案、與建議修法。

---

## 1. 登入頁「歡迎回來」標題看不清楚 ✅ 已修復

**問題**：`.welcomeTitle` 使用漸層文字 (`background-clip: text` + 透明填色) 疊加 `glow` 動畫，在淺色背景上對比度太低，文字幾乎看不見。

**檔案**：[app/auth/login/Login.module.css](app/auth/login/Login.module.css)

**修法**：移除漸層透明文字與 glow 動畫，改用純黑色 `color: #000000`。

---

## 2. 忘記密碼失敗時顯示假成功訊息

**問題**：`/api/auth/forgot-password` 呼叫失敗時，`catch` 區塊會顯示「密碼重設連結已發送」的成功訊息，誤導使用者以為信已寄出。

**檔案**：[app/auth/login/page.js:227-229](app/auth/login/page.js)

**修法**：`catch` 區塊應顯示錯誤訊息（例如「發送失敗，請稍後再試」），而不是偽造成功訊息。

---

## 3. 登入頁連結路徑錯誤

**問題**：
- 「立即註冊」連到 `/register`，正確頁面是 `/auth/signup`，目前點擊會 404。
- 「使用示範帳戶登入」連到 `/login?demo=true`，正確路徑應為 `/auth/login?demo=true`；且 `demo` 這個 query 參數目前完全沒有被讀取或處理，屬於半成品功能。

**檔案**：[app/auth/login/page.js:436-444](app/auth/login/page.js)

**修法**：修正連結路徑；若「示範帳戶登入」尚未開發，先移除該連結避免誤導。

---

## 4. `/admin` 頁面是空頁面

**問題**：`app/admin/page.js` 目前只有一個空的 `<div>`，未實作任何內容，也未從導覽列或任何地方連結過去（屬於孤兒路由）。

**檔案**：[app/admin/page.js](app/admin/page.js)

**修法**：若短期內不會開發後台管理，建議先移除此路由；若要保留，需規劃並實作管理員審核平台/回報等功能，並加上權限保護（見第 6 項）。

---

## 5. 多份 lockfile 造成 workspace root 警告

**問題**：偵測到 `/Users/daiyunwei/package-lock.json` 與專案內 `package-lock.json` 同時存在，Next.js 啟動時會出現 workspace root 判斷警告。

**修法**：確認外層 lockfile 是否必要，若非必要則刪除；或在 `next.config` 設定 `turbopack.root` 明確指定專案根目錄。

---

## 6. 會員專屬頁面沒有登入保護

**問題**：Header 的「個人資料編輯」「管理我的邀請碼」不論是否登入都能直接進入，兩個頁面目前顯示的也都是寫死的假資料（`user@example.com`、`MOCK_CODES` 等），與登入狀態完全無關。

**檔案**：
- [app/components/header.js:37-48](app/components/header.js)
- [app/profile/page.js](app/profile/page.js)
- [app/manageCode/page.js](app/manageCode/page.js)

**修法**：加入登入狀態檢查（middleware 或頁面內 redirect），未登入時導向 `/auth/login`；資料改為串接真實使用者資料（需先完成第 8 項登入系統）。

---

## 7. 「管理我的邀請碼」全部功能都是假的

**問題**：新增、編輯、下架、重新上架、刪除邀請碼，目前都只是 `setTimeout` 模擬 + `console.log`，沒有呼叫任何真實 API；重新整理頁面後所有變更都會消失，清單本身也是寫死的 `MOCK_CODES`。

**檔案**：[app/manageCode/page.js](app/manageCode/page.js)

**修法**：需要設計「使用者擁有的邀請碼」資料模型與對應 CRUD API，並與第 8 項的登入系統整合，確認只能管理自己的邀請碼。

---

## 8. 檢舉 / 自動下架機制無法跨使用者生效

**問題**：檢舉紀錄與暫時下架狀態存在 `localStorage`（[lib/reportStore.js](lib/reportStore.js)），只存在單一瀏覽器裡，不同使用者之間互不相通；後端事件 API 也明確標示 `persisted: false`（[app/api/referrals/events/route.js:17-27](app/api/referrals/events/route.js)），代表回報事件完全沒有被伺服器保存。目前文案宣稱「累積 5 人回報後下架」，實際上不同人回報不會累加，此機制形同虛設。

**檔案**：
- [lib/reportStore.js](lib/reportStore.js)
- [app/api/referrals/events/route.js](app/api/referrals/events/route.js)

**修法**：將回報紀錄與暫時下架狀態改為伺服器端儲存（資料庫或至少共用的 JSON/KV store），依 `inviteCodeId` 累計不同使用者的回報次數，達到門檻後在伺服器端標記為暫時下架，而不是依賴各自瀏覽器的 `localStorage`。

---

## 9. 登入 / 註冊功能完全無法運作（最高優先） ✅ 已改接 Neon Auth

**原問題**：登入頁呼叫 `next-auth` 的 `signIn('credentials', ...)`，但專案中沒有建立 `/api/auth/[...nextauth]` 路由，導致所有登入請求（帳密登入、Google/Facebook/LINE 社群登入）都會打到不存在的 API，實測 console 直接出現：
```
[next-auth][error][CLIENT_FETCH_ERROR] Unexpected token '<', "<!DOCTYPE "...
```
目前已移除 `next-auth`，改用 Neon Auth / Stack Auth：

**檔案**：
- [app/auth/login/page.js](app/auth/login/page.js)
- [app/auth/signup/page.js](app/auth/signup/page.js)
- [app/api/auth/[...path]/route.js](app/api/auth/[...path]/route.js)
- [lib/auth.js](lib/auth.js)
- [lib/auth-client.js](lib/auth-client.js)

**後續待辦**：
1. 在本機與 Vercel 設定 `NEON_AUTH_BASE_URL` 與 `NEON_AUTH_COOKIE_SECRET`。
2. 將 `profile` 與 `manageCode` 的假資料改接登入使用者資料。
3. 補上會員角色 / admin 角色判斷，讓 `/admin` 不只是「已登入即可進入」。

---

## 建議修復順序

1. ~~歡迎回來標題顏色~~（已完成）
2. ~~忘記密碼假成功訊息~~（改由 Neon Auth handler 處理）
3. ~~登入頁連結路徑修正~~（改接 `/auth/login` / `/auth/signup`）
4. `/admin` 空頁面處理（移除或列入後續規劃）
5. lockfile 警告清理
6. ~~登入系統建置~~（已改接 Neon Auth，待設定正式 env）
7. ~~會員頁面登入保護~~（已加上 session guard，待接真實資料）
8. 管理邀請碼真實 CRUD
9. 檢舉機制改為伺服器端儲存

> 註：第 6 步驟（登入系統）雖然規模最大，但因為第 7、8、9 項都依賴它，實際開發時建議提前處理，避免後面的功能做完又要重工。
