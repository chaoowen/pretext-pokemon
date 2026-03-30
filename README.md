# Pretext 寶可夢引擎 (Pretext Pokemon Engine)

這是一個基於 **Vue 3** 與 **Pretext** 技術開發的動態文字繞排引擎測試專案。

## 專案簡介
本專案實現了一個手動文字排版與絕對定位渲染系統。畫面中有寶可夢在隨機移動，使用者可以使用滑鼠進行拖曳。文字會即時計算並「避開」寶可夢所在的位置，實現平滑的繞排效果。

### 核心技術點
- **非 CSS 繞流**：不依賴 CSS 的 `float` 或 `shape-outside`，而是透過 JS 即時計算。
- **Pretext 引擎**：使用 `@chenglou/pretext` 進行精確的文字寬度測量與斷句。
- **絕對定位渲染**：每一行文字都透過絕對定位（Absolute Positioning）渲染到畫面上。
- **即時碰撞檢測**：在每一影格（RequestAnimationFrame）重新計算文字佈局，確保繞排流暢。

## 使用技術
- **Vue 3**: 使用 Composition API (`<script setup>`)。
- **Vite**: 高性能的前端構建工具。
- **@chenglou/pretext**: 核心文字測量引擎。
- **Tailwind CSS v4**: 用於 UI 樣式快速開發。

## 如何在本地啟用

### 1. 複製專案
```bash
git clone <repository-url>
cd pretext-pokemon
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 啟動開發伺服器
```bash
npm run dev
```

啟動後，請在瀏覽器中打開顯示的 URL（通常是 `http://localhost:5173`）。

### 4. 構建生產版本
```bash
npm run build
```

## 部署與發布 (Deployment)

本專案已配置 **GitHub Actions** 自動化部署。當你將程式碼推送到 `main` 分支時，系統會自動構建並發布到 `gh-pages` 分支。

### 啟用 GitHub Pages：
1. 前往 GitHub Repository 的 **Settings**。
2. 在左側選單選擇 **Pages**。
3. 在 **Build and deployment > Source** 選擇 **Deploy from a branch**。
4. 在 **Branch** 選擇 `gh-pages` 分支，並點擊 **Save**。

稍等幾分鐘後，你就可以在 `https://chaoowen.github.io/pretext-pokemon/` 看到部署好的專案。

