import axios from 'axios'
import type { Lugar } from '@/interfaces/lugar'

const geocodificacion = async (consulta: string): Promise<Lugar[]> => {
  try {
    const respuesta = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(consulta)}&format=json&addressdetails=1&countrycodes=ES&limit=5&extratags=1`,
    )
    return respuesta.data
  } catch (error) {
    console.error('Error al realizar la geocodificación:', error)
    return []
  }
}

// export const geocodificacionInversa = async (lat: number, lon: number): Promise<Lugar | null> => {
//   try {
//     const respuesta = await axios.get(
//       `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&extratags=1&addressdetails=1`,
//     )
//     return respuesta.data
//   } catch (err) {
//     console.error('Error al realizar la geocodificación inversa:', err)
//     return null
//   }
// }

export default geocodificacion
