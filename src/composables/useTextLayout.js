import { ref, watchEffect } from 'vue';
import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';
import { LONG_TEXT, FONT_FAMILY, LINE_HEIGHT } from '../constants/content';

export function useTextLayout(containerBounds, pokemons) {
  const textLines = ref([]);
  let preparedText = null;

  // Initialize Pretext
  preparedText = prepareWithSegments(LONG_TEXT, FONT_FAMILY);

  const computeLayout = () => {
    if (!preparedText || containerBounds.value.width === 0) return;

    const w = containerBounds.value.width;
    const h = containerBounds.value.height;
    const newLines = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let currentY = 0;

    while (currentY < h) {
      const yStart = currentY;
      const yEnd = currentY + LINE_HEIGHT;

      const obstacles = pokemons.value
        .filter(p => p.y < yEnd && p.y + p.height > yStart)
        .map(p => ({ x1: p.x, x2: p.x + p.width }))
        .sort((a, b) => a.x1 - b.x1);

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

      let lineFinished = false;
      for (const seg of segments) {
        if (seg.width < 20) continue;

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
      currentY += LINE_HEIGHT;
    }

    textLines.value = newLines;
  };

  // Recompute layout whenever pokemons or container bounds change
  watchEffect(() => {
    // We access pokemons.value deeply to trigger dependency tracking
    // For many elements, manual trigger or debouncing might be better, 
    // but for 2 pokemons it's fine.
    const _p = pokemons.value.map(p => ({ x: p.x, y: p.y, w: p.width, h: p.height }));
    const _b = containerBounds.value;
    computeLayout();
  });

  return {
    textLines,
    lineHeight: LINE_HEIGHT
  };
}
