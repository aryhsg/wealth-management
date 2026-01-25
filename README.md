# WealthWise - 智慧理財與 FIRE 規劃助手

WealthWise 是一款基於 React 開發的個人財務管理工具，旨在幫助使用者追蹤資產、分析收支，並透過 Google Gemini AI 提供客製化的理財建議。本專案特別整合了 **FIRE (財務獨立，提早退休)** 的計算邏輯，協助使用者規劃通往財富自由的道路。
> **[點此進入線上預覽版本](https://aabddd64.wealth-management.pages.dev/)**
---

## 🚀 核心功能

- **資產與收支追蹤**：直覺的介面紀錄每月收入、開支與資產分佈。
- **AI 財務分析**：串接 **Google Gemini API**，根據使用者的財務數據自動生成分析報告與改善建議。
- **FIRE 退休規劃**：內建五種常見的 FIRE 模式（如 Lean FIRE, Fat FIRE 等）計算器，預估達成目標的時間。
- **報表匯出**：支持將分析結果與財務總覽匯出為 PDF 檔案。
- **響應式介面**：使用 Tailwind CSS 打造，支援電腦與手機瀏覽。

## 🛠 技術棧 (Tech Stack)

- **前端框架**：React.js (Vite)
- **樣式處理**：Tailwind CSS
- **AI 整合**：Google Gemini API
- **數據持久化**：Firebase (Authentication / Firestore)
- **圖標庫**：Lucide React
- **文件生成**：jsPDF / html2canvas

## 📦 快速開始

### 1. 複製專案
```bash
git clone [https://github.com/aryhsg/wealth-management.git](https://github.com/aryhsg/wealth-management.git)
cd wealth-management
```
### 2. 安裝依賴
```bash
npm install
```
### 3. 環境變數設定
#### 本專案依賴外部 API 服務，請在根目錄建立 .env 檔案，並配置以下金鑰：
Google Gemini API
前往 Google AI Studio 申請免費的 API Key。

在 .env 中加入：VITE_GEMINI_API_KEY=您的金鑰

Firebase / Firestore Config
前往 Firebase Console 建立新專案。

啟用 Firestore Database 與 Authentication。

在專案設定中新增「網頁應用程式」，並取得 SDK 配置資訊。

將以下資訊對應填入 .env：
```
# Gemini API
VITE_GEMINI_API_KEY=your_gemini_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
### 4. 啟動專案
```
npm run dev
```
