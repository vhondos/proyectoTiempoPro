<template>
  <div class="bg-gray-900 rounded-lg p-4">
    <canvas ref="chartRef" class="w-full h-[200px]"></canvas>
    <div class="flex justify-between mt-2">
      <div v-for="(icon, index) in dayNightIcons" :key="index" class="text-center">
        <Moon v-if="icon === 'moon'" class="w-4 h-4 text-gray-400" />
        <Sun v-if="icon === 'sun'" class="w-4 h-4 text-yellow-400" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Sun, Moon } from 'lucide-vue-next'

Chart.register(...registerables)

const props = defineProps<{
  hourlyData: {
    time: string[]
    temperature: number[]
  }
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const chartInitialized = ref(false)

// Generar iconos de día/noche basados en la hora
const dayNightIcons = ref<string[]>([])

const updateDayNightIcons = () => {
  if (!props.hourlyData.time.length) return
  
  dayNightIcons.value = props.hourlyData.time.map(time => {
    const hour = new Date(time).getHours()
    return (hour >= 6 && hour < 20) ? 'sun' : 'moon'
  })
}

const calculateYAxisRange = (temperatures: number[]) => {
  if (!temperatures.length) return { min: 0, max: 10 }
  
  const min = Math.min(...temperatures)
  const max = Math.max(...temperatures)
  const padding = 2
  
  return {
    min: Math.floor(min - padding),
    max: Math.ceil(max + padding)
  }
}

const createChart = async () => {
  // Esperar a que el DOM se actualice
  await nextTick()
  
  if (!chartRef.value) return
  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Destruir el gráfico existente si hay uno
  if (chart) {
    chart.destroy()
  }

  // Verificar que tenemos datos válidos
  if (!props.hourlyData.temperature.length) return

  // Calcular el rango del eje Y
  const yAxisRange = calculateYAxisRange(props.hourlyData.temperature)

  // Crear gradiente para el área
  const gradient = ctx.createLinearGradient(0, 0, 0, 200)
  gradient.addColorStop(0, 'rgba(234, 179, 8, 0.3)')
  gradient.addColorStop(1, 'rgba(234, 179, 8, 0)')

  // Formatear las etiquetas de hora
  const labels = props.hourlyData.time.map(time => {
    const date = new Date(time)
    return date.getHours() + 'h'
  })

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperatura',
          data: props.hourlyData.temperature,
          borderColor: '#eab308',
          backgroundColor: gradient,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#eab308',
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => `${item.formattedValue}°C`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 10
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(156, 163, 175, 0.1)',
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 10
            },
            callback: (value) => `${value}°`,
            stepSize: 1
          },
          min: yAxisRange.min,
          max: yAxisRange.max,
          beginAtZero: false
        }
      }
    }
  })
  
  chartInitialized.value = true
}

// Observar cambios en los datos solo para la inicialización inicial
watch(() => props.hourlyData, (newData) => {
  if (!chartInitialized.value && newData.temperature.length > 0) {
    updateDayNightIcons()
    createChart()
  }
}, { immediate: true, deep: true })

// Limpiar el gráfico cuando el componente se desmonte
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})

// Inicializar el gráfico después de que el componente esté montado
onMounted(async () => {
  // Si ya tenemos datos, crear el gráfico
  if (props.hourlyData.temperature.length > 0) {
    updateDayNightIcons()
    // Esperar un poco para asegurar que el canvas esté listo
    setTimeout(() => {
      createChart()
    }, 100)
  }
})

// Método público para actualizar manualmente el gráfico
defineExpose({
  updateChart: createChart
})
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 200px !important;
}
</style>