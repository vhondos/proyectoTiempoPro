<template>
  <dialog v-if="lugar" class="modal" id="modal">
    <div class="modal-box w-[800px] h-[600px] flex flex-col">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>

      <h3 class="text-xl font-bold text-primary mb-3 flex-none">
        {{ lugar.display_name }}
      </h3>

      <div class="tabs tabs-border flex-grow overflow-hidden">
        <input type="radio" name="my_tabs_2" class="tab" aria-label="Información" checked />
        <div class="tab-content border-base-300 bg-base-100 p-10 h-full overflow-y-auto">
          <div v-if="error" class="text-center text-error">{{ error }}</div>
          <div v-else>
            <img v-if="urlImagen" :src="urlImagen" :alt="lugar.display_name" class="mb-4 mx-auto" />
            <p>{{ extracto }}</p>
          </div>
        </div>

        <input type="radio" name="my_tabs_2" class="tab" aria-label="Detalles" />
        <div class="tab-content border-base-300 bg-base-100 p-10 h-full overflow-y-auto">
          <p class="mb-2"><span class="font-semibold">Nombre:</span> {{ lugar.name }}</p>
          <p class="mb-2"><span class="font-semibold">País:</span> {{ lugar.address.country }}</p>
          <p class="mb-2"><span class="font-semibold">Región:</span> {{ lugar.address.state }}</p>
          <p class="mb-2"><span class="font-semibold">Latitud:</span> {{ lugar.lat }}</p>
          <p class="mb-2"><span class="font-semibold">Longitud:</span> {{ lugar.lon }}</p>
          <p v-if="lugar.extratags?.population" class="mb-2">
            <span class="font-semibold">Población:</span>
            {{ lugar.extratags.population }} habitantes
          </p>
        </div>

        <input type="radio" name="my_tabs_2" class="tab" aria-label="Avisos" />
        <div class="tab-content border-base-300 bg-base-100 p-10 h-full overflow-y-auto">
          tab content 3
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Lugar } from '@/interfaces/lugar'
import axios from 'axios'

const props = defineProps<{ lugar: Lugar | null }>()

const extracto = ref<string | null>(null)
const urlImagen = ref<string | null>(null)
const error = ref<string | null>(null)

const conseguirPageID = async () => {
  const wikipediaCodigo = props.lugar?.extratags?.wikipedia
  if (!wikipediaCodigo) return null

  try {
    const encodedTitle = encodeURIComponent(wikipediaCodigo.split(':').pop()!.replace(/ /g, '_'))
    const respuesta = await axios.get(
      `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodedTitle}&origin=*`,
    )
    const pages = respuesta.data.query.pages
    const pageId = Object.keys(pages)[0]
    return pageId !== '-1' ? pageId : null
  } catch (err) {
    console.error('Error al obtener el pageId:', err)
    return null
  }
}

const conseguirInformacion = async () => {
  const pageId = await conseguirPageID()
  if (!pageId) {
    error.value = 'No se encontró información en Wikipedia.'
    return
  }

  try {
    const respuesta = await axios.get(
      `https://es.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=extracts|pageimages&exintro&explaintext&origin=*`,
    )
    const pagina = respuesta.data.query.pages[pageId]
    extracto.value = pagina.extract || null
    urlImagen.value = pagina.thumbnail?.source || null
  } catch (err) {
    console.error('Error al obtener los datos de Wikipedia:', err)
    error.value = 'Hubo un problema al obtener la información de Wikipedia.'
  }
}

watch(
  () => props.lugar,
  (nuevoLugar) => {
    if (nuevoLugar) {
      extracto.value = null
      urlImagen.value = null
      error.value = null
      conseguirInformacion()
    }
  },
  { immediate: true },
)
</script>
