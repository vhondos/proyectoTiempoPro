<template>
  <!-- Contenedor donde se mostrará el mapa -->
  <div id="map"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css' // Importamos los estilos de Leaflet

// En onMounted inicializamos el mapa cuando el componente se haya montado
onMounted(() => {
  // Creamos el mapa dentro del contenedor con id="map"
  const map = L.map('map', {
    attributionControl: true // Desactiva el control de atribución de Leaflet
  }).setView([40.4168, -3.7038], 13); // Coordenadas de Madrid

  // Añadimos una capa de tiles de OpenStreetMap sin la marca de agua de Leaflet
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'hola'  // Aquí eliminamos la atribución de OpenStreetMap también
  }).addTo(map);

  // Añadimos un marcador en las coordenadas de Madrid
  L.marker([40.4168, -3.7038]).addTo(map)
    .bindPopup('<b>Madrid</b><br>Capital de España')
    .openPopup();
});
</script>

<style scoped>
#map {
  width: 100%;
  /* El mapa ocupará todo el ancho */
  height: 500px;
  /* La altura será de 500px */
}
</style>
