require('./css/style.css')

async function forecastDay(data) {
  const hour = new Date().getHours()
  const [today, tomorrow] = await data.forecast.forecastday.slice(0, 2)
  const todayHourData = today.hour.slice(hour)
  const tomorrowHourData = tomorrow.hour.slice(0, (hour + 1) % 24)
  const hourData = []
  todayHourData.concat(tomorrowHourData).forEach((hourObj) =>
    hourData.push({
      time: hourObj.time.slice(11), // hh:00
      temp: hourObj.temp_c,
      rainChance: hourObj.chance_of_rain,
      condition: hourObj.condition
    })
  )
  return hourData
}

async function forecastWeek(data) {
  const allDays = await data.forecast.forecastday
  const dayData = []
  allDays.forEach((dayObj) =>
    dayData.push({
      date: dayObj.date.slice(5), // mm-dd
      avgTemp: dayObj.day.avgtemp_c,
      maxTemp: dayObj.day.maxtemp_c,
      minTemp: dayObj.day.mintemp_c,
      humidity: dayObj.day.avghumidity,
      rainChance: dayObj.day.daily_chance_of_rain,
      condition: dayObj.day.condition
    })
  )
  return dayData
}

async function requestWeatherAPI(location = 'London') {
  const publicKey = '3c7d101d6aad41f39b9163700230208'
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${publicKey}&q=${location}&days=7&aqi=no&alerts=no`
  const response = await fetch(url, { mode: 'cors' })
  const weatherData = await response.json()
  console.log(await forecastWeek(weatherData)) // temp
  console.log(await forecastDay(weatherData)) // temp
}
window.requestWeatherAPI = requestWeatherAPI // temp
