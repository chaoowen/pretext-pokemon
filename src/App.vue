<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePokemon } from './composables/usePokemon';
import { useTextLayout } from './composables/useTextLayout';

// Components
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import TextLayer from './components/TextLayer.vue';
import PokemonItem from './components/PokemonItem.vue';
import PokemonSelector from './components/PokemonSelector.vue';

// --- State ---
const containerRef = ref(null);
const containerBounds = ref({ width: 0, height: 0 });

// --- Composables ---
const { 
  pokemons, 
  allAvailablePokemons, 
  onMouseDown: handleDragStart, 
  togglePokemon 
} = usePokemon(containerBounds);
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
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-[#1F2C1C] text-gray-100 font-inter select-none">
    <!-- Main Game Area -->
    <div ref="containerRef" class="relative flex-1 w-full overflow-hidden">
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
    </div>

    <!-- Bottom Selector Area -->
    <PokemonSelector 
      :available-pokemons="allAvailablePokemons"
      :active-ids="pokemons.map(p => p.id)"
      @toggle="togglePokemon"
    />
  </div>
</template>

<style>
@import '@/assets/css/style.css';

.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
