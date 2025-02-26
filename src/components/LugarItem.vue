<template>
  <span class="text-base font-medium">{{ lugar.name }}</span>
  <button class="btn btn-outline btn-sm" @click="abrirModal(lugar.place_id)">Ver detalle</button>
  <dialog :id="`modal-${lugar.place_id}`" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>

      <h3 class="text-xl font-bold text-primary mb-3">
        {{ lugar.display_name }}
      </h3>

      <div class="tabs tabs-border">
        <input type="radio" name="my_tabs_2" class="tab" aria-label="Información" checked />
        <div class="tab-content border-base-300 bg-base-100 p-10">
          {{ info && info.extract.length > 300 ? info.extract.substring(0, 300) + '...' : info }}
          <div class="flex justify-center">
            <img :src="info?.imageUrl" alt="imagen" class="w-full max-w-xs rounded-lg" />
          </div>
        </div>

        <input type="radio" name="my_tabs_2" class="tab" aria-label="Detalles" />
        <div class="tab-content border-base-300 bg-base-100 p-10">
          <p>nombre: {{ lugar.name }}</p>
          <p>país: {{ lugar.address.country }}</p>
          <p>región: {{ lugar.address.state }}</p>
          <p>latitud: {{ lugar.lat }}</p>
          <p>longitud: {{ lugar.lon }}</p>
          <p v-if="lugar.extratags?.population">población: {{ lugar.extratags?.population }}</p>
        </div>

        <input type="radio" name="my_tabs_2" class="tab" aria-label="Avisos" />
        <div class="tab-content border-base-300 bg-base-100 p-10">Tab content 3</div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Lugar } from '@/interfaces/lugar'
// import type { PageID } from '@/interfaces/pageId'
interface Props {
  lugar: Lugar
}
const { lugar } = defineProps<Props>()
interface Info {
  extract: string
  imageUrl: string
}

const info = ref<Info | null>(null)
const abrirModal = (id: number) => {
  ;(document.getElementById(`modal-${id!}`) as HTMLDialogElement).showModal()
}

const getWikipediaPageId = async () => {
  try {
    const encodedTitle = encodeURIComponent(
      lugar.extratags!.wikipedia.split(':').pop()!.replace(/ /g, '_'),
    )

    // Consulta a la API de Wikipedia para obtener el `pageid`
    const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodedTitle}&origin=*`

    const response = await fetch(url)
    const data = await response.json()

    // Obtener el `pageid`
    const pages = data.query.pages
    const pageId = Object.keys(pages)[0] // El primer `pageid`

    if (pageId === '-1') {
      console.error('No se encontró la página en Wikipedia')
      return null
    }
    console.log(pageId)
    return pageId
  } catch (error) {
    console.error('Error al obtener el pageid:', error)
    return null
  }
}

const getWikipediaData = async () => {
  const pageId = await getWikipediaPageId()
  const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=info|extracts|pageimages&inprop=url&explaintext&exintro&origin=*`
  console.log(url)
  try {
    const response = await fetch(url)
    const data = await response.json()

    const extract = data.query.pages[pageId!].extract
    const imageUrl = data.query.pages[pageId!].thumbnail
      ? data.query.pages[pageId!].thumbnail.source
      : null

    const nuevaInfo: Info = {
      extract,
      imageUrl,
    }

    return nuevaInfo
  } catch (error) {
    console.error('Error al obtener los datos de Wikipedia:', error)
    return null
  }
}

onMounted(async () => {
  info.value = await getWikipediaData()
})
</script>
