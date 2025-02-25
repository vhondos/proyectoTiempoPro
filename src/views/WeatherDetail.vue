<template>
    <div class="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 text-white p-4">
      <!-- Main Weather Display -->
      <div class="max-w-md mx-auto bg-sky-500/30 backdrop-blur-lg rounded-3xl p-6 mb-6">
        <div class="text-center">
          <h1 class="text-2xl font-light mb-1">{{ location }}</h1>
          <div class="text-6xl font-light mb-2">{{ currentTemp }}°</div>
          <div class="text-xl mb-4">{{ currentCondition }}</div>
          <div class="text-sm">
            Máx. {{ maxTemp }}° Min. {{ minTemp }}°
          </div>
        </div>
  
        <!-- Hourly Forecast -->
        <div class="mt-6">
          <div class="flex justify-between space-x-4 overflow-x-auto py-4">
            <div v-for="hour in hourlyForecast" :key="hour.time" class="flex flex-col items-center min-w-[60px]">
              <span class="text-sm">{{ hour.time }}</span>
              <icon-component :name="hour.icon" class="my-2 w-6 h-6" />
              <span class="text-lg">{{ hour.temp }}°</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Weather Details Grid -->
      <div class="max-w-md mx-auto grid grid-cols-2 gap-4">
        <!-- UV Index -->
        <div class="bg-sky-500/30 backdrop-blur-lg rounded-2xl p-4">
          <div class="flex items-center mb-2">
            <sun-icon class="w-5 h-5 mr-2" />
            <span>ÍNDICE UV</span>
          </div>
          <div class="text-3xl font-light">{{ uvIndex }}</div>
          <div class="text-sm">{{ uvDescription }}</div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div :style="`width: ${uvIndex * 10}%`" class="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-2 rounded-full"></div>
          </div>
        </div>
  
        <!-- Wind -->
        <div class="bg-sky-500/30 backdrop-blur-lg rounded-2xl p-4">
          <div class="flex items-center mb-2">
            <wind-icon class="w-5 h-5 mr-2" />
            <span>VIENTO</span>
          </div>
          <div class="text-3xl font-light">{{ windSpeed }} km/h</div>
          <div class="text-sm">{{ windDirection }}</div>
        </div>
  
        <!-- Humidity -->
        <div class="bg-sky-500/30 backdrop-blur-lg rounded-2xl p-4">
          <div class="flex items-center mb-2">
            <droplet-icon class="w-5 h-5 mr-2" />
            <span>HUMEDAD</span>
          </div>
          <div class="text-3xl font-light">{{ humidity }}%</div>
          <div class="text-sm">Punto de rocío: {{ dewPoint }}°</div>
        </div>
  
        <!-- Precipitation -->
        <div class="bg-sky-500/30 backdrop-blur-lg rounded-2xl p-4">
          <div class="flex items-center mb-2">
            <cloud-rain-icon class="w-5 h-5 mr-2" />
            <span>PRECIPITACIÓN</span>
          </div>
          <div class="text-3xl font-light">{{ precipitation }} mm</div>
          <div class="text-sm">Prob. {{ precipitationProbability }}%</div>
        </div>
      </div>
  
      <!-- Weekly Forecast -->
      <div class="max-w-md mx-auto mt-4 bg-sky-500/30 backdrop-blur-lg rounded-2xl p-4">
        <h2 class="text-lg mb-4">Previsión 7 días</h2>
        <div class="space-y-3">
          <div v-for="day in weeklyForecast" :key="day.date" 
               class="flex items-center justify-between">
            <span class="w-20">{{ day.day }}</span>
            <icon-component :name="day.icon" class="w-6 h-6" />
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-200">{{ day.minTemp }}°</span>
              <div class="w-20 h-1 bg-sky-200/30 rounded-full">
                <div class="h-1 bg-white rounded-full" 
                     :style="`width: ${(day.maxTemp - day.minTemp) * 5}%`"></div>
              </div>
              <span>{{ day.maxTemp }}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { SunIcon, WindIcon, DropletIcon, CloudRainIcon } from 'lucide-vue-next'
  
  interface HourlyForecast {
    time: string
    temp: number
    icon: string
  }
  
  interface DailyForecast {
    day: string
    date: string
    minTemp: number
    maxTemp: number
    icon: string
  }
  
  const location = ref('Madrid')
  const currentTemp = ref(28)
  const currentCondition = ref('Mayormente soleado')
  const maxTemp = ref(32)
  const minTemp = ref(19)
  const uvIndex = ref(9)
  const uvDescription = ref('Muy alto')
  const windSpeed = ref(21)
  const windDirection = ref('NE')
  const humidity = ref(45)
  const dewPoint = ref(19)
  const precipitation = ref(0)
  const precipitationProbability = ref(0)
  
  const hourlyForecast = ref<HourlyForecast[]>([])
  const weeklyForecast = ref<DailyForecast[]>([])
  
  const fetchWeatherData = async () => {
    try {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: 40.4165,
          longitude: -3.7026,
          hourly: 'temperature_2m,precipitation_probability,weathercode',
          daily: 'temperature_2m_max,temperature_2m_min,weathercode',
          timezone: 'auto'
        }
      })
  
      // Process the data here
      // This is a simplified example - you would need to process the actual API response
      hourlyForecast.value = [
        { time: '14:00', temp: 28, icon: 'sun' },
        { time: '15:00', temp: 29, icon: 'sun' },
        { time: '16:00', temp: 30, icon: 'sun' },
        { time: '17:00', temp: 31, icon: 'sun' },
        { time: '18:00', temp: 32, icon: 'sun' },
      ]
  
      weeklyForecast.value = [
        { day: 'Hoy', date: '2024-02-25', minTemp: 19, maxTemp: 32, icon: 'sun' },
        { day: 'Mié', date: '2024-02-26', minTemp: 18, maxTemp: 31, icon: 'cloud-sun' },
        { day: 'Jue', date: '2024-02-27', minTemp: 19, maxTemp: 30, icon: 'cloud' },
        { day: 'Vie', date: '2024-02-28', minTemp: 20, maxTemp: 32, icon: 'cloud' },
        { day: 'Sáb', date: '2024-02-29', minTemp: 20, maxTemp: 36, icon: 'sun' },
      ]
    } catch (error) {
      console.error('Error fetching weather data:', error)
    }
  }
  
  onMounted(() => {
    fetchWeatherData()
  })
  </script>
  
  <style scoped>

  </style>