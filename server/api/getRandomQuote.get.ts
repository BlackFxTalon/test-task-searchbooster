export default defineEventHandler(async () => {
    const res = await $fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=ru');
  
    return { res }
})