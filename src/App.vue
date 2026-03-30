<script setup>
import { ref, onMounted, onUnmounted, nextTick, watchEffect } from 'vue';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

// --- State ---
const pokemons = ref([
  { id: 1, x: 100, y: 100, width: 80, height: 80, vx: 1, vy: 1, isDragging: false, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { id: 2, x: 300, y: 200, width: 80, height: 80, vx: -1.2, vy: 0.8, isDragging: false, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' }
]);

const textLines = ref([]);
const containerRef = ref(null);
const containerBounds = ref({ width: 0, height: 0 });
const lineHeight = 24;
const fontFamily = '16px Inter, "PingFang TC", "Microsoft JhengHei", sans-serif';

// --- Pretext Data (Non-reactive) ---
let preparedText = null;
const longText = Array(20).fill(`這是一個基於 Vue 3 與 Pretext 技術開發的動態文字繞排引擎測試。畫面中有兩隻寶可夢正在隨機移動，你可以使用滑鼠點擊並拖曳它們。注意到文字會即時且平滑地「避開」寶可夢所在的位置嗎？這是因為我們在每一影格中，都使用了 Pretext 引擎來精確測量文字寬度，並自行計算每一行文字的絕對位置（Absolute Positioning），而非依賴 CSS 的原生繞流功能。這種技術可以用於開發極其複雜且具備高度互動性的排版佈局。`).join(' ');

// --- Phase 1: Draggable & Movement ---
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

const onMouseDown = (e, pokemon) => {
  pokemon.isDragging = true;
  dragTarget = pokemon;
  dragOffset.x = e.clientX - pokemon.x;
  dragOffset.y = e.clientY - pokemon.y;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (e) => {
  if (dragTarget) {
    dragTarget.x = e.clientX - dragOffset.x;
    dragTarget.y = e.clientY - dragOffset.y;
    computeLayout();
  }
};

const onMouseUp = () => {
  if (dragTarget) {
    dragTarget.isDragging = false;
    dragTarget = null;
  }
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

const updatePositions = () => {
  const w = containerBounds.value.width;
  const h = containerBounds.value.height;

  pokemons.value.forEach(p => {
    if (!p.isDragging) {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x + p.width > w) p.vx *= -1;
      if (p.y < 0 || p.y + p.height > h) p.vy *= -1;
    }
  });
  computeLayout();
  requestAnimationFrame(updatePositions);
};

// --- Phase 3: Layout Engine ---
const computeLayout = () => {
  if (!preparedText || containerBounds.value.width === 0) return;

  const w = containerBounds.value.width;
  const newLines = [];
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let currentY = 0;

  while (currentY < containerBounds.value.height) {
    // Determine overlapping pokemons for this Y-band
    const yStart = currentY;
    const yEnd = currentY + lineHeight;

    const obstacles = pokemons.value
      .filter(p => {
        return p.y < yEnd && p.y + p.height > yStart;
      })
      .map(p => ({ x1: p.x, x2: p.x + p.width }))
      .sort((a, b) => a.x1 - b.x1);

    // Calculate free horizontal segments
    let segments = [];
    let lastX = 0;
    obstacles.forEach(obs => {
      if (obs.x1 > lastX) {
        segments.push({ start: lastX, width: obs.x1 - lastX });
      }
      lastX = Math.max(lastX, obs.x2);
    });
    if (lastX < w) {
      segments.push({ start: lastX, width: w - lastX });
    }

    // Fill segments with text
    let lineFinished = false;
    for (const seg of segments) {
      if (seg.width < 20) continue; // Skip tiny gaps

      const line = layoutNextLine(preparedText, cursor, seg.width);
      if (line) {
        newLines.push({
          text: line.text,
          x: seg.start,
          y: currentY,
          key: `${currentY}-${seg.start}`
        });
        cursor = line.end;
      } else {
        lineFinished = true;
        break;
      }
    }

    if (lineFinished) break;
    currentY += lineHeight;
  }

  textLines.value = newLines;
};

// --- Lifecycle ---
const updateBounds = () => {
  if (containerRef.value) {
    containerBounds.value = {
      width: containerRef.value.clientWidth,
      height: containerRef.value.clientHeight
    };
    computeLayout();
  }
};

onMounted(() => {
  preparedText = prepareWithSegments(longText, fontFamily);
  updateBounds();
  window.addEventListener('resize', updateBounds);
  requestAnimationFrame(updatePositions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBounds);
});
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden bg-gray-900 text-gray-100 font-inter select-none">
    <!-- Header -->
    <div class="absolute top-4 left-4 z-20 pointer-events-none">
      <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
        Pretext 寶可夢引擎
      </h1>
      <p class="text-sm text-gray-400 opacity-80">手動文字排版 | 絕對定位渲染 | Pretext 核心驅動</p>
    </div>

    <!-- Text Layer -->
    <div class="absolute inset-0 z-0">
      <span
        v-for="line in textLines"
        :key="line.key"
        class="absolute whitespace-nowrap leading-[24px]"
        :style="{
          left: `${line.x}px`,
          top: `${line.y}px`,
          height: `${lineHeight}px`
        }"
      >
        {{ line.text }}
      </span>
    </div>

    <!-- Pokemon Layer -->
    <div
      v-for="p in pokemons"
      :key="p.id"
      class="absolute z-10 cursor-grab active:cursor-grabbing transition-transform duration-75"
      :class="{ 'scale-110': p.isDragging }"
      :style="{
        left: `${p.x}px`,
        top: `${p.y}px`,
        width: `${p.width}px`,
        height: `${p.height}px`
      }"
      @mousedown="onMouseDown($event, p)"
    >
      <img :src="p.img" class="w-full h-full object-contain drop-shadow-lg" draggable="false" />
    </div>

    <!-- Footer Info -->
    <div class="absolute bottom-4 right-4 z-20 text-[10px] text-gray-500 font-mono">
      渲染行數: {{ textLines.length }} | 目標 FPS: 60
    </div>
  </div>
</template>

<style>
@import '@/assets/css/style.css';

.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
