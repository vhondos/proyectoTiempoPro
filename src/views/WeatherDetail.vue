<template>
  <div class="min-h-screen p-4 text-white relative overflow-hidden">
    <!-- Fondo dinámico -->
    <div class="absolute inset-0 w-full h-full z-0">
      <img 
        :src="getWeatherBackground(currentWeatherCode)" 
        alt="Weather background" 
        class="w-full h-full object-cover fixed"
      />
      <!-- Overlay para mejorar legibilidad -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
    </div>

    <div class="max-w-md mx-auto relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-lg font-light mb-1">Ubicación</h1>
        <div class="text-xl uppercase mb-4">{{ location }}</div>
        <div class="text-7xl font-light mb-2">{{ currentTemp }}°</div>
        <div class="text-xl mb-2">{{ currentCondition }}</div>
        <div class="text-sm">
          Máx. {{ maxTemp }}° Min. {{ minTemp }}°
        </div>
        <div class="text-sm mt-4">
          {{ weatherDescription }}
        </div>
      </div>

      <!-- Temperatura Chart -->
      <div class="bg-sky-500/20 backdrop-blur-lg rounded-xl p-4 mb-6">
        <WeatherChart :hourlyData="chartData" />
      </div>

      <!-- Hourly forecast -->
      <div class="bg-sky-500/20 backdrop-blur-lg rounded-xl p-4 mb-6">
        <div class="flex justify-between overflow-auto">
          <div v-for="hour in hourlyForecast" :key="hour.time" 
               class="text-center">
            <div class="text-sm mb-1">{{ hour.time }}</div>
            <Sun v-if="hour.icon === 'sun'" class="w-6 h-6 mx-auto mb-1" />
            <Cloud v-else-if="hour.icon === 'cloud'" class="w-6 h-6 mx-auto mb-1" />
            <CloudRain v-else class="w-6 h-6 mx-auto mb-1" />
            <div class="text-lg">{{ hour.temp }}°</div>
          </div>
        </div>
      </div>

      <!-- Daily forecast with expandable rows -->
      <div class="bg-sky-500/20 backdrop-blur-lg rounded-xl overflow-hidden">
        <div class="p-4 text-sm">
          <h2 class="mb-4">PREVISIÓN (10 DÍAS)</h2>
          
          <div v-for="day in dailyForecast" :key="day.date" class="mb-2">
            <!-- Day row (always visible) -->
            <div @click="toggleDay(day.date)"
                 class="flex items-center justify-between cursor-pointer hover:bg-sky-500/20 rounded-lg p-2">
              <span class="w-20">{{ day.name }}</span>
              <div class="flex items-center">
                <Sun v-if="day.icon === 'sun'" class="w-6 h-6" />
                <Cloud v-else-if="day.icon === 'cloud'" class="w-6 h-6" />
                <CloudRain v-else-if="day.icon === 'rain'" class="w-6 h-6" />
                <CloudSnow v-else-if="day.icon === 'snow'" class="w-6 h-6" />
                <Cloud v-else class="w-6 h-6" />
              </div>
              <div class="flex items-center space-x-2 flex-1 ml-4">
                <span class="text-gray-300 w-8">{{ day.minTemp }}°</span>
                <div class="flex-1 h-1 bg-sky-200/30 rounded-full">
                  <div class="h-1 bg-white rounded-full" 
                       :style="`width: ${(day.maxTemp - day.minTemp) * 5}%`"></div>
                </div>
                <span class="w-8">{{ day.maxTemp }}°</span>
              </div>
              <ChevronDown 
                :class="{'rotate-180': expandedDay === day.date}"
                class="w-5 h-5 ml-2 transition-transform" 
              />
            </div>

            <!-- Expanded details -->
            <div v-if="expandedDay === day.date"
                 class="bg-sky-600/20 rounded-lg p-4 mt-2 space-y-4">
              <!-- Weather details grid -->
              <div class="grid grid-cols-2 gap-4">
                <!-- Temperature -->
                <div class="bg-sky-500/20 rounded-lg p-3">
                  <div class="flex items-center mb-2">
                    <Thermometer class="w-4 h-4 mr-2" />
                    <span>Temperatura</span>
                  </div>
                  <div class="text-2xl">{{ day.details.temp }}°</div>
                  <div class="text-sm text-gray-300">
                    Sensación térmica: {{ day.details.feelsLike }}°
                  </div>
                </div>

                <!-- Rain -->
                <div class="bg-sky-500/20 rounded-lg p-3">
                  <div class="flex items-center mb-2">
                    <CloudRain class="w-4 h-4 mr-2" />
                    <span>Lluvia</span>
                  </div>
                  <div class="text-2xl">{{ day.details.rain }}mm</div>
                  <div class="text-sm text-gray-300">
                    Prob: {{ day.details.rainProb }}%
                  </div>
                </div>

                <!-- Wind -->
                <div class="bg-sky-500/20 rounded-lg p-3">
                  <div class="flex items-center mb-2">
                    <Wind class="w-4 h-4 mr-2" />
                    <span>Viento</span>
                  </div>
                  <div class="text-2xl">{{ day.details.wind }} km/h</div>
                  <div class="text-sm text-gray-300">
                    Dirección: {{ day.details.windDir }}
                  </div>
                </div>

                <!-- Snow -->
                <div class="bg-sky-500/20 rounded-lg p-3">
                  <div class="flex items-center mb-2">
                    <CloudSnow class="w-4 h-4 mr-2" />
                    <span>Nieve</span>
                  </div>
                  <div class="text-2xl">{{ day.details.snow }}mm</div>
                  <div class="text-sm text-gray-300">
                    Prob: {{ day.details.snowProb }}%
                  </div>
                </div>

                <!-- Humidity -->
                <div class="bg-sky-500/20 rounded-lg p-3">
                  <div class="flex items-center mb-2">
                    <Droplet class="w-4 h-4 mr-2" />
                    <span>Humedad</span>
                  </div>
                  <div class="text-2xl">{{ day.details.humidity }}%</div>
                  <div class="text-sm text-gray-300">
                    Punto rocío: {{ day.details.dewPoint }}°
                  </div>
                </div>

                <!-- Fog -->
                <div class="bg-sky-500/20 rounded-lg p-3">
                  <div class="flex items-center mb-2">
                    <Cloud class="w-4 h-4 mr-2" />
                    <span>Niebla</span>
                  </div>
                  <div class="text-2xl">{{ day.details.visibility }}km</div>
                  <div class="text-sm text-gray-300">
                    Visibilidad
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Sun, Cloud, CloudRain, CloudSnow, Wind, 
  Droplet, Thermometer, ChevronDown 
} from 'lucide-vue-next'
import WeatherChart from '../components/WeatherChart.vue'
import axios from 'axios'
import { useLocationStore } from '@/stores/counter'
const { lugar } = useLocationStore();


// Estado
const location = ref('ZARAGOZA')
const currentTemp = ref(0)
const currentCondition = ref('')
const maxTemp = ref(0)
const minTemp = ref(0)
const weatherDescription = ref('')
const expandedDay = ref<string | null>(null)
const currentWeatherCode = ref(0)

// Datos de ejemplo para hourlyForecast (se reemplazarán con datos reales)
const hourlyForecast = ref([
  { time: 'Ahora', temp: 0, icon: 'sun' },
  { time: '14', temp: 0, icon: 'sun' },
  { time: '15', temp: 0, icon: 'sun' },
  { time: '16', temp: 0, icon: 'sun' },
  { time: '17', temp: 0, icon: 'sun' },
  { time: '18', temp: 0, icon: 'sun' }
])

// Inicializar dailyForecast vacío (se llenará con datos de la API)
const dailyForecast = ref<any[]>([])

// Datos para el gráfico
const chartData = ref({
  time: [] as string[],
  temperature: [] as number[]
})

// Función para obtener el nombre del día de la semana
const getDayName = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  
  // Si es hoy, devolver "Hoy"
  if (date.toDateString() === today.toDateString()) {
    return 'Hoy'
  }
  
  // Si es mañana, devolver "Mañana"
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Mañana'
  }
  
  // Para otros días, devolver abreviatura del día
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[date.getDay()]
}

// Función para determinar el icono según el código del tiempo
const getWeatherIcon = (weatherCode: number) => {
  if (weatherCode === 0) return 'sun' // Despejado
  if (weatherCode >= 1 && weatherCode <= 3) return 'cloud' // Parcialmente nublado
  if (weatherCode >= 45 && weatherCode <= 48) return 'cloud' // Niebla
  if (weatherCode >= 51 && weatherCode <= 67) return 'rain' // Lluvia
  if (weatherCode >= 71 && weatherCode <= 86) return 'snow' // Nieve
  if (weatherCode >= 95) return 'rain' // Tormenta
  return 'cloud' // Por defecto
}

// Función para obtener la descripción del tiempo según el código
const getWeatherCondition = (weatherCode: number) => {
  if (weatherCode === 0) return 'Despejado'
  if (weatherCode >= 1 && weatherCode <= 3) return 'Parcialmente nublado'
  if (weatherCode >= 45 && weatherCode <= 48) return 'Niebla'
  if (weatherCode >= 51 && weatherCode <= 55) return 'Llovizna'
  if (weatherCode >= 56 && weatherCode <= 57) return 'Llovizna helada'
  if (weatherCode >= 61 && weatherCode <= 65) return 'Lluvia'
  if (weatherCode >= 66 && weatherCode <= 67) return 'Lluvia helada'
  if (weatherCode >= 71 && weatherCode <= 75) return 'Nieve'
  if (weatherCode >= 77) return 'Granizo'
  if (weatherCode >= 80 && weatherCode <= 82) return 'Lluvia intensa'
  if (weatherCode >= 85 && weatherCode <= 86) return 'Nieve intensa'
  if (weatherCode >= 95) return 'Tormenta'
  return 'Desconocido'
}

// Método para obtener el fondo según el código del tiempo
const getWeatherBackground = (weatherCode: number) => {
  // Mapear el código del tiempo a nuestros códigos internos
  let internalCode = 0
  if (weatherCode === 0) internalCode = 0 // Despejado
  else if (weatherCode >= 1 && weatherCode <= 3) internalCode = 1 // Parcialmente nublado
  else if (weatherCode >= 45 && weatherCode <= 48) internalCode = 2 // Niebla
  else if (weatherCode >= 51 && weatherCode <= 67) internalCode = 3 // Lluvia
  else if (weatherCode >= 71 && weatherCode <= 86) internalCode = 4 // Nieve
  else if (weatherCode >= 95) internalCode = 3 // Tormenta (usamos el mismo fondo que lluvia)
  
  // Imágenes de ejemplo de internet
  switch(internalCode) {
    case 0: // Soleado
      return 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=1974&auto=format&fit=crop'
    case 1: // Parcialmente nublado
      return 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=2070&auto=format&fit=crop'
    case 2: // Nublado
      return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1951&auto=format&fit=crop'
    case 3: // Lluvia
      return 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop'
    case 4: // Nieve
      return 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=2008&auto=format&fit=crop'
    default: // Por defecto, soleado
      return 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=1974&auto=format&fit=crop'
  }
  
  /* 
  // COMENTARIO: Para usar imágenes locales, reemplaza el código anterior por:
  switch(internalCode) {
    case 0: // Soleado
      return '/images/backgrounds/sunny.jpg'
    case 1: // Parcialmente nublado
      return '/images/backgrounds/partly-cloudy.jpg'
    case 2: // Nublado
      return '/images/backgrounds/cloudy.jpg'
    case 3: // Lluvia
      return '/images/backgrounds/rainy.jpg'
    case 4: // Nieve
      return '/images/backgrounds/snowy.jpg'
    default: // Por defecto, soleado
      return '/images/backgrounds/sunny.jpg'
  }
  
  // Deberás colocar tus imágenes en la carpeta "public/images/backgrounds/" 
  // y asegurarte de que los nombres coincidan con los que usas en el código
  */
}

// Métodos
const toggleDay = (date: string) => {
  if (expandedDay.value === date) {
    expandedDay.value = null
  } else {
    expandedDay.value = date
  }
}

// Llamada a la API
const fetchWeatherData = async () => {
  try {
    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast?' +
      'latitude=41.6488&' +
      'longitude=-0.8891&' +
      'hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,snow_depth,visibility,weathercode&' +
      'daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&' +
      'timezone=auto'
    )
    
    const data = response.data
    
    // Actualizar datos actuales
    currentTemp.value = Math.round(data.hourly.temperature_2m[0])
    maxTemp.value = Math.round(data.daily.temperature_2m_max[0])
    minTemp.value = Math.round(data.daily.temperature_2m_min[0])
    
    // Actualizar código del tiempo y condición
    currentWeatherCode.value = data.hourly.weathercode[0]
    currentCondition.value = getWeatherCondition(currentWeatherCode.value)
    
    // Descripción del tiempo
    weatherDescription.value = `Se prevé ${currentCondition.value.toLowerCase()} durante el día. Rachas de viento de hasta ${Math.round(data.daily.wind_gusts_10m_max[0])} km/h.`
    
    // Actualizar pronóstico por horas
    const currentHour = new Date().getHours()
    hourlyForecast.value = [
      { 
        time: 'Ahora', 
        temp: Math.round(data.hourly.temperature_2m[0]), 
        icon: getWeatherIcon(data.hourly.weathercode[0]) 
      }
    ]
    
    // Añadir las próximas 5 horas
    for (let i = 1; i <= 24; i++) {
      const hourIndex = currentHour + i
      if (hourIndex < data.hourly.time.length) {
        hourlyForecast.value.push({
          time: `${(currentHour + i) % 24}`, 
          temp: Math.round(data.hourly.temperature_2m[hourIndex]),
          icon: getWeatherIcon(data.hourly.weathercode[hourIndex])
        })
      }
    }

    // Actualizar datos del gráfico
    // Obtener solo las próximas 4 horas
    const now = new Date()
    const currentHourChart = now.getHours()
    const next4Hours = data.hourly.time.slice(currentHourChart, currentHourChart + 5) // +5 para incluir la hora actual
    const next4Temps = data.hourly.temperature_2m.slice(currentHourChart, currentHourChart + 5)

    chartData.value = {
      time: next4Hours,
      temperature: next4Temps
    }

    console.log("datos",chartData.value)
    
    // Actualizar pronóstico diario
    const newDailyForecast = []
    
    for (let i = 0; i < data.daily.time.length; i++) {
      const date = data.daily.time[i]
      const weatherCode = data.daily.weathercode[i]
      
      newDailyForecast.push({
        date: date,
        name: getDayName(date),
        icon: getWeatherIcon(weatherCode),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        weatherCode: weatherCode,
        details: {
          temp: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
          feelsLike: Math.round((data.daily.apparent_temperature_max[i] + data.daily.apparent_temperature_min[i]) / 2),
          rain: data.daily.precipitation_sum[i] || 0,
          rainProb: data.daily.precipitation_probability_max[i] || 0,
          wind: Math.round(data.daily.wind_speed_10m_max[i]),
          windDir: getWindDirection(data.daily.wind_direction_10m_dominant[i]),
          snow: 0, // La API no proporciona acumulación de nieve diaria
          snowProb: weatherCode >= 71 && weatherCode <= 86 ? data.daily.precipitation_probability_max[i] : 0,
          humidity: 0, // La API no proporciona humedad diaria, podríamos calcular un promedio
          dewPoint: 0, // La API no proporciona punto de rocío
          visibility: 0 // La API no proporciona visibilidad diaria
        }
      })
    }
    
    // Actualizar el estado
    dailyForecast.value = newDailyForecast
    
  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // En caso de error, usar datos de ejemplo
    dailyForecast.value = [
      {
        date: '2024-02-26',
        name: 'Hoy',
        icon: 'sun',
        minTemp: 19,
        maxTemp: 32,
        weatherCode: 0, // Soleado
        details: {
          temp: 28,
          feelsLike: 30,
          rain: 0,
          rainProb: 0,
          wind: 21,
          windDir: 'NE',
          snow: 0,
          snowProb: 0,
          humidity: 45,
          dewPoint: 15,
          visibility: 10
        }
      },
      {
        date: '2024-02-27',
        name: 'Mié',
        icon: 'cloud',
        minTemp: 18,
        maxTemp: 31,
        weatherCode: 1, // Parcialmente nublado
        details: {
          temp: 26,
          feelsLike: 28,
          rain: 0.2,
          rainProb: 20,
          wind: 18,
          windDir: 'N',
          snow: 0,
          snowProb: 0,
          humidity: 50,
          dewPoint: 16,
          visibility: 8
        }
      },
      {
        date: '2024-02-28',
        name: 'Jue',
        icon: 'cloud',
        minTemp: 19,
        maxTemp: 30,
        weatherCode: 2, // Nublado
        details: {
          temp: 25,
          feelsLike: 27,
          rain: 0.5,
          rainProb: 40,
          wind: 15,
          windDir: 'NW',
          snow: 0,
          snowProb: 0,
          humidity: 55,
          dewPoint: 17,
          visibility: 7
        }
      },
      {
        date: '2024-02-29',
        name: 'Vie',
        icon: 'rain',
        minTemp: 20,
        maxTemp: 32,
        weatherCode: 3, // Lluvia
        details: {
          temp: 27,
          feelsLike: 29,
          rain: 2.5,
          rainProb: 60,
          wind: 25,
          windDir: 'W',
          snow: 0,
          snowProb: 0,
          humidity: 65,
          dewPoint: 18,
          visibility: 5
        }
      },
      {
        date: '2024-03-01',
        name: 'Sáb',
        icon: 'sun',
        minTemp: 20,
        maxTemp: 36,
        weatherCode: 0, // Soleado
        details: {
          temp: 31,
          feelsLike: 33,
          rain: 0,
          rainProb: 0,
          wind: 12,
          windDir: 'SE',
          snow: 0,
          snowProb: 0,
          humidity: 40,
          dewPoint: 14,
          visibility: 10
        }
      }
    ]
  }
}

// Función para convertir grados a dirección del viento
const getWindDirection = (degrees: number) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

onMounted(() => {
  console.log( "fasdfasdf", lugar )
  fetchWeatherData()
})
</script>

<style scoped>
/* Transición suave para el desplegable */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Transición suave para cambios de fondo */
.absolute.inset-0 {
  transition: background-image 1s ease;
}
</style>