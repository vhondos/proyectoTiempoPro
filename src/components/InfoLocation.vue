<template>
    <div class="weather-card bg-gradient-to-b from-sky-400 to-sky-600 rounded-3xl p-6 text-white">
      <div class="text-center">
        <h2 class="text-lg font-light mb-1">{{ location }}</h2>
        <!-- <div class="text-xl font-medium uppercase mb-4">{{  }}</div> -->
        
        <div class="temperature text-7xl font-light mb-2">
          {{ temperature }}°
        </div>
        
        <div class="condition text-lg mb-3">
          {{ condition }}
        </div>
        
        <div class="min-max text-sm">
          Máx. {{ maxTemp }}° Min. {{ minTemp }}°
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
import { onMounted } from 'vue'

  interface Props {
    location: string
    temperature: string
    condition: string
    maxTemp: string
    minTemp: string
  }
  
  // Definición de props con valores por defecto y validación
  const props = withDefaults(defineProps<Props>(), {})
  
  // Validación adicional de props
  const validateProps = () => {
    if (+props.temperature < -100 || +props.temperature > 100) {
      console.warn('Temperature should be between -100 and 100')
    }
    if (+props.maxTemp < +props.minTemp) {
      console.warn('Maximum temperature should be greater than minimum temperature')
    }
  }
  
  // Ejecutar validación cuando el componente se monta
  onMounted(() => {
    validateProps()
  })
  </script>
  
  <style scoped>
  .weather-card {
    min-width: 250px;
    max-width: 400px;
    backdrop-filter: blur(8px);
  }
  
  /* Animación suave al cambiar los valores */
  .temperature {
    transition: all 0.3s ease;
  }
  </style>

      <!-- <InfoLocation condition="Mayormente soleado" location="Madrid" max-temp="23" min-temp="13" temperature="23"/> -->
