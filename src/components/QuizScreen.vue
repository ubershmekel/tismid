<script setup lang="ts">
import { ref, computed } from 'vue'
import { questions, ANSWER_LABELS, categoryInfoList } from '../questions'
import { loadQuizProgress, saveQuizProgress } from '../quizStorage'
import type { Answers, AnswerValue } from '../types'

const emit = defineEmits<{
  complete: [answers: Answers]
}>()

const savedProgress = loadQuizProgress()
const currentIndex = ref(savedProgress?.completed ? 0 : savedProgress?.currentIndex ?? 0)
const answers = ref<Answers>(savedProgress?.completed ? {} : savedProgress?.answers ?? {})
const locked = ref(false)
const justAnswered = ref(false)
let advanceTimeout: number | undefined
const AUTO_ADVANCE_DELAY_MS = 180

const total = questions.length
const currentQuestion = computed(() => questions[currentIndex.value])
const currentAnswer = computed(() => answers.value[currentQuestion.value.id] ?? null)
const categoryInfo = computed(() =>
  categoryInfoList.find(c => c.key === currentQuestion.value.category)!
)
const canGoNext = computed(() => currentAnswer.value !== null)
const canGoBack = computed(() => currentIndex.value > 0)
const canUseNext = computed(() => canGoNext.value && !locked.value)

const progressPct = computed(() => ((currentIndex.value) / total) * 100)

function persistProgress() {
  saveQuizProgress({
    answers: answers.value,
    currentIndex: currentIndex.value,
    completed: false,
  })
}

function selectAnswer(value: AnswerValue) {
  if (locked.value) return
  const questionId = currentQuestion.value.id
  const questionIndex = currentIndex.value

  answers.value[questionId] = value
  persistProgress()
  justAnswered.value = true
  locked.value = true

  window.clearTimeout(advanceTimeout)
  advanceTimeout = window.setTimeout(() => {
    if (currentIndex.value === questionIndex && answers.value[questionId] === value) {
      advance()
    }
  }, AUTO_ADVANCE_DELAY_MS)
}

function advance() {
  if (!canGoNext.value) return
  window.clearTimeout(advanceTimeout)
  locked.value = false

  if (currentIndex.value < total - 1) {
    currentIndex.value++
    persistProgress()
    justAnswered.value = false
  } else {
    emit('complete', { ...answers.value })
  }
}

function goBack() {
  if (!canGoBack.value) return
  window.clearTimeout(advanceTimeout)
  currentIndex.value--
  persistProgress()
  justAnswered.value = false
  locked.value = false
}
</script>

<template>
  <div class="quiz-screen">
    <!-- Progress bar -->
    <div class="progress-wrap">
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: progressPct + '%', background: categoryInfo.color }"
        />
      </div>
      <span class="progress-label">{{ currentIndex + 1 }} / {{ total }}</span>
    </div>

    <!-- Category tag -->
    <Transition name="slide-up" mode="out-in">
      <div
        class="category-tag"
        :key="currentQuestion.category"
        :style="{ background: categoryInfo.color + '22', color: categoryInfo.color }"
      >
        {{ categoryInfo.name }}
      </div>
    </Transition>

    <!-- Question -->
    <Transition name="question-slide" mode="out-in">
      <div class="question-area" :key="currentQuestion.id">
        <p class="question-text">{{ currentQuestion.text }}</p>
      </div>
    </Transition>

    <!-- Answer buttons -->
    <Transition name="slide-up" mode="out-in">
      <div class="answers" :key="currentQuestion.id">
        <button
          v-for="(label, index) in ANSWER_LABELS"
          :key="index"
          class="answer-btn"
          :class="{
            selected: currentAnswer === index,
            disabled: locked && currentAnswer !== index,
          }"
          :style="currentAnswer === index ? {
            background: categoryInfo.color,
            borderColor: categoryInfo.color,
            color: '#fff'
          } : {}"
          :disabled="locked && currentAnswer !== index"
          @click="selectAnswer(index as AnswerValue)"
        >
          <span class="answer-dot" />
          <span>{{ label }}</span>
        </button>
      </div>
    </Transition>

    <!-- Navigation -->
    <div class="nav-row">
      <button class="nav-btn back-btn" :disabled="!canGoBack" @click="goBack">
        ← Back
      </button>
      <button
        class="nav-btn next-btn"
        :disabled="!canUseNext"
        @click="advance"
      >
        {{ currentIndex < total - 1 ? 'Next →' : 'See Results →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quiz-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  padding: 20px 20px 32px;
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Progress */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: var(--surface-2);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease;
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
  min-width: 44px;
  text-align: right;
}

/* Category tag */
.category-tag {
  display: inline-flex;
  align-self: flex-start;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 99px;
  flex-shrink: 0;
}

/* Question */
.question-area {
  flex: 1;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  min-height: 120px;
  padding: 8px 0;
}

.question-text {
  font-size: clamp(20px, 5vw, 26px);
  font-weight: 600;
  line-height: 1.35;
  color: var(--text);
}

/* Answers */
.answers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  text-align: left;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s, opacity 0.15s;
  box-shadow: var(--shadow);
  -webkit-tap-highlight-color: transparent;
}

.answer-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.answer-btn.disabled {
  opacity: 0.45;
}

.answer-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.5;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
}

.answer-btn.selected .answer-dot {
  background: #fff;
  border-color: #fff;
  opacity: 1;
}

/* Navigation */
.nav-row {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  margin-top: 4px;
}

.nav-btn {
  flex: 1 1 0;
  min-width: 0;
  padding: 16px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  transition: background 0.15s, opacity 0.15s, transform 0.1s;
}

.nav-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.back-btn {
  background: var(--surface);
  color: var(--text-muted);
  border: 2px solid var(--border);
}

.next-btn {
  background: var(--surface);
  color: var(--text-muted);
  border: 2px solid var(--border);
}

/* Transitions */
.question-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.question-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.question-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.question-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
}
.slide-up-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
