<script setup lang="ts">
defineProps<{
  name: string
  score: number
  label: string
  pct: number
  color: string
  visible?: boolean
  delay?: number
}>()
</script>

<template>
  <div class="cat-bar-row">
    <div class="cat-bar-header">
      <span class="cat-bar-name">{{ name }}</span>
      <div class="cat-bar-meta">
        <span class="cat-bar-score" :style="{ color }">{{ score }}</span>
        <span class="cat-bar-max">/15</span>
        <span class="cat-bar-badge" :style="{ background: color + '22', color }">{{ label }}</span>
      </div>
    </div>
    <div class="cat-bar-track">
      <div class="cat-bar-fill" :class="{ 'cat-bar-fill--animated': delay != null }" :style="{
        width: (visible !== false) ? pct + '%' : '0%',
        background: color,
        transitionDelay: delay != null ? delay + 'ms' : undefined,
      }" />
    </div>
  </div>
</template>

<style scoped>
.cat-bar-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cat-bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cat-bar-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.cat-bar-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-bar-score {
  font-size: 15px;
  font-weight: 800;
}

.cat-bar-max {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.cat-bar-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 99px;
}

.cat-bar-track {
  height: 12px;
  background: var(--surface-2);
  border-radius: 99px;
  overflow: hidden;
}

.cat-bar-fill {
  height: 100%;
  border-radius: 99px;
}

.cat-bar-fill--animated {
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
