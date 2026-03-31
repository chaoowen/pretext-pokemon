import { ref, onMounted, onUnmounted } from 'vue';
import { getImageAlphaMask } from '../utils/imageAnalysis';

// Import all images from assets
const images = import.meta.glob('../assets/images/*.png', { eager: true, as: 'url' });
const maskCache = new Map();

const allAvailablePokemons = Object.entries(images).map(([path, url]) => ({
  name: path.split('/').pop().replace('.png', ''),
  url
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
      pokemons.value.forEach(p => {
        if (!p.isDragging) {
          p.x += p.vx;
          p.y += p.vy;

          // Bounce
          if (p.x < 0) {
            p.x = 0;
            p.vx *= -1;
          } else if (p.x + p.width > w) {
            p.x = w - p.width;
            p.vx *= -1;
          }

          if (p.y < 0) {
            p.y = 0;
            p.vy *= -1;
          } else if (p.y + p.height > h) {
            p.y = h - p.height;
            p.vy *= -1;
          }
        }
      });
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

