<script setup lang="ts">
import { computed } from 'vue'
import { categoryInfoList, getCategoryScore, getScoreLabel } from '../questions'
import type { Answers } from '../types'

const props = defineProps<{
  answers: Answers
  totalScore: number
}>()

const categoryScores = computed(() =>
  categoryInfoList.map(cat => ({
    ...cat,
    score: getCategoryScore(props.answers, cat.key),
    label: getScoreLabel(getCategoryScore(props.answers, cat.key)),
    pct: (getCategoryScore(props.answers, cat.key) / 15) * 100,
  }))
)
</script>

<template>
  <div class="share-card">
    <div class="card-header">
      <div class="card-title">My TismID</div>
      <div class="card-score">
        <span class="score-num">{{ totalScore }}</span>
        <span class="score-denom"> / 75</span>
      </div>
    </div>

    <div class="card-bars">
      <div v-for="cat in categoryScores" :key="cat.key" class="card-bar-row">
        <div class="bar-label-row">
          <span class="bar-name">{{ cat.shortName }}</span>
          <span class="bar-value" :style="{ color: cat.color }">
            {{ cat.score }}<span class="bar-max">/15</span>
            <span class="bar-badge" :style="{ background: cat.color + '22', color: cat.color }">{{ cat.label }}</span>
          </span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: cat.pct + '%', background: cat.color }" />
        </div>
      </div>
    </div>

    <div class="card-footer">ubershmekel.github.io/tismid/</div>
  </div>
</template>

<style scoped>
.share-card {
  width: 680px;
  background: #ffffff;
  border-radius: 28px;
  padding: 40px 44px;
  box-shadow: 0 8px 60px rgba(0, 0, 0, 0.15);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #1a1a2e;
  -webkit-font-smoothing: antialiased;
}

.card-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 28px;
  border-bottom: 2px solid #f0ede9;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a7590;
}

.card-score {
  line-height: 1;
}

.score-num {
  font-size: 52px;
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: -2px;
}

.score-denom {
  font-size: 22px;
  font-weight: 600;
  color: #7a7590;
}

.card-bars {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-bar-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.bar-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bar-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.01em;
}

.bar-value {
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-max {
  font-weight: 500;
  opacity: 0.5;
  font-size: 11px;
}

.bar-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
}

.bar-track {
  height: 10px;
  background: #f0ede9;
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 99px;
}

.card-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 2px solid #f0ede9;
  font-size: 12px;
  font-weight: 600;
  color: #c5bfba;
  text-align: center;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
