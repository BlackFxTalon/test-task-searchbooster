<template>
  <h1>Наблюдатель searchbooster. Следите за скоростью набора текста</h1>

  <div class="random-text">
    <p>Случайная цитата с forismatic.com</p>
    <p v-if="pending">Загрузка...</p> 
    <p v-else-if="error">{{ error.data }}</p> 
    <p v-else>{{ randomTextFromApi.res.quoteText }}</p>
  </div>

  <button 
  type="button" 
  aria-label="button"
  :disabled="timer > 0"
  @click="refresh"
   >
    Обновить цитату
  </button>

  <button 
  type="button" 
  aria-label="button"
  v-if="timer === 0"
  @click="startTimer"
   >
    Начать тест
  </button>

  <div class="track-text">
      <p v-if="timer === 0 && sentenceToType.value > 0">Тест закончен!</p>
      <p>Времени осталось: {{ timerFormatted }}</p>
      <p>Скорость набора текста: {{ typingSpeed }} символов в минуту</p>
      <p>Введенные символы: {{ charactersTyped }}</p>
      <p>Точность: {{ accuracy }}%</p>
  </div>

  <form action="#" method="post" class="form">
    <fieldset class="form__fieldset">
      <ClientOnly>
      <textarea 
      ref="sentenceTextArea"
      v-model.trim="sentenceToType" 
      @input="updateStats"
      :disabled="timer === 0"
      >
      </textarea>
      </ClientOnly>
    </fieldset>
  </form>

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';



const sentenceToType = ref('');
const sentenceTextArea = ref(null);
const startTime = ref(null);
const timer = ref(0);
const typingSpeed = ref(0);
const charactersTyped = ref(0);
const accuracy = ref(0);

const timerFormatted = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

const { data: randomTextFromApi, pending, error, refresh } = await useFetch('/api/getRandomQuote');

const restart = () => {
  sentenceToType.value = '';
  charactersTyped.value = 0;
  typingSpeed.value = 0;
  accuracy.value = 0;
};

const startTimer = () => {
    restart();
    timer.value = 60;
    startTime.value = Date.now();
    setTimeout(() => {
      sentenceTextArea.value.focus();
    }, 0);
};

onMounted(() => {
  console.log(typeof randomTextFromApi.value.res.quoteText.length);
});

const updateStats = () => {
  charactersTyped.value = sentenceToType.value.length;
  const elapsedTime = (Date.now() - startTime.value) / 1000;
  typingSpeed.value = Math.round((charactersTyped.value / elapsedTime) * 60);

  if(charactersTyped.value > 0) {
  const typedText = sentenceToType.value.slice(0, charactersTyped.value);
  const originalText = randomTextFromApi.value.res.quoteText.slice(0, charactersTyped.value);
  let errors = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] !== originalText[i]) {
      errors++;
    }
  }
  accuracy.value = Math.round(((charactersTyped.value - errors) / charactersTyped.value) * 100);
  } else {
    accuracy.value = 0;
  }

  if(charactersTyped.value === randomTextFromApi.value.res.quoteText.length) {
    timer.value = 0;
  }
}

watch(sentenceToType, () => {
  updateStats();
});

setInterval(() => {
          if (timer.value > 0) {
            timer.value--;
            updateStats();
          }
}, 1000);

</script>

<style scoped>
:global(body) {
  font-family: 'Roboto', sans-serif;
}
h1 {
  text-align: center;
}

button {
  padding: 0;
  margin: 0 auto;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: skyblue;
  border-color: transparent;
  width: 100%;
  max-width: 150px;
  height: 30px;
  color: white;
  font-family: inherit;
  cursor: pointer;
}
  fieldset {
    padding: 0;
    margin: 0;
    border: none;
  }

  textarea {
    width: 100%;
    max-width: 1300px;
    margin: auto;
   display: flex;
   align-items: center;
   justify-content: center;
    height: 200px;
    resize: none;
    font-family: inherit;
  }

  .track-text,
  .random-text {
    text-align: center;
  }
</style>
