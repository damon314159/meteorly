require('./css/style.css')

async function requestWeatherAPI(location) {
  const publicKey = '3c7d101d6aad41f39b9163700230208'
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${publicKey}&q=${location}&days=7`
  const response = await fetch(url)
  const weatherData = await response.json()
  forecastWeek(weatherData)
}
window.requestWeatherAPI = requestWeatherAPI

async function forecastWeek(data) {
  const allDays = await data.forecast.forecastday
  const dayData = []
  allDays.forEach((dayObj) =>
    dayData.push({
      date: dayObj.date,
      avgTemp: dayObj.day.avgtemp_c,
      maxTemp: dayObj.day.maxtemp_c,
      minTemp: dayObj.day.mintemp_c,
      humidity: dayObj.day.avghumidity,
      rainChance: dayObj.day.daily_chance_of_rain,
      condition: dayObj.day.condition
    })
  )
  console.log(dayData)
  return dayData
}
