<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePokemon } from './composables/usePokemon';
import { useTextLayout } from './composables/useTextLayout';

// Components
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import TextLayer from './components/TextLayer.vue';
import PokemonItem from './components/PokemonItem.vue';

// --- State ---
const containerRef = ref(null);
const containerBounds = ref({ width: 0, height: 0 });

// --- Composables ---
const { pokemons, onMouseDown: handleDragStart } = usePokemon(containerBounds);
const { textLines, lineHeight } = useTextLayout(containerBounds, pokemons);

// --- Lifecycle ---
const updateBounds = () => {
  if (containerRef.value) {
    containerBounds.value = {
      width: containerRef.value.clientWidth,
      height: containerRef.value.clientHeight
    };
  }
};

onMounted(() => {
  updateBounds();
  window.addEventListener('resize', updateBounds);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBounds);
});
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden bg-gray-900 text-gray-100 font-inter select-none">
    <AppHeader />

    <TextLayer 
      :lines="textLines" 
      :line-height="lineHeight" 
    />

    <PokemonItem 
      v-for="p in pokemons" 
      :key="p.id" 
      :pokemon="p" 
      @dragstart="handleDragStart($event, p)"
    />

    <AppFooter :line-count="textLines.length" />
  </div>
</template>

<style>
@import '@/assets/css/style.css';

.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
