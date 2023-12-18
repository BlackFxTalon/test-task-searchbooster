<template>
  <h1>Наблюдатель searchbooster. Следите за скоростью набора текста</h1>

  <div v-if="textFromAPI !== ''" class="random-text">
    <p>рандомный текст с forismatic.com через API</p>
    <p>{{ textFromAPI }}</p>
  </div>

  <button 
  type="button" 
  aria-label="button"
  v-if="sentenceToType === ''"
  @click="startTimer"
   >
    Начать тест
  </button>

  <div v-if="timer > 0" class="track-text">
      <p>Времени осталось: {{ timerFormatted }}</p>
      <p>Скорость набора текста: {{ typingSpeed }} символов в минуту</p>
      <p>Введенные символы: {{ charactersTyped }}</p>
      <p>Точность: {{ accuracy }}%</p>
  </div>

  <div v-else-if="timer === 0 && sentenceToType.length > 0" class="track-text">
      <p>Тест закончен!</p>
      <p>Скорость набора текста: {{ typingSpeed }} символов в минуту</p>
      <p>Введенные символы: {{ charactersTyped }}</p>
      <p>Точность: {{ accuracy }}%</p>
  </div>

  <form action="#" method="post" class="form">
    <fieldset class="form__fieldset">
      <label class="form__label" for="sentenceInput"></label>
      <textarea id="sentenceInput" v-model="sentenceToType" @input="updateStats"></textarea>
    </fieldset>
  </form>

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const sentenceToType = ref('');
const startTime = ref(null);
const endTime = ref(null);
const timer = ref(0);
const typingSpeed = ref(0);
const charactersTyped = ref(0);
const accuracy = ref(0);
const textFromAPI = ref('');

const timerFormatted = computed(() => {
  const minutes = Math.floor(timer.value / 60);
  const seconds = timer.value % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

const fetchRandomTextFromAPI = async () => {
  await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=html&lang=ru', {
    mode: 'no-cors'
  })
  .then(response => {
    if (!response.ok) {
      console.log(response);
      throw new Error('Network response was not ok');
    }
    return response;
  })
  .then(data => {
    textFromAPI.value = data.quoteText;
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
};

const startTimer = () => {
    timer.value = 60;
    startTime.value = Date.now();
};

const updateStats = () => {
  const elapsedTime = (Date.now() - startTime.value) / 1000;
  typingSpeed.value = Math.round((charactersTyped.value / elapsedTime) * 60);

  if(charactersTyped.value > 0) {
    const typedText = sentenceToType.value.slice(0, charactersTyped.value);
  const originalText = textFromAPI.value.slice(0, charactersTyped.value);
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
  
}

watch(sentenceToType, () => {
  charactersTyped.value = sentenceToType.value.length;
  updateStats();
  if(sentenceToType.value.length === textFromAPI.value.length) {
    endTime.value = Date.now();
  }
});

onMounted(() => {
  fetchRandomTextFromAPI();
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
