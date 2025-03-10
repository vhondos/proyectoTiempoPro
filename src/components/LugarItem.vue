<template>
  <span class="text-base font-medium">{{ lugar.name }}</span>
  <button class="btn btn-outline btn-sm" @click="abrirModal(lugar.place_id)">Ver detalle</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Lugar } from '@/interfaces/lugar'

interface Props {
  lugar: Lugar
}
const { lugar } = defineProps<Props>()

const abrirModal = (id: number) =>
  (document.getElementById(`modal-${id!}`) as HTMLDialogElement).showModal()

const conseguirPageID = async () => {
  const wikipediaCodigo = lugar.extratags?.wikipedia
  if (!wikipediaCodigo) {
    console.log('no hay wikipedia código')
    return
  }

  try {
    const encodedTitle = encodeURIComponent(wikipediaCodigo.split(':').pop()!.replace(/ /g, '_'))

    const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodedTitle}&origin=*`

    const response = await fetch(url)
    const data = await response.json()

    // Obtener el `pageid`
    const pages = data.query.pages
    const pageId = Object.keys(pages)[0] // El primer `pageid`

    if (!pageId) {
      console.error('No se encontró la página en Wikipedia')
      return
    }
    console.log(pageId)
    return pageId
  } catch (error) {
    console.error('Error al obtener el pageid:', error)
    return
  }
}

const probar = async () => {
  const pageId = await conseguirPageID()
  console.log(pageId)
  if (!pageId) console.log('función probar fallida')
  if (pageId) console.log(pageId)
}

// const getWikipediaData = async (): Promise<Lugar> => {
//   const pageId = await getWikipediaPageId()
//   if (!pageId) {
//     return
//   }
//   const url = `https://es.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=info|extracts|pageimages&inprop=url&explaintext&exintro&origin=*`
//   console.log(url)
//   try {
//     const response = await fetch(url)
//     const data = await response.json()

//     const extract = data.query.pages[pageId!].extract
//     const imageUrl = data.query.pages[pageId!].thumbnail
//       ? data.query.pages[pageId!].thumbnail.source
//       : null

//     const nuevaInfo: Info = {
//       extract,
//       imageUrl,
//     }

//     return nuevaInfo
//   } catch (error) {
//     console.error('Error al obtener los datos de Wikipedia:', error)
//     return
//   }
// }

onMounted(async () => {
  console.log(lugar)
  // await conseguirPageID()
  await probar()
})
</script>
