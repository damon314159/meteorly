export default async function populateUI(conditionDict, requestWeatherAPI, query) {
  // Function to dynamically load an image
  const loadImage = (imageName) => import(`../assets/icons/${imageName}.png`)

  // Function to fill spans with data values
  function fillSpans(nodes, data) {
    nodes.forEach((node) => {
      const el = node
      if (data[el.dataset.contains] !== undefined) {
        el.textContent = data[el.dataset.contains]
      }
    })
  }

  // Function to fill condition icon based on condition code
  function fillCondition(el, code) {
    const img = el
    loadImage(conditionDict[code].icon).then((module) => {
      img.src = module.default
    })
  }

  // Function to populate location information
  function populateLocation(data) {
    const locationSpan = document.querySelector('.location span')
    if (data.region) {
      locationSpan.textContent = `${data.city}, ${data.region}`
    } else {
      locationSpan.textContent = `${data.city}, ${data.country}`
    }
  }

  // Function to populate overview section
  function populateOverview(data) {
    const overview = document.querySelector('.overview')
    const spans = overview.querySelectorAll('span')
    const img = overview.querySelector('.condition-icon')
    fillSpans(spans, data)
    fillCondition(img, data.condition.code)
  }

  // Function to populate hourly forecast
  function populateDay(data) {
    const hours = document.querySelectorAll('.hour')
    for (let i = 0; i < data.length; i += 1) {
      const spans = hours[i].querySelectorAll('span')
      const img = hours[i].querySelector('.condition-icon')
      fillSpans(spans, data[i])
      fillCondition(img, data[i].condition.code)
    }
  }

  // Function to populate daily forecast
  function populateWeek(data) {
    const days = document.querySelectorAll('.day')
    for (let i = 0; i < data.length; i += 1) {
      const spans = days[i].querySelectorAll('span')
      const img = days[i].querySelector('.condition-icon')
      fillSpans(spans, data[i])
      fillCondition(img, data[i].condition.code)
    }
  }

  // Request weather data using the provided API
  const requestObj = await requestWeatherAPI(query)
  // Wait for all promises to resolve
  Promise.all(Array.from(Object.values(requestObj))).then((values) => {
    // Check if all expected values are received
    if (values.length !== 4) {
      alert('No location found')
      return
    }
    // Destructure the values and populate the UI elements
    const [location, overview, day, week] = values
    populateLocation(location)
    populateOverview(overview)
    populateDay(day)
    populateWeek(week)
  })
}
