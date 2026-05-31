# Data Potential And Product Needs

Source workbook: `C:\Users\daiyu\Downloads\推薦碼大全.xlsx`

## Dataset Snapshot

The workbook contains six category sheets:

- 銀行類
- 行動支付類
- 餐飲類
- 遊戲娛樂類
- 網購類
- 其他APP

Current shape is spreadsheet-friendly but not database-friendly: each sheet uses categories as tabs, platforms as columns, and invite codes/URLs as rows. The app should normalize this into records like:

```txt
category -> platform -> activity/benefit -> invite code/link -> status/owner/stats
```

## High-Level Counts

| Metric | Count |
| --- | ---: |
| Category sheets | 6 |
| Platform columns | 60 |
| Platforms with at least one code/link | 53 |
| Total code/link records | 133 |
| URL or mixed URL records | 33 |
| Plain code records | 100 |
| Platforms without any code/link | 7 |
| Platforms missing activity text | 19 |
| Placeholder values like `★點我直接申請★` | 7 |
| Multiline code/link values | 1 |

## Category Coverage

| Category | Platforms | Platforms With Codes | Code Records | URL Records | Plain Code Records |
| --- | ---: | ---: | ---: | ---: | ---: |
| 銀行類 | 20 | 18 | 49 | 18 | 31 |
| 行動支付類 | 5 | 3 | 15 | 0 | 15 |
| 餐飲類 | 9 | 8 | 21 | 11 | 10 |
| 遊戲娛樂類 | 3 | 3 | 4 | 1 | 3 |
| 網購類 | 7 | 5 | 14 | 1 | 13 |
| 其他APP | 16 | 16 | 30 | 2 | 28 |

## Strong Launch Potential

- The sheet already has enough breadth for an MVP directory: 53 platforms with usable seed data is enough to make the home search feel populated.
- Banks are the strongest starting category by raw record count, with 49 records across 18 usable platforms.
- Other apps, food, mobile payment, and shopping categories create a broader “daily-life deals” positioning rather than a narrow finance-only product.
- The data includes both invite codes and referral URLs, so the product should support two CTA types:
  - copy code
  - open referral link
- Several records contain clear benefit copy, such as cash rewards, points, shopping credits, food vouchers, ride discounts, or free membership trials. This can power platform cards and SEO pages.
- Some platforms have multiple referral records, which supports the planned random/fair rotation feature.

## Data Quality Issues

### 1. Spreadsheet Shape Needs Normalization

The current wide format is hard to query. Import should convert each non-empty cell under a platform into an `InviteCode` record.

Needed import mapping:

- sheet name -> `Category.name`
- column header -> `Platform.name`
- first data row -> `Platform.currentActivityDescription`
- subsequent non-empty rows -> `InviteCode.code` or `InviteCode.referralUrl`

### 2. Code And URL Are Mixed

Some values are plain codes, some are full URLs, and one value combines a code plus a URL in the same cell.

Needed fields:

- `code`
- `referralUrl`
- `displayType`: `code`, `link`, or `code_with_link`
- `rawValue`

For URLs that contain referral codes in query params, the importer can optionally extract a code-like value into `code`, but it should preserve the original URL.

### 3. Missing Activity Descriptions

19 platform columns do not have activity/benefit text. Several still have codes, so the user can get a code without understanding the reward.

Needed workflow:

- admin can edit platform benefit text
- platform cards can show “活動內容待補” when missing
- import report should flag missing descriptions

### 4. Empty Platforms

Seven platforms have no usable code/link:

- 華南銀行
- 渣打銀行
- 街口支付
- 中油pay
- 爭鮮壽司
- 蝦皮購物
- 酷澎

Needed product decision:

- either hide empty platforms from public search
- or show them as “徵求推薦碼” pages to encourage member submissions

### 5. Placeholder Cells

There are placeholder values like `★點我直接申請★`. These are not usable unless the original spreadsheet hyperlink target is preserved and imported.

Needed importer behavior:

- inspect cell hyperlinks, not only visible text
- if hyperlink target exists, import it as `referralUrl`
- if no hyperlink target exists, flag as invalid placeholder

### 6. Duplicate Values

Some values repeat across related services:

- `LjMkqF` appears across multiple 第一銀行 services.
- `CMUjfe` appears across multiple 第一銀行 services.
- LINEBANK URLs repeat across digital account, credit card, and loan columns.
- One Richart URL appears under both 台新銀行 and Richart.

This may be valid because one referral link can apply to multiple products, but the database needs to distinguish:

- duplicate within the same platform: likely duplicate record
- duplicate across related products: potentially valid shared referral

### 7. Possible Personal Data

One OK mart value looks phone-like: `0987829233`.

Needed policy:

- detect phone-like codes during import
- ask admin to confirm whether it is a valid referral identifier
- avoid exposing personal phone numbers unless explicitly intended and consented

## Product Features Suggested By The Data

### Category Browsing

The workbook is naturally category-oriented. The app should add category pages or category filters:

- 銀行
- 行動支付
- 餐飲
- 遊戲娛樂
- 網購
- 其他APP

### Platform Detail Pages

Each platform should have a detail page with:

- platform name
- category
- current activity/benefit
- available referral codes/links
- usage/report stats
- last verified date
- submit-new-code CTA

### Import Admin Tool

This dataset should not be manually copied into code. Build an admin/import workflow:

- upload `.xlsx`
- preview normalized rows
- detect blanks, duplicates, URLs, placeholders, phone-like values
- approve import
- create/update categories, platforms, and invite codes

### Verification And Freshness

Referral campaigns change often. The app needs freshness metadata:

- `lastVerifiedAt`
- `expiresAt`
- `activityStatus`: active, unknown, ended
- `source`: seed import, user submitted, admin edited

### Public Trust Signals

Since codes may expire or fail, public UI should show:

- last used successfully
- number of successful reports
- number of failed reports
- “尚未驗證” for seed data
- report button

### Member Contribution Loop

The empty or weak platforms can become growth loops:

- “這個平台還缺推薦碼”
- “提供推薦碼，提高曝光機會”
- “補上活動說明”

## Backend Needs

### Import Schema

Add import metadata to preserve source traceability:

- `ImportBatch`
  - `id`
  - `sourceFileName`
  - `uploadedByUserId`
  - `createdAt`
  - `summaryJson`

- `InviteCode.importBatchId`
- `InviteCode.sourceSheet`
- `InviteCode.sourceColumn`
- `InviteCode.sourceRow`
- `InviteCode.rawValue`

### Invite Code Schema Updates

The initial spec should support both code and URL records:

- `code`
- `referralUrl`
- `rawValue`
- `displayType`
- `sourceType`: seed_import/user_submission/admin_created
- `verificationStatus`: unverified/verified/failed/expired
- `lastVerifiedAt`
- `expiresAt`

### Platform Schema Updates

Add:

- `categoryId`
- `activityDescription`
- `activityLastCheckedAt`
- `acceptsPlainCode`
- `acceptsReferralUrl`
- `isEmptyButWanted`

## MVP Recommendations

1. Use this workbook as seed data, but mark imported codes as `unverified`.
2. Normalize the workbook into JSON or database rows before wiring the app.
3. Prioritize public search and category browsing over member submissions if the goal is a fast demo.
4. For a credible product launch, prioritize import QA, report flow, and freshness/verification labels.
5. Hide empty platforms from default search, but create “wanted” states for member growth.
6. Do not display phone-like referral values until reviewed.
7. Preserve full referral URLs, because many platforms do not use short copyable codes.

## Immediate Implementation Tasks

- Build a script to parse the workbook into normalized JSON.
- Add database seed data for categories, platforms, and invite codes.
- Update home search to use real seeded data instead of hard-coded arrays.
- Add support for copy-code vs open-link CTAs.
- Add category filter/search UI.
- Add admin-only import review screen.
- Add validation report for duplicates, placeholders, missing activity descriptions, and phone-like values.
