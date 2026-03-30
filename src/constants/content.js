export const LONG_TEXT = Array(20).fill(`這是一個基於 Vue 3 與 Pretext 技術開發的動態文字繞排引擎測試。畫面中有兩隻寶可夢正在隨機移動，你可以使用滑鼠點擊並拖曳它們。注意到文字會即時且平滑地「避開」寶可夢所在的位置嗎？這是因為我們在每一影格中，都使用了 Pretext 引擎來精確測量文字寬度，並自行計算每一行文字的絕對位置（Absolute Positioning），而非依賴 CSS 的原生繞流功能。這種技術可以用於開發極其複雜且具備高度互動性的排版佈局。`).join(' ');

export const FONT_FAMILY = '16px Inter, "PingFang TC", "Microsoft JhengHei", sans-serif';
export const LINE_HEIGHT = 24;
