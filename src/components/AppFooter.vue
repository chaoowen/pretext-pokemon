<script setup>
defineProps({
  lineCount: Number
});
</script>

<template>
  <div class="absolute bottom-4 right-4 z-20 text-[10px] text-gray-500 font-mono">
    渲染行數: {{ lineCount }} | 目標 FPS: 60
  </div>
</template>
