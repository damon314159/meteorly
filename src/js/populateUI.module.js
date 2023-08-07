export default async function populateUI(conditionDict, requestWeatherAPI, query) {
  const loadImage = (imageName) => import(`../assets/icons/${imageName}.png`)

  function fillSpans(nodes, data) {
    nodes.forEach((node) => {
      const el = node
      if (data[el.dataset.contains] !== undefined) {
        el.textContent = data[el.dataset.contains]
      }
    })
  }

  function fillCondition(el, code) {
    const img = el
    loadImage(conditionDict[code].icon).then((module) => {
      img.src = module.default
    })
  }

  function populateLocation(data) {
    const locationSpan = document.querySelector('.location span')
    if (data.region) {
      locationSpan.textContent = `${data.city}, ${data.region}`
    } else {
      locationSpan.textContent = `${data.city}, ${data.country}`
    }
  }

  function populateOverview(data) {
    const overview = document.querySelector('.overview')
    const spans = overview.querySelectorAll('span')
    const img = overview.querySelector('.condition-icon')
    fillSpans(spans, data)
    fillCondition(img, data.condition.code)
  }

  function populateDay(data) {
    const hours = document.querySelectorAll('.hour')
    for (let i = 0; i < data.length; i += 1) {
      const spans = hours[i].querySelectorAll('span')
      const img = hours[i].querySelector('.condition-icon')
      fillSpans(spans, data[i])
      fillCondition(img, data[i].condition.code)
    }
  }

  function populateWeek(data) {
    const days = document.querySelectorAll('.day')
    for (let i = 0; i < data.length; i += 1) {
      const spans = days[i].querySelectorAll('span')
      const img = days[i].querySelector('.condition-icon')
      fillSpans(spans, data[i])
      fillCondition(img, data[i].condition.code)
    }
  }

  const requestObj = await requestWeatherAPI(query)
  Promise.all(Array.from(Object.values(requestObj))).then((values) => {
    if (values.length !== 4) {
      alert('No location found')
      return
    }
    const [location, overview, day, week] = values
    populateLocation(location)
    populateOverview(overview)
    populateDay(day)
    populateWeek(week)
  })
}
