<template>
  <div class="min-h-screen bg-gray-900 text-white p-4">
    <div class="max-w-2xl mx-auto bg-gray-800/90 backdrop-blur-lg rounded-3xl p-6">
      <!-- Header with close button -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <component :is="currentMetricIcon" class="w-5 h-5 mr-2" />
          <span class="text-lg">{{ selectedMetric }}</span>
        </div>
        <button class="text-gray-400 hover:text-white">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Days selector -->
      <div class="flex justify-between mb-4">
        <div v-for="(day, index) in weekDays" :key="index" 
             class="flex flex-col items-center">
          <span class="text-sm text-gray-400">{{ day.letter }}</span>
          <button 
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center mt-1',
              selectedDay === day.number ? 'bg-white text-gray-900' : 'text-white hover:bg-gray-700'
            ]"
            @click="selectDay(day.number)"
          >
            {{ day.number }}
          </button>
        </div>
      </div>

      <!-- Selected date -->
      <div class="text-center mb-6 text-gray-400">
        {{ formatDate(selectedDate) }}
      </div>

      <!-- Current metric display -->
      <div class="flex items-end mb-8">
        <div class="text-6xl font-light">{{ currentValue }}</div>
        <div class="text-3xl text-gray-500 ml-2 mb-2">{{ minValue }}</div>
        <div class="ml-2 mb-2">
          <component :is="currentIcon" class="w-8 h-8" :class="currentIconColor" />
        </div>
      </div>

      <!-- Chart -->
      <div class="h-48 mb-6">
        <canvas ref="chartRef"></canvas>
      </div>

      <!-- Daily summary -->
      <div class="text-gray-400 text-sm mb-6">
        <h3 class="text-white text-lg mb-2">Resumen diario</h3>
        <p>{{ currentSummary }}</p>
      </div>

      <!-- Additional info cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="(info, index) in additionalInfo" 
             :key="index"
             class="bg-gray-700/50 rounded-xl p-4">
          <div class="flex items-center mb-2">
            <component :is="info.icon" class="w-4 h-4 mr-2" />
            <span class="text-sm">{{ info.label }}</span>
          </div>
          <div class="text-xl">{{ info.value }}</div>
          <div class="text-xs text-gray-400">{{ info.description }}</div>
        </div>
      </div>

      <!-- Metrics selector (bottom) -->
      <div class="relative mt-auto">
        <button 
          @click="showMetrics = !showMetrics"
          class="flex items-center justify-between w-full px-4 py-3 bg-gray-700/50 backdrop-blur rounded-xl"
        >
          <div class="flex items-center">
            <component :is="currentMetricIcon" class="w-5 h-5 mr-2" />
            <span>{{ selectedMetric }}</span>
          </div>
          <ChevronDown :class="{'rotate-180': showMetrics}" class="w-5 h-5 transition-transform" />
        </button>

        <!-- Metrics dropdown -->
        <div v-if="showMetrics" 
             class="absolute bottom-full mb-2 w-full bg-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div v-for="metric in metrics" :key="metric.name"
               @click="selectMetric(metric.name)"
               class="flex items-center px-4 py-3 hover:bg-gray-600 cursor-pointer">
            <component :is="metric.icon" class="w-5 h-5 mr-2" />
            <span>{{ metric.name }}</span>
            <Check v-if="metric.name === selectedMetric" class="w-5 h-5 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Thermometer, X, Sun, ChevronDown, Check, 
  Wind, Droplet, Eye, Info, CloudRain, Gauge
} from 'lucide-vue-next'
import Chart from 'chart.js/auto'

// Estado
const selectedDay = ref(14)
const selectedDate = ref(new Date(2022, 5, 12))
const showMetrics = ref(false)
const selectedMetric = ref('Temperatura')
const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// Datos del tiempo (simulados - reemplazar con datos de la API)
const weatherData = ref({
  temperature: { current: 37, min: 19, max: 37, hourly: [22, 19, 25, 37, 28] },
  humidity: { current: 45, min: 30, max: 60, hourly: [50, 55, 40, 35, 45] },
  wind: { current: 21, direction: 'NE', hourly: [15, 18, 21, 25, 20] },
  uv: { current: 9, max: 11, hourly: [0, 2, 7, 9, 4] },
  precipitation: { probability: 0, amount: 0, hourly: [0, 0, 0, 0, 0] },
  pressure: { current: 1013, trend: 'Estable', hourly: [1012, 1013, 1013, 1014, 1013] }
})

// Configuración de métricas
const metrics = [
  { name: 'Temperatura', icon: Thermometer, unit: '°', color: 'text-red-500' },
  { name: 'Índice UV', icon: Sun, unit: '', color: 'text-yellow-500' },
  { name: 'Viento', icon: Wind, unit: 'km/h', color: 'text-blue-500' },
  { name: 'Precipitaciones', icon: CloudRain, unit: 'mm', color: 'text-blue-400' },
  { name: 'Humedad', icon: Droplet, unit: '%', color: 'text-blue-300' },
  { name: 'Visibilidad', icon: Eye, unit: 'km', color: 'text-gray-400' },
  { name: 'Presión', icon: Gauge, unit: 'hPa', color: 'text-purple-400' }
]

// Días de la semana
const weekDays = [
  { letter: 'V', number: 10 },
  { letter: 'S', number: 11 },
  { letter: 'D', number: 12 },
  { letter: 'L', number: 13 },
  { letter: 'M', number: 14 },
  { letter: 'X', number: 15 },
  { letter: 'J', number: 16 },
  { letter: 'V', number: 17 }
]

// Computed properties
const currentMetricIcon = computed(() => {
  return metrics.find(m => m.name === selectedMetric)?.icon
})

const currentIcon = computed(() => {
  switch(selectedMetric) {
    case 'Temperatura': return weatherData.value.temperature.current > 30 ? Sun : Thermometer
    case 'Índice UV': return Sun
    case 'Viento': return Wind
    case 'Precipitaciones': return CloudRain
    case 'Humedad': return Droplet
    case 'Visibilidad': return Eye
    case 'Presión': return Gauge
    default: return Thermometer
  }
})

const currentIconColor = computed(() => {
  return metrics.find(m => m.name === selectedMetric)?.color || 'text-white'
})

const currentValue = computed(() => {
  switch(selectedMetric) {
    case 'Temperatura': return `${weatherData.value.temperature.current}°`
    case 'Índice UV': return weatherData.value.uv.current
    case 'Viento': return `${weatherData.value.wind.current}`
    case 'Precipitaciones': return `${weatherData.value.precipitation.amount}`
    case 'Humedad': return `${weatherData.value.humidity.current}%`
    case 'Visibilidad': return '10'
    case 'Presión': return weatherData.value.pressure.current
    default: return ''
  }
})

const minValue = computed(() => {
  switch(selectedMetric) {
    case 'Temperatura': return weatherData.value.temperature.min
    case 'Humedad': return `${weatherData.value.humidity.min}%`
    default: return ''
  }
})

const currentSummary = computed(() => {
  switch(selectedMetric) {
    case 'Temperatura':
      return `El ${selectedDate.value.toLocaleDateString('es-ES', { weekday: 'long' })} 
              se alcanzará una mínima de ${weatherData.value.temperature.min}° entre las 6:58 y las 7:58, 
              y una máxima de ${weatherData.value.temperature.max}° entre las 18:30 y las 19:30.`
    case 'Humedad':
      return `Humedad relativa entre ${weatherData.value.humidity.min}% y ${weatherData.value.humidity.max}%.`
    default:
      return 'Información no disponible'
  }
})

const additionalInfo = computed(() => {
  switch(selectedMetric) {
    case 'Temperatura':
      return [
        { label: 'Sensación', value: `${weatherData.value.temperature.current + 2}°`, icon: Thermometer, description: 'Sensación térmica' },
        { label: 'Humedad', value: `${weatherData.value.humidity.current}%`, icon: Droplet, description: 'Humedad relativa' },
        { label: 'Viento', value: `${weatherData.value.wind.current} km/h`, icon: Wind, description: weatherData.value.wind.direction },
        { label: 'UV', value: weatherData.value.uv.current, icon: Sun, description: 'Índice UV' }
      ]
    case 'Humedad':
      return [
        { label: 'Punto rocío', value: '18°', icon: Droplet, description: 'Punto de rocío' },
        { label: 'Temperatura', value: `${weatherData.value.temperature.current}°`, icon: Thermometer, description: 'Temperatura actual' },
        { label: 'Presión', value: `${weatherData.value.pressure.current}`, icon: Gauge, description: 'hPa' },
        { label: 'Tendencia', value: 'Estable', icon: Info, description: 'Sin cambios significativos' }
      ]
    default:
      return []
  }
})

// Métodos
const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const selectMetric = (metric: string) => {
  selectedMetric.value = metric
  showMetrics.value = false
  updateChart()
}

const selectDay = async (day: number) => {
  selectedDay.value = day
  // Aquí iría la llamada a la API para obtener los datos del día seleccionado
  await fetchWeatherData(day)
}

// Función para obtener datos de la API
const fetchWeatherData = async (day: number) => {
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
    
    updateChart()
  } catch (error) {
    console.error('Error fetching weather data:', error)
  }
}

// Actualización del gráfico
const updateChart = () => {
  if (chart) {
    chart.destroy()
  }

  if (chartRef.value) {
    const ctx = chartRef.value.getContext('2d')
    if (ctx) {
      let data: number[] = []
      let color = ''
      
      switch(selectedMetric.value) {
        case 'Temperatura':
          data = weatherData.value.temperature.hourly
          color = '#ef4444'
          break
        case 'Humedad':
          data = weatherData.value.humidity.hourly
          color = '#60a5fa'
          break
        // ... otros casos
      }

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['0h', '6h', '12h', '18h', '24h'],
          datasets: [{
            label: selectedMetric.value,
            data: data,
            borderColor: color,
            backgroundColor: `${color}33`,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }
          }
        }
      })
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchWeatherData(selectedDay.value)
})

watch(selectedMetric, () => {
  updateChart()
})
</script>

<style>
/* Asegúrate de tener Tailwind CSS configurado en tu proyecto */
</style>