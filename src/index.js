import { format } from 'date-fns'
import conditionDict from './assets/json/weather_conditions.json'
import populateUI from './js/populateUI.module'

require('./css/style.css')

async function forecastOverview(data) {
  const today = await data.forecast.forecastday[0].day
  return {
    avgTemp: today.avgtemp_c,
    maxTemp: today.maxtemp_c,
    minTemp: today.mintemp_c,
    humidity: today.avghumidity,
    rainChance: today.daily_chance_of_rain,
    condition: today.condition
  }
}

async function forecastDay(data) {
  const hour = new Date().getHours()
  const [today, tomorrow] = await data.forecast.forecastday.slice(0, 2)
  const todayHourData = today.hour.slice(hour)
  const tomorrowHourData = tomorrow.hour.slice(0, hour + 1)
  const hourData = []
  todayHourData.concat(tomorrowHourData).forEach((hourObj) =>
    hourData.push({
      time: hourObj.time.slice(11), // hh:00
      avgTemp: hourObj.temp_c,
      rainChance: hourObj.chance_of_rain,
      condition: hourObj.condition
    })
  )
  hourData[0].time = 'Now'
  return hourData
}

async function forecastWeek(data) {
  const allDays = (await data.forecast.forecastday).slice(1)
  const dayData = []
  allDays.forEach((dayObj) =>
    dayData.push({
      date: format(new Date(dayObj.date), 'EE dd/MM'), // e.g. Tue 31/01
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

async function getLocation(data) {
  const location = await data.location
  return {
    city: location.name,
    region: location.region,
    country: location.country
  }
}

async function requestWeatherAPI(query = 'auto:ip') {
  const publicKey = '3c7d101d6aad41f39b9163700230208'
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${publicKey}&q=${query}&days=8&aqi=no&alerts=no`
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (response.status !== 200) {
      throw new Error('No location found')
    }
    const weatherData = await response.json()
    return {
      location: getLocation(weatherData),
      overview: forecastOverview(weatherData),
      day: forecastDay(weatherData),
      week: forecastWeek(weatherData)
    }
  } catch (error) {
    return error
  }
}

window.onload = () => {
  populateUI(conditionDict, requestWeatherAPI)

  const searchInput = document.getElementById('search-input')
  const searchButton = document.querySelector('.search-icon')
  function performSearch() {
    const query = searchInput.value
    populateUI(conditionDict, requestWeatherAPI, query)
    searchInput.value = ''
  }
  searchButton.addEventListener('click', performSearch)
  searchInput.addEventListener('keypress', (event) => {
    if (event.code === 'Enter') {
      performSearch()
    }
  })
}
