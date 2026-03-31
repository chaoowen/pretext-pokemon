import { ref, onMounted, onUnmounted } from 'vue';
import { getImageAlphaMask } from '../utils/imageAnalysis';

// Import all images from assets
const images = import.meta.glob('../assets/images/*.png', { eager: true });
const maskCache = new Map();

const allAvailablePokemons = Object.entries(images).map(([path, mod]) => ({
  name: path.split('/').pop().replace('.png', ''),
  url: mod.default
}));


const SPEED_MULTIPLIER = 1.5;

export function usePokemon(containerBounds) {

  const pokemons = ref([]);

  // Initialize with a default set after masks are ready
  onMounted(async () => {
    // Pre-analyze all images
    await Promise.all(allAvailablePokemons.map(async (p) => {
      try {
        const mask = await getImageAlphaMask(p.url, 80, 80);
        maskCache.set(p.name, mask);
      } catch (e) {
        console.error(`Failed to analyze ${p.name}`, e);
      }
    }));

    // Set initial pokemons
    allAvailablePokemons.slice(0, 2).forEach((p, i) => {
      pokemons.value.push({
        id: p.name,
        x: 100 + i * 200,
        y: 100 + i * 100,
        width: 80,
        height: 80,
        vx: (Math.random() - 0.5) * SPEED_MULTIPLIER,
        vy: (Math.random() - 0.5) * SPEED_MULTIPLIER,
        isDragging: false,
        img: p.url,
        mask: maskCache.get(p.name)
      });
    });
  });

  const togglePokemon = (pokemonInfo) => {
    const index = pokemons.value.findIndex(p => p.id === pokemonInfo.name);
    if (index !== -1) {
      pokemons.value.splice(index, 1);
    } else {
      const w = containerBounds.value.width || 500;
      const h = containerBounds.value.height || 500;
      pokemons.value.push({
        id: pokemonInfo.name,
        x: Math.random() * (w - 80),
        y: Math.random() * (h - 80),
        width: 80,
        height: 80,
        vx: (Math.random() - 0.5) * SPEED_MULTIPLIER,
        vy: (Math.random() - 0.5) * SPEED_MULTIPLIER,
        isDragging: false,
        img: pokemonInfo.url,
        mask: maskCache.get(pokemonInfo.name)
      });
    }
  };


  let dragTarget = null;

  let dragOffset = { x: 0, y: 0 };
  let animationFrameId = null;

  const onMouseDown = (e, pokemon) => {
    pokemon.isDragging = true;
    dragTarget = pokemon;
    dragOffset.x = e.clientX - pokemon.x;
    dragOffset.y = e.clientY - pokemon.y;
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerup', onMouseUp);
  };


  const onMouseMove = (e) => {
    if (dragTarget) {
      dragTarget.x = e.clientX - dragOffset.x;
      dragTarget.y = e.clientY - dragOffset.y;
    }
  };

  const onMouseUp = () => {
    if (dragTarget) {
      dragTarget.isDragging = false;
      dragTarget = null;
    }
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerup', onMouseUp);
  };

  const updatePositions = () => {
    const w = containerBounds.value.width;
    const h = containerBounds.value.height;

    if (w > 0 && h > 0) {
      const activePoks = pokemons.value;
      
      // Move phase
      activePoks.forEach(p => {
        if (!p.isDragging) {
          p.x += p.vx;
          p.y += p.vy;

          // Wall Bounce
          if (p.x < 0) { p.x = 0; p.vx *= -1; }
          else if (p.x + p.width > w) { p.x = w - p.width; p.vx *= -1; }
          if (p.y < 0) { p.y = 0; p.vy *= -1; }
          else if (p.y + p.height > h) { p.y = h - p.height; p.vy *= -1; }
        }
      });

      // Collision phase (between pokemons)
      for (let i = 0; i < activePoks.length; i++) {
        for (let j = i + 1; j < activePoks.length; j++) {
          const p1 = activePoks[i];
          const p2 = activePoks[j];

          // Use circular collision for smoother "pushing"
          const r1 = p1.width / 2;
          const r2 = p2.width / 2;
          const c1x = p1.x + r1;
          const c1y = p1.y + r1;
          const c2x = p2.x + r2;
          const c2y = p2.y + r2;

          const dx = c2x - c1x;
          const dy = c2y - c1y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = r1 + r2;

          if (dist < minDist && dist > 0) {
            // Collision detected!
            const nx = dx / dist; // normal x
            const ny = dy / dist; // normal y
            const overlap = minDist - dist;

            // 1. Resolve overlap (push them apart)
            // If p1 is dragging, only move p2. If neither or both (not possible usually), move both.
            if (p1.isDragging) {
              p2.x += nx * overlap;
              p2.y += ny * overlap;
              // Also update p2 velocity to "bounce" away from the dragged object
              p2.vx = nx * Math.max(Math.abs(p2.vx), 2);
              p2.vy = ny * Math.max(Math.abs(p2.vy), 2);
            } else if (p2.isDragging) {
              p1.x -= nx * overlap;
              p1.y -= ny * overlap;
              p1.vx = -nx * Math.max(Math.abs(p1.vx), 2);
              p1.vy = -ny * Math.max(Math.abs(p1.vy), 2);
            } else {
              // Both are moving freely
              p1.x -= nx * (overlap / 2);
              p1.y -= ny * (overlap / 2);
              p2.x += nx * (overlap / 2);
              p2.y += ny * (overlap / 2);

              // 2. Simple Elastic Collision (Swap velocity components along the normal)
              const p1vn = p1.vx * nx + p1.vy * ny;
              const p2vn = p2.vx * nx + p2.vy * ny;

              // Only swap if they are moving towards each other
              if (p1vn - p2vn > 0) {
                const impulse = p1vn - p2vn;
                p1.vx -= impulse * nx;
                p1.vy -= impulse * ny;
                p2.vx += impulse * nx;
                p2.vy += impulse * ny;
              }
            }
          }
        }
      }
    }

    animationFrameId = requestAnimationFrame(updatePositions);
  };

  onMounted(() => {
    animationFrameId = requestAnimationFrame(updatePositions);
  });

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('pointermove', onMouseMove);
    window.removeEventListener('pointerup', onMouseUp);
  });


  return {
    pokemons,
    allAvailablePokemons,
    onMouseDown,
    togglePokemon
  };
}

