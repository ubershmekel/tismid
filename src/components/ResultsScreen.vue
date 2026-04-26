<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toPng } from 'html-to-image'
import { categoryInfoList, computeCategoryScores, getCategoryScore } from '../questions'
import type { Answers } from '../types'
import CategoryBar from './CategoryBar.vue'
import ShareCard from './ShareCard.vue'

const props = defineProps<{
  answers: Answers
}>()

const emit = defineEmits<{
  back: []
  restart: []
}>()

const shareCardRef = ref<HTMLElement | null>(null)
const sharing = ref(false)
const downloading = ref(false)
const copying = ref(false)
const copied = ref(false)
const barsVisible = ref(false)
const showRestartConfirm = ref(false)

const totalScore = computed(() =>
  categoryInfoList.reduce((sum, cat) => sum + getCategoryScore(props.answers, cat.key), 0)
)

const categoryScores = computed(() => computeCategoryScores(props.answers))

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
  await navigator.clipboard.writeText(text)
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

function confirmRestart() {
  showRestartConfirm.value = false
  emit('restart')
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
        <CategoryBar v-for="(cat, i) in categoryScores" :key="cat.key" :name="cat.name" :score="cat.score"
          :label="cat.label" :pct="cat.pct" :color="cat.color" :visible="barsVisible" :delay="i * 80" />
      </div>

      <!-- Action buttons -->
      <div class="action-row">
        <div class="primary-actions">
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
        </div>
        <div class="secondary-actions">
          <button class="back-btn" @click="emit('back')">
            Back
          </button>
          <button class="restart-btn" @click="showRestartConfirm = true">
            Start over
          </button>
        </div>
      </div>
    </div>

    <div v-if="showRestartConfirm" class="modal-backdrop" role="presentation" @click.self="showRestartConfirm = false">
      <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="restart-title"
        aria-describedby="restart-description">
        <h2 id="restart-title">Start over?</h2>
        <p id="restart-description">
          This will erase your current answers and take you back to the beginning of the quiz.
        </p>
        <div class="modal-actions">
          <button class="modal-cancel-btn" @click="showRestartConfirm = false">
            Cancel
          </button>
          <button class="modal-confirm-btn" @click="confirmRestart">
            Erase answers
          </button>
        </div>
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

/* Actions */
.action-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.primary-actions,
.secondary-actions {
  display: flex;
  gap: 12px;
}

.primary-actions {
  flex-wrap: wrap;
}

.secondary-actions {
  justify-content: flex-start;
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

.back-btn,
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

.back-btn:active,
.restart-btn:active {
  transform: scale(0.97);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(26, 26, 46, 0.42);
}

.confirm-modal {
  width: min(100%, 360px);
  padding: 24px;
  background: var(--surface);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  color: var(--text);
}

.confirm-modal h2 {
  margin-bottom: 8px;
  font-size: 22px;
  line-height: 1.15;
  letter-spacing: 0;
}

.confirm-modal p {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.45;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.modal-cancel-btn,
.modal-confirm-btn {
  min-height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  transition: opacity 0.15s, transform 0.1s;
}

.modal-cancel-btn {
  background: var(--surface);
  color: var(--text-muted);
  border: 2px solid var(--border);
}

.modal-confirm-btn {
  background: var(--text);
  color: #fff;
}

.modal-cancel-btn:active,
.modal-confirm-btn:active {
  transform: scale(0.97);
}

@media (max-width: 520px) {

  .primary-actions,
  .secondary-actions {
    flex-direction: column;
  }

  .share-btn,
  .download-btn,
  .copy-btn,
  .back-btn,
  .restart-btn {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-cancel-btn,
  .modal-confirm-btn {
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
