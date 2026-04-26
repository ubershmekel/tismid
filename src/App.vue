<script setup lang="ts">
import { ref } from 'vue'
import type { Answers } from './types'
import { clearQuizProgress, loadQuizProgress, saveQuizProgress } from './quizStorage'
import QuizScreen from './components/QuizScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'

type Screen = 'quiz' | 'results'

const savedProgress = loadQuizProgress()
const screen = ref<Screen>(savedProgress?.completed ? 'results' : 'quiz')
const answers = ref<Answers>(savedProgress?.completed ? savedProgress.answers : {})

function onComplete(finalAnswers: Answers) {
  answers.value = finalAnswers
  saveQuizProgress({
    answers: finalAnswers,
    currentIndex: 0,
    completed: true,
  })
  screen.value = 'results'
}

function onRestart() {
  clearQuizProgress()
  answers.value = {}
  screen.value = 'quiz'
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <QuizScreen v-if="screen === 'quiz'" key="quiz" @complete="onComplete" />
    <ResultsScreen v-else key="results" :answers="answers" @restart="onRestart" />
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
