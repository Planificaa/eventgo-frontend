<template>
  <div class="max-w-2xl mx-auto mt-10 bg-white rounded-lg border border-gray-200 shadow-sm">
    <!-- CABECERA -->
    <div class="flex flex-col md:flex-row items-center md:items-start p-6 gap-6 border-b border-gray-200">
      <!-- FOTO -->
      <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-lg">
        Foto
      </div>

      <!-- INFORMACIÓN PRINCIPAL -->
      <div class="flex-1 w-full">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Roberto</h2>
            <p class="text-gray-600 text-sm">Eventos Musicales S.L.</p>

            <!-- ETIQUETA -->
            <span
              class="inline-block mt-2 px-3 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full"
            >
              ORGANIZADOR
            </span>

            <!-- DETALLES -->
            <div class="mt-2 text-sm text-gray-700 space-y-1">
              <p>
                <span class="font-medium">Eventos organizados:</span> 24
              </p>
              <p class="flex items-center gap-1">
                <span class="font-medium">Valoración media:</span>
                <span class="text-yellow-500 text-base leading-none">★★★★☆</span>
                <span class="text-gray-800 text-sm">(4.2)</span>
              </p>
            </div>
          </div>
<!-- BOTÓN EDITAR PERFIL  -->
<button
  @click="goToEdit"
  class="mt-1 sm:mt-0 self-start sm:self-center ml-auto px-3 py-1 bg-[#3A506B] text-white text-xs font-medium rounded-md hover:bg-[#2c3e50] transition duration-200"
>
  Editar perfil
</button>
        </div>
      </div>
    </div>

    <!-- PESTAÑAS -->
    <div class="px-6 pt-3 border-b border-gray-200 bg-gray-50">
      <div class="flex space-x-4 text-sm font-medium text-gray-600"> <!-- ESPACIADO AUMENTADO -->
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 rounded-t-md transition-all duration-200',
            activeTab === tab
              ? 'bg-white border border-b-white border-gray-300 text-[#3A506B] font-semibold'
              : 'hover:text-[#3A506B]'
          ]"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div class="p-6 text-gray-700 text-sm">
      <!-- INFORMACIÓN -->
      <div v-if="activeTab === 'Información'">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Información del perfil</h3> <!-- más separación -->
        <div class="space-y-2"> <!-- más espacio entre líneas -->
          <p><strong>Email:</strong> roberto@eventosmusicales.com</p>
          <p><strong>Teléfono:</strong> +51 962531478</p>
          <p><strong>Ubicación:</strong> Surco, Lima</p>
          <p><strong>Especialidades:</strong> Eventos musicales, Festivales, Conciertos</p>
          <p><strong>Descripción:</strong> Empresa especializada en organización de eventos musicales con más de 10 años de experiencia.</p>
        </div>
      </div>

      <!-- SERVICIOS -->
      <div v-else-if="activeTab === 'Servicios'">
        <p class="italic text-gray-500">Este organizador no ha añadido servicios aún.</p>
      </div>

      <!-- ÁLBUMES -->
      <div v-else-if="activeTab === 'Álbumes'">
        <div class="flex justify-between items-center mb-5"> <!-- más espacio abajo -->
          <h3 class="text-base font-semibold text-gray-800">Álbumes</h3>
          <button
            @click="goToCreateAlbum"
            class="px-4 py-2 bg-[#3A506B] text-white text-sm font-medium rounded-md hover:bg-[#2c3e50] transition duration-200"
          >
            Crear álbum
          </button>
        </div>

        <div v-if="albums.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="album in albums"
            :key="album.id"
            class="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition cursor-pointer"
            @click="goToAlbum(album.id)"
          >
            <img
              v-if="album.cover"
              :src="album.cover"
              alt="Portada del álbum"
              class="w-full h-40 object-cover"
            />
            <div
              v-else
              class="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 italic"
            >
              Sin imagen
            </div>
            <div class="p-3">
              <h3 class="font-semibold text-gray-800 truncate">{{ album.title }}</h3>
              <p class="text-sm text-gray-600 line-clamp-2 mt-1">
                {{ album.description || 'Sin descripción' }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-gray-500 italic mt-5">
          Este organizador no tiene álbumes todavía.
        </div>
      </div>

      <!-- RESEÑAS -->
      <div v-else-if="activeTab === 'Reseñas'">
        <p class="italic text-gray-500">No hay reseñas disponibles aún.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tabs = ['Información', 'Servicios', 'Álbumes', 'Reseñas']
const activeTab = ref('Información')
const albums = ref([])

function goToEdit() {
  router.push('/profile/edit')
}

function goToCreateAlbum() {
  router.push('/profile/albums/create')
}

function goToAlbum(id) {
  router.push(`/profile/albums/${id}`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
