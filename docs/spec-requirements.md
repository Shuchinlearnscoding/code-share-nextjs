# 邀請碼大全 Spec Requirements

## 1. Product Overview

「邀請碼大全」是一個 MGM（Member Get Member）推薦碼分享平台，讓訪客快速搜尋並取得各平台邀請碼，讓會員管理自己提供的邀請碼，並透過使用回報、檢舉與統計機制維持邀請碼品質。

目前程式碼已完成前端原型，資料多為 mock data。後續產品化需要補上正式帳號系統、資料庫、API、權限控管、邀請碼配對邏輯與後台審核流程。

## 2. Goals

- 讓訪客可以用平台名稱搜尋邀請碼。
- 讓訪客可以隨機取得熱門或指定平台的邀請碼。
- 讓會員可以新增、編輯、上下架、刪除自己的邀請碼。
- 讓會員可以查看邀請碼使用次數、檢舉次數、建立時間與最後使用時間。
- 讓系統可透過檢舉機制降低無效邀請碼曝光。
- 讓會員可以管理個人資料、通知偏好、隱私設定與社交帳號綁定。
- 讓管理員可審核新平台、處理檢舉、管理會員與邀請碼。

## 3. Non-Goals For MVP

- 不處理平台外部優惠是否真實兌換成功，MVP 只記錄使用者回報。
- 不做現金分潤或點數錢包。
- 不串接第三方平台官方 API 驗證邀請碼有效性。
- 不支援多語系，MVP 以繁體中文為主。

## 4. User Roles

### Visitor

- 不需登入即可搜尋、瀏覽、取得邀請碼。
- 可回報邀請碼可用或不可用。
- 可註冊或登入成為會員。

### Member

- 具備 Visitor 所有能力。
- 可管理自己的邀請碼。
- 可查看自己的邀請碼統計。
- 可編輯個人資料與通知偏好。
- 可綁定或解除社交帳號。
- 可提出帳號刪除申請。

### Admin

- 可查看所有會員、平台、邀請碼與檢舉資料。
- 可審核自訂平台。
- 可處理被檢舉邀請碼。
- 可停用違規會員或邀請碼。

## 5. Current Route Map

| Route | Purpose | Current State |
| --- | --- | --- |
| `/` | 首頁、搜尋邀請碼、熱門平台、隨機配對 | 前端 mock data |
| `/aboutUs` | 品牌故事、特色、統計、團隊、聯絡方式 | 靜態內容與動畫 |
| `/profile` | 會員資料、統計、通知、隱私、社交綁定 | 前端 mock data |
| `/manageCode` | 會員邀請碼管理、新增/編輯彈窗、篩選 | 前端 mock data |
| `/auth/login` | 電子郵件登入、社交登入、忘記密碼 | 使用 next-auth 呼叫但缺後端設定 |
| `/auth/signup` | 註冊、密碼強度、社交註冊 | 呼叫 `/api/auth/register` 但 API 尚未建立 |
| `/admin` | 管理員後台 | 空頁面 |

## 6. Functional Requirements

### 6.1 Global Layout And Navigation

- Header 固定於頁面頂部。
- Header 顯示品牌名稱「邀請碼大全」並連回首頁。
- Header 提供首頁、會員專區、關於我們、登入、註冊入口。
- 會員專區需包含「個人資料編輯」與「管理我的邀請碼」。
- Footer 顯示版權資訊。
- 所有頁面需支援桌機與手機版版面。

### 6.2 Home: Invite Code Search

- 使用者可輸入平台名稱搜尋邀請碼。
- 搜尋框需根據平台清單顯示自動建議。
- 點選建議後，系統應立即搜尋該平台邀請碼。
- 按 Enter 或點擊「隨機獲取邀請碼」應觸發搜尋。
- 若搜尋框為空，系統應從平台清單隨機選擇一個平台。
- 若輸入文字可匹配平台，系統應搜尋第一個匹配平台。
- 若輸入文字無法匹配平台，MVP 可提示「找不到平台」；目前原型會生成隨機碼，正式版不應憑空產生不存在的邀請碼。
- 搜尋結果需顯示平台名稱與邀請碼。
- 使用者可選擇：
  - 「可用，謝謝」：記錄一次成功使用。
  - 「我想換一個」：同平台重新取得另一組可曝光邀請碼。
  - 「Report 無法使用」：要求二次確認後記錄檢舉，並自動提供下一組。

### 6.3 Popular Platforms

- 首頁需顯示熱門平台捷徑。
- MVP 熱門平台包含 Foodpanda、Uber、Line Pay、街口支付、環保集點、蝦皮購物。
- 點擊熱門平台時，應直接顯示該平台邀請碼。
- 熱門平台清單應可由後台或資料庫設定，避免寫死於前端。

### 6.4 Invite Code Matching Rules

- 只可曝光狀態為 active 且未過期的邀請碼。
- 同平台多組邀請碼需公平輪替，避免單一會員壟斷曝光。
- 可將會員提供的平台數、邀請碼可用率、檢舉率納入排序權重。
- 被檢舉達 3 次的邀請碼應自動下架，並通知擁有者。
- 使用者回報「可用」時，應增加該邀請碼使用次數。
- 使用者回報「不可用」時，應增加該邀請碼檢舉次數。

### 6.5 Member Registration

- 使用者可用電子郵件、暱稱、密碼註冊。
- 電子郵件必填且需符合 email 格式。
- 暱稱必填，長度 2 到 20 個字元。
- 密碼必填，需符合密碼強度要求。
- 密碼強度至少需滿足 3 項：
  - 至少 8 個字元
  - 包含小寫字母
  - 包含大寫字母
  - 包含數字
- 確認密碼必須與密碼一致。
- 使用者必須同意使用條款與隱私政策。
- 使用者可選擇是否接收電子報與行銷資訊。
- 註冊成功後需寄送驗證信，並導向登入頁。
- 可提供 Google、Facebook、LINE 社交註冊。

### 6.6 Member Login

- 使用者可用電子郵件與密碼登入。
- 電子郵件必填且需符合 email 格式。
- 密碼必填且至少 6 個字元。
- 可提供「記住我」，將 email 儲存在 localStorage。
- 可顯示或隱藏密碼。
- 登入成功後導向首頁。
- 登入失敗需顯示錯誤訊息。
- 可提供 Google、Facebook、LINE 社交登入。
- 忘記密碼流程需接受 email，寄送密碼重設連結。

### 6.7 Profile Management

- 會員可查看自己的統計：
  - 已提供邀請碼
  - 總使用次數
  - 被檢舉次數
  - 涵蓋平台數
- 會員可編輯基本資料：
  - email，只讀不可修改
  - 暱稱，必填且至少 2 個字元
  - 手機號碼，若填寫需符合台灣手機格式 `09xxxxxxxx`
  - 生日
  - 性別
  - 個人簡介
- 會員可綁定或解除 Google、LINE 社交帳號。
- 會員可設定通知偏好：
  - 接收電子郵件通知
  - 邀請碼被檢舉時通知
  - 接收每週使用統計報告
  - 接收行銷推廣訊息
- 會員可設定隱私偏好：
  - 是否公開邀請碼使用統計
  - 是否允許其他會員查看個人資料
- 會員可提出刪除帳號申請，需二次確認。

### 6.8 Invite Code Management

- 會員可查看自己所有邀請碼列表。
- 列表每筆邀請碼需顯示：
  - 平台名稱
  - 邀請碼
  - 狀態：使用中、已下架、被檢舉
  - 使用次數
  - 檢舉次數
  - 建立時間
  - 最後使用時間
- 頁面需顯示摘要統計：
  - 總邀請碼數
  - 使用中數量
  - 總使用次數
  - 被檢舉數量
  - 涵蓋平台數
- 會員可新增邀請碼。
- 新增欄位包含：
  - 平台名稱，必填
  - 自訂平台名稱，選擇「其他」時必填
  - 邀請碼，必填
  - 說明，選填
  - 有效期限，選填
- 邀請碼輸入應自動轉大寫並移除非英數字。
- 每個會員在每個平台最多可新增 2 組邀請碼。
- 自訂平台需經管理員審核後才可公開。
- 會員可編輯既有邀請碼。
- 會員可下架或重新上架邀請碼。
- 會員可刪除邀請碼，刪除前需二次確認。
- 列表需支援依平台搜尋、依狀態篩選、依建立時間或使用次數排序。

### 6.9 About Us

- 關於我們頁需呈現品牌故事、平台特色、平台數據、團隊介紹、願景使命與聯絡資訊。
- 平台數據需由資料庫或分析服務提供，避免長期寫死。
- 聯絡方式包含 email、LINE 客服、Facebook 粉絲團。
- 尚未完成的聯絡入口需明確標示或隱藏，不應只顯示 alert。

### 6.10 Admin

- 管理員需登入後才能進入 `/admin`。
- Admin MVP 需包含：
  - 會員列表與會員狀態管理
  - 邀請碼列表與狀態管理
  - 檢舉案件列表與處理
  - 自訂平台審核
  - 平台清單管理
- 管理員操作需保留 audit log。

## 7. Data Model Requirements

### User

- `id`
- `email`
- `emailVerifiedAt`
- `nickname`
- `passwordHash`
- `phone`
- `birthday`
- `gender`
- `bio`
- `role`: member/admin
- `status`: active/suspended/deleted
- `notificationSettings`
- `privacySettings`
- `createdAt`
- `updatedAt`

### SocialAccount

- `id`
- `userId`
- `provider`: google/facebook/line
- `providerAccountId`
- `createdAt`

### Platform

- `id`
- `name`
- `slug`
- `icon`
- `status`: active/pending/rejected/inactive
- `isPopular`
- `sortOrder`
- `createdByUserId`
- `createdAt`
- `updatedAt`

### InviteCode

- `id`
- `userId`
- `platformId`
- `code`
- `description`
- `expiryDate`
- `status`: active/inactive/reported/deleted
- `usageCount`
- `reportCount`
- `lastUsedAt`
- `createdAt`
- `updatedAt`

### InviteCodeEvent

- `id`
- `inviteCodeId`
- `eventType`: viewed/used/reported/status_changed
- `actorUserId`
- `metadata`
- `createdAt`

### Report

- `id`
- `inviteCodeId`
- `reporterUserId`
- `reason`
- `status`: pending/resolved/rejected
- `adminNote`
- `createdAt`
- `resolvedAt`

## 8. API Requirements

### Public APIs

- `GET /api/platforms`
  - Returns active platforms and popular platform flags.
- `GET /api/invite-codes/match?platformId=...`
  - Returns one eligible invite code for the selected platform.
- `POST /api/invite-codes/:id/use`
  - Records successful usage.
- `POST /api/invite-codes/:id/report`
  - Records unavailable-code report.

### Auth APIs

- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- NextAuth provider configuration for credentials, Google, Facebook, and LINE.

### Member APIs

- `GET /api/me`
- `PATCH /api/me`
- `DELETE /api/me`
- `GET /api/me/stats`
- `GET /api/me/invite-codes`
- `POST /api/me/invite-codes`
- `PATCH /api/me/invite-codes/:id`
- `DELETE /api/me/invite-codes/:id`
- `POST /api/me/social-accounts/:provider/connect`
- `DELETE /api/me/social-accounts/:provider`

### Admin APIs

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/platforms`
- `PATCH /api/admin/platforms/:id`
- `GET /api/admin/invite-codes`
- `PATCH /api/admin/invite-codes/:id`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:id`

## 9. Validation Rules

- Email must be valid and unique.
- Nickname length must be 2 to 20 characters.
- Password must meet strength requirements on registration.
- Phone, if present, must match Taiwan mobile format `09xxxxxxxx`.
- Invite code must contain only uppercase letters and numbers after normalization.
- Invite code length should be configurable per platform, default 6 to 20 characters.
- Duplicate invite codes for the same platform should be rejected.
- A member may have at most 2 active or inactive invite codes per platform.
- Expired invite codes must not appear in public matching.

## 10. Security And Privacy Requirements

- Protected member routes must require authentication.
- Admin routes must require admin role.
- Passwords must be hashed server-side; plaintext passwords must never be stored.
- Auth/session state must not rely on front-end checks only.
- User-provided text fields must be sanitized before rendering.
- Rate limit login, registration, forgot password, use-code, and report-code endpoints.
- Prevent duplicate reports from the same user or same anonymous fingerprint within a short time window.
- Account deletion should be soft-delete first, with delayed irreversible deletion.

## 11. Analytics Requirements

- Track invite code views, uses, reports, and status changes.
- Track search terms with no matching platform to identify platform demand.
- Track popular platform click-through.
- Provide per-member statistics for profile and manage-code pages.
- Provide global statistics for About Us and Admin dashboards.

## 12. UX Requirements

- Forms must show inline validation errors.
- Destructive actions require confirmation.
- Long-running actions must show loading states and disable duplicate submission.
- Success and error messages should auto-dismiss after a short period while remaining accessible.
- Mobile layout must keep navigation, search, modal forms, and code cards usable.
- Empty states must be provided for no search results, no invite codes, and no reports.

## 13. Known Gaps In Current Repo

- `next-auth` is imported but no NextAuth route/config is present.
- `/api/auth/register` and `/api/auth/forgot-password` are referenced but not implemented.
- Login and signup footer links point to `/login` and `/register`, while actual routes are `/auth/login` and `/auth/signup`.
- `/admin` is currently empty.
- Invite code data is mocked in client components.
- Profile data and statistics are mocked.
- Filtering in `manageCode` currently shows an alert but does not filter the list.
- Add/edit/delete/toggle invite code actions do not persist data.
- Search can generate fake invite codes for unknown platforms; production should not do this.
- Some static platform stats and About Us content are hard-coded.
- `package-lock.json` is modified in the working tree before this spec change and was left untouched.

## 14. MVP Acceptance Criteria

- A visitor can search an existing platform and receive a real active invite code from persistent storage.
- A visitor can mark a code as usable, and usage count increases.
- A visitor can report a code, and report count increases.
- A code with 3 reports is automatically hidden from public matching.
- A user can register, verify email, log in, and log out.
- A logged-in member can create, edit, deactivate, reactivate, and delete their own invite codes.
- A member cannot manage another member's invite codes.
- A member cannot exceed 2 invite codes per platform.
- A member can update profile, notification, and privacy settings.
- Admin can review reported codes and pending custom platforms.
- Protected pages redirect unauthenticated users to login.
- All main pages render correctly on desktop and mobile.

## 15. Suggested Implementation Phases

### Phase 1: Foundation

- Add database schema and migrations.
- Configure NextAuth credentials and social providers.
- Implement register, login, forgot-password, and session protection.
- Fix route links for login/signup.

### Phase 2: Invite Code Core

- Replace home mock data with platform and invite-code APIs.
- Implement fair matching logic.
- Implement use/report event tracking.
- Implement auto-hide after report threshold.

### Phase 3: Member Area

- Connect profile form to real user data.
- Connect manage-code page to CRUD APIs.
- Implement real filtering and sorting.
- Add empty/loading/error states.

### Phase 4: Admin And Quality

- Build admin dashboard.
- Add custom platform approval.
- Add report handling workflow.
- Add audit logs.

### Phase 5: Polish

- Add automated tests for validation, matching, permissions, and critical UI flows.
- Improve accessibility.
- Replace hard-coded About Us stats with real analytics.
- Add production monitoring and rate limiting.
