<script setup>
defineProps({
  lines: Array,
  lineHeight: Number
});
</script>

<template>
  <div class="absolute inset-0 z-0">
    <span
      v-for="line in lines"
      :key="line.key"
      class="absolute whitespace-nowrap"
      :style="{
        left: `${line.x}px`,
        top: `${line.y}px`,
        height: `${lineHeight}px`,
        lineHeight: `${lineHeight}px`
      }"
    >
      {{ line.text }}
    </span>
  </div>
</template>
