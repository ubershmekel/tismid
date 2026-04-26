<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toPng } from 'html-to-image'
import { categoryInfoList, getCategoryScore, getScoreLabel } from '../questions'
import type { Answers } from '../types'
import ShareCard from './ShareCard.vue'

const props = defineProps<{
  answers: Answers
}>()

const emit = defineEmits<{
  restart: []
}>()

const shareCardRef = ref<HTMLElement | null>(null)
const sharing = ref(false)
const downloading = ref(false)
const copying = ref(false)
const copied = ref(false)
const barsVisible = ref(false)

const totalScore = computed(() =>
  categoryInfoList.reduce((sum, cat) => sum + getCategoryScore(props.answers, cat.key), 0)
)

const categoryScores = computed(() =>
  categoryInfoList.map(cat => ({
    ...cat,
    score: getCategoryScore(props.answers, cat.key),
    label: getScoreLabel(getCategoryScore(props.answers, cat.key)),
    pct: (getCategoryScore(props.answers, cat.key) / 15) * 100,
  }))
)

onMounted(() => {
  // Trigger bar animations after mount
  setTimeout(() => { barsVisible.value = true }, 150)
})

function getShareCardElement() {
  return (shareCardRef.value as any)?.$el ?? shareCardRef.value
}

async function createCardImage() {
  const el = getShareCardElement()
  if (!el) return null

  return toPng(el, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })
}

function getShareText() {
  const scoreLines = categoryScores.value
    .map(cat => `${cat.name}: ${cat.score}/15 (${cat.label})`)
    .join('\n')

  return [
    `My TismID: ${totalScore.value}/75`,
    '',
    scoreLines,
    '',
    'Get yours at https://ubershmekel.github.io/tismid/',
  ].join('\n')
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.top = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

async function downloadImage() {
  if (downloading.value || !shareCardRef.value) return
  downloading.value = true

  try {
    const dataUrl = await createCardImage()

    if (dataUrl) {
      const link = document.createElement('a')
      link.download = 'my-tismid.png'
      link.href = dataUrl
      link.click()
    }
  } catch (err) {
    console.warn('Download failed:', err)
  } finally {
    downloading.value = false
  }
}

async function share() {
  if (sharing.value || !shareCardRef.value) return
  sharing.value = true

  try {
    const dataUrl = await createCardImage()
    if (!dataUrl) return

    const blob = await fetch(dataUrl).then(r => r.blob())
    const file = new File([blob], 'my-tismid.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: getShareText(),
      })
    } else {
      const link = document.createElement('a')
      link.download = 'my-tismid.png'
      link.href = dataUrl
      link.click()
    }
  } catch (err) {
    console.warn('Share failed:', err)
  } finally {
    sharing.value = false
  }
}

async function copyText() {
  if (copying.value) return
  copying.value = true

  try {
    await copyToClipboard(getShareText())
    copied.value = true
    setTimeout(() => { copied.value = false }, 1800)
  } catch (err) {
    console.warn('Copy failed:', err)
  } finally {
    copying.value = false
  }
}
</script>

<template>
  <div class="results-screen">
    <div class="results-content">
      <!-- Header -->
      <div class="results-header">
        <div class="results-eyebrow">Your</div>
        <h1 class="results-title">TismID</h1>
        <div class="total-score">
          <span class="total-num">{{ totalScore }}</span>
          <span class="total-denom"> / 75</span>
        </div>
      </div>

      <!-- Category bars -->
      <div class="categories">
        <div v-for="(cat, i) in categoryScores" :key="cat.key" class="category-row">
          <div class="category-meta">
            <span class="category-name">{{ cat.name }}</span>
            <div class="category-score-tag">
              <span class="cat-num" :style="{ color: cat.color }">{{ cat.score }}</span>
              <span class="cat-max">/15</span>
              <span class="cat-label" :style="{ background: cat.color + '22', color: cat.color }">
                {{ cat.label }}
              </span>
            </div>
          </div>
          <div class="bar-track">
            <div class="bar-fill" :style="{
              width: barsVisible ? cat.pct + '%' : '0%',
              background: cat.color,
              transitionDelay: (i * 80) + 'ms',
            }" />
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-row">
        <button class="share-btn" :class="{ loading: sharing }" @click="share">
          <span v-if="!sharing">Share</span>
          <span v-else>Generating...</span>
        </button>
        <button class="download-btn" :class="{ loading: downloading }" @click="downloadImage">
          <span v-if="!downloading">Download image</span>
          <span v-else>Generating...</span>
        </button>
        <button class="copy-btn" :class="{ copied }" @click="copyText">
          <span v-if="copied">Copied</span>
          <span v-else-if="copying">Copying...</span>
          <span v-else>Copy text</span>
        </button>
        <button class="restart-btn" @click="emit('restart')">
          Start over
        </button>
      </div>
    </div>

    <!-- Hidden share card for image export -->
    <div class="share-card-container" aria-hidden="true">
      <ShareCard ref="shareCardRef" :answers="answers" :total-score="totalScore" />
    </div>
  </div>
</template>

<style scoped>
.results-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.results-content {
  flex: 1;
  overflow-y: auto;
  max-width: 540px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Header */
.results-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.results-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.results-title {
  font-size: clamp(36px, 10vw, 52px);
  font-weight: 800;
  letter-spacing: -1.5px;
  color: var(--text);
  line-height: 1;
  margin-bottom: 8px;
}

.total-score {
  line-height: 1;
}

.total-num {
  font-size: clamp(48px, 14vw, 72px);
  font-weight: 800;
  letter-spacing: -3px;
  color: var(--text);
}

.total-denom {
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 600;
  color: var(--text-muted);
}

/* Category bars */
.categories {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.category-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.category-score-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-num {
  font-size: 15px;
  font-weight: 800;
}

.cat-max {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.cat-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 99px;
}

.bar-track {
  height: 12px;
  background: var(--surface-2);
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Actions */
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.share-btn,
.download-btn,
.copy-btn {
  flex: 1;
  padding: 18px 24px;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 700;
  transition: opacity 0.15s, transform 0.1s;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.share-btn,
.download-btn {
  background: var(--text);
  color: #fff;
}

.copy-btn {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--text);
}

.share-btn:active,
.download-btn:active,
.copy-btn:active {
  transform: scale(0.97);
}

.share-btn.loading,
.download-btn.loading,
.copy-btn.copied {
  opacity: 0.6;
}

.share-btn.loading,
.download-btn.loading {
  cursor: wait;
}

.restart-btn {
  padding: 18px 20px;
  background: var(--surface);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  border: 2px solid var(--border);
  transition: opacity 0.15s, transform 0.1s;
  white-space: nowrap;
}

.restart-btn:active {
  transform: scale(0.97);
}

@media (max-width: 520px) {
  .action-row {
    flex-direction: column;
  }

  .share-btn,
  .download-btn,
  .copy-btn,
  .restart-btn {
    width: 100%;
  }
}

/* Hidden share card - off-screen but rendered so html-to-image can capture it */
.share-card-container {
  position: fixed;
  top: 0;
  left: -9999px;
  pointer-events: none;
}
</style>
