// stores/location.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Lugar } from '@/interfaces/lugar'

export const useLocationStore = defineStore(
  'location',
  () => {
    const lugar = ref<Lugar | null>(null)

    function updateLocation(lugarObj: Lugar) {
      lugar.value = lugarObj
    }

    return { lugar, updateLocation }
  },
  {
    persist: {
      strategies: [
        {
          key: 'location-store', // (opcional) clave única para el almacenamiento
          storage: localStorage,
          paths: ['lugar']
        }
      ]
    } as any
  }
)
