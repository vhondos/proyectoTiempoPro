export const fetchWeatherData = async (day: number) => {
    try {
      // COMENTARIO: Reemplazar estas coordenadas con la ubicación deseada
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=40.4165&longitude=-3.7026&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,surface_pressure,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`)
      const data = await response.json()
      
      // COMENTARIO: Aquí procesarías los datos de la API
      // weatherData.value = {
      //   temperature: {
      //     current: data.hourly.temperature_2m[currentHourIndex],
      //     min: data.daily.temperature_2m_min[dayIndex],
      //     max: data.daily.temperature_2m_max[dayIndex],
      //     hourly: data.hourly.temperature_2m.slice(startHour, endHour)
      //   },
      //   // ... procesar resto de datos
      // }
      
    //   updateChart()
    } catch (error) {
      console.error('Error fetching weather data:', error)
    }
  }
  