import { ref, onMounted, onUnmounted } from 'vue';

export function usePokemon(containerBounds) {
  const pokemons = ref([
    { id: 1, x: 100, y: 100, width: 80, height: 80, vx: 1, vy: 1, isDragging: false, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
    { id: 2, x: 300, y: 200, width: 80, height: 80, vx: -1.2, vy: 0.8, isDragging: false, img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' }
  ]);

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
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
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
    onMouseDown
  };
}
