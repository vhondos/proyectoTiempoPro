<template>
  <div class="grid grid-cols-1 md:grid-cols-3 h-screen">
    <!-- Columna 1: Formulario de búsqueda -->
    <div class="p-4 h-full flex flex-col">
      <div class="form-control h-full">
        <input
          type="text"
          placeholder="Buscar..."
          class="input input-bordered w-full mb-2"
          v-model="inputBuscador"
        />
        <transition
          enter-active-class="transition duration-200 ease-out transform"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in transform"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <ul v-if="sugerencias.length" class="list bg-primary rounded-box shadow-md">
            <li
              v-for="(sugerencia, index) in sugerencias"
              :key="index"
              class="list-row text-primary-content hover:text-error"
              @click="seleccionarSugerencia(sugerencia)"
            >
              {{ sugerencia.display_name }}
            </li>
          </ul>
        </transition>

        <ul
          v-if="lugaresGuardados.length !== 0"
          class="list bg-base-100 rounded-lg p-4 w-full mt-5"
        >
          <li class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Lugares guardados
          </li>
          <li
            class="flex justify-between items-center p-1.5 rounded-lg cursor-pointer hover:bg-base-200"
            v-for="(lugar, index) in lugaresGuardados"
            :key="index"
            @click="cambiarLugar(lugar)"
          >
            <LugarItem :lugar="lugar" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Columna 2: Mapa -->
    <div class="col-span-2 h-full">
      <div id="map" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet-control-geocoder'
import type { Lugar } from './interfaces/lugar'
import LugarItem from './components/LugarItem.vue'

const inputBuscador = ref('')
const sugerencias = ref<Lugar[]>([])
const lugaresGuardados = ref<Lugar[]>([])
const map = ref<L.Map | null>(null)
const marker = ref<L.Marker | null>(null)
let timeoutId: ReturnType<typeof setTimeout> | null = null

watch(inputBuscador, async (nuevoValor) => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(async () => {
    if (!nuevoValor) {
      sugerencias.value = []
      return
    }
    try {
      const consulta = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputBuscador.value)}&format=json&addressdetails=1&countrycodes=ES&limit=5&extratags=1`
      console.log(consulta)
      const response = await fetch(consulta)
      const data = await response.json()
      sugerencias.value = data
    } catch (error) {
      console.error('Error al obtener sugerencias:', error)
    }
  }, 700)
})

const seleccionarSugerencia = (sugerencia: Lugar) => {
  if (sugerencia && sugerencia.lat && sugerencia.lon) {
    cambiarLugar(sugerencia)
    inputBuscador.value = ''
    sugerencias.value = []

    if (!lugaresGuardados.value.includes(sugerencia)) {
      lugaresGuardados.value.unshift(sugerencia)
    }
  }
}

const cambiarLugar = (sugerencia: Lugar) => {
  const latLng: L.LatLngExpression = [parseFloat(sugerencia.lat), parseFloat(sugerencia.lon)]
  if (marker.value) {
    marker.value.setLatLng(latLng).bindPopup(`<b>${sugerencia.display_name}</b>`).openPopup()
  } else {
    marker.value = L.marker(latLng)
      .addTo(map.value as L.Map)
      .bindPopup(`<b>${sugerencia.display_name}</b>`)
      .openPopup()
  }
  map.value!.setView(latLng, 13)
}

onMounted(() => {
  map.value = L.map('map').setView([40.4168, -3.7038], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap',
  }).addTo(map.value as L.Map)
})
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
