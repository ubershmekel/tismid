<script setup lang="ts">
import { ref } from 'vue'
import type { Answers } from './types'
import QuizScreen from './components/QuizScreen.vue'
import ResultsScreen from './components/ResultsScreen.vue'

type Screen = 'quiz' | 'results'

const screen = ref<Screen>('quiz')
const answers = ref<Answers>({})

function onComplete(finalAnswers: Answers) {
  answers.value = finalAnswers
  screen.value = 'results'
}

function onRestart() {
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
