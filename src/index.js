import { format } from 'date-fns'
import conditionDict from './assets/json/weather_conditions.json'
import populateUI from './js/populateUI.module'

require('./css/style.css')

// Function to extract overview data for the current day
async function forecastOverview(data) {
  // Extract relevant data from the API response
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

// Function to extract hourly forecast data for the current and next day
async function forecastDay(data) {
  // Get the current hour
  const hour = new Date().getHours()
  // Extract today's and tomorrow's forecast data
  const [today, tomorrow] = await data.forecast.forecastday.slice(0, 2)
  const todayHourData = today.hour.slice(hour)
  const tomorrowHourData = tomorrow.hour.slice(0, hour + 1)
  const hourData = []
  // Combine today's and tomorrow's hourly data
  todayHourData.concat(tomorrowHourData).forEach((hourObj) =>
    hourData.push({
      time: hourObj.time.slice(11), // Extract time in the format "hh:00"
      avgTemp: hourObj.temp_c,
      rainChance: hourObj.chance_of_rain,
      condition: hourObj.condition
    })
  )
  hourData[0].time = 'Now' // Replace the first time with "Now"
  return hourData
}

// Function to extract daily forecast data for the upcoming days
async function forecastWeek(data) {
  // Extract forecast data for all days except today
  const allDays = (await data.forecast.forecastday).slice(1)
  const dayData = []
  allDays.forEach((dayObj) =>
    dayData.push({
      date: format(new Date(dayObj.date), 'EE dd/MM'), // Format date as "Tue 31/01"
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

// Function to extract location data
async function getLocation(data) {
  const location = await data.location
  return {
    city: location.name,
    region: location.region,
    country: location.country
  }
}

// Function to request weather data from the API
async function requestWeatherAPI(query = 'auto:ip') {
  const publicKey = '3c7d101d6aad41f39b9163700230208'
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${publicKey}&q=${query}&days=8&aqi=no&alerts=no`
  try {
    // Fetch weather data from the API
    const response = await fetch(url, { mode: 'cors' })
    if (response.status !== 200) {
      throw new Error('No location found')
    }
    const weatherData = await response.json()
    // Extract and return relevant data for UI population
    return {
      location: getLocation(weatherData),
      overview: forecastOverview(weatherData),
      day: forecastDay(weatherData),
      week: forecastWeek(weatherData)
    }
  } catch (error) {
    return { error }
  }
}

// Perform actions once the window loads
window.onload = () => {
  // Populate the UI with default weather data
  populateUI(conditionDict, requestWeatherAPI)

  // Get elements for search functionality
  const searchInput = document.getElementById('search-input')
  const searchButton = document.querySelector('.search-icon')

  // Function to perform search and update UI with new weather data
  function performSearch() {
    const query = searchInput.value
    populateUI(conditionDict, requestWeatherAPI, query)
    searchInput.value = ''
  }

  // Add event listeners for search button and Enter key press
  searchButton.addEventListener('click', performSearch)
  searchInput.addEventListener('keypress', (event) => {
    if (event.code === 'Enter') {
      performSearch()
    }
  })
}
