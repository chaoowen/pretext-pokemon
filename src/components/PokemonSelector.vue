<script setup>
defineProps({
  availablePokemons: Array,
  activeIds: Array
});

defineEmits(['toggle']);
</script>

<template>
  <div class="w-full bg-[#D7CDD5] py-4 px-4 overflow-hidden">
    <div class="flex items-center gap-3 px-4 py-2 bg-gray-600 backdrop-blur-3xl rounded-3xl overflow-x-auto max-w-full scrollbar-hide">
      <div
        v-for="p in availablePokemons"
        :key="p.name"
        class="relative flex-none w-[60px] md:w-[100px] h-[60px] md:h-[100px] flex items-center justify-center transition-all duration-300 rounded-0 cursor-pointer"
        @click="$emit('toggle', p)"
      >
        <img 
          :src="p.url" 
          :alt="p.name"
          class="w-full h-full object-contain transition-all duration-300"
          :class="{ 'opacity-40 grayscale': !activeIds.includes(p.name) }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
