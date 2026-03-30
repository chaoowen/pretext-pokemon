<script setup>
defineProps({
  pokemon: Object
});

const emit = defineEmits(['dragstart']);

const onMouseDown = (e) => {
  emit('dragstart', e);
};
</script>

<template>
  <div
    class="absolute z-10 cursor-grab active:cursor-grabbing transition-transform duration-75"
    :class="{ 'scale-110': pokemon.isDragging }"
    :style="{
      left: `${pokemon.x}px`,
      top: `${pokemon.y}px`,
      width: `${pokemon.width}px`,
      height: `${pokemon.height}px`,
      touchAction: 'none'
    }"
    @pointerdown="onMouseDown"
  >

    <img :src="pokemon.img" class="w-full h-full object-contain drop-shadow-lg" draggable="false" />
  </div>
</template>
