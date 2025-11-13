<template>
  <div class="profile-container">
    <div v-if="isProfileLoading" class="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
      Cargando información del perfil...
    </div>
    <div v-if="profileError" class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ profileError }}
    </div>
    <!-- Header con información del perfil -->
    <div class="profile-header">
      <div class="grid grid-nogutter">
        <!-- Avatar y información básica -->
        <div class="col-12 md:col-4 lg:col-3 mb-4 md:mb-0">
          <div class="profile-avatar-section">
            <Avatar
              :image="profileData.profileImage"
              :label="getInitials(profileData.name)"
              size="xlarge"
              shape="circle"
              class="mb-3"
            />
            <h2 class="text-2xl font-bold text-gray-800">{{ profileData.name }}</h2>
            <p class="text-gray-600 text-sm">{{ profileData.email }}</p>
            <span class="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {{ getRoleLabel(profileData.role) }}
            </span>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="col-12 md:col-8 lg:col-9">
          <div class="grid grid-nogutter gap-3">
            <div class="col-6 md:col-3">
              <div class="stat-card">
                <div class="stat-value">{{ profileData.metrics.eventsOrganized ?? 0 }}</div>
                <div class="stat-label">Eventos Organizados</div>
              </div>
            </div>
            <div class="col-6 md:col-3">
              <div class="stat-card">
                <div class="stat-value">{{ profileData.metrics.rating ?? 0 }}</div>
                <div class="stat-label">Calificación</div>
              </div>
            </div>
            <div class="col-6 md:col-3">
              <div class="stat-card">
                <div class="stat-value">{{ profileData.metrics.customers ?? 0 }}</div>
                <div class="stat-label">Clientes</div>
              </div>
            </div>
            <div class="col-6 md:col-3">
              <div class="stat-card">
                <div class="stat-value">{{ profileData.metrics.experienceYears ?? 0 }}</div>
                <div class="stat-label">Años Exp.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-wrap gap-2 mt-4">
        <Button
          label="Editar Perfil"
          icon="pi pi-pencil"
          @click="goToEdit"
          class="p-button-primary"
        />
        <Button
          label="Configuración"
          icon="pi pi-cog"
          @click="goToSettings"
          class="p-button-secondary"
        />
        <Button
          label="Descargar CV"
          icon="pi pi-download"
          class="p-button-secondary"
        />
        <Button
          label="Cerrar Sesión"
          icon="pi pi-sign-out"
          @click="handleLogout"
          class="p-button-danger p-button-outlined"
        />
      </div>
    </div>

    <!-- Tabs de contenido -->
    <div class="profile-content mt-6">
      <TabView v-model:activeIndex="activeTab" class="profile-tabs">
        <!-- Tab: Información -->
        <TabPanel header="Información" leftIcon="pi pi-info-circle">
          <div class="p-4">
            <div class="grid grid-nogutter gap-4">
              <div class="col-12 md:col-6">
                <div class="info-section">
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">Información Personal</h3>
                  <div class="space-y-3">
                    <div class="info-item">
                      <span class="label">Nombre:</span>
                      <span class="value">{{ profileData.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Email:</span>
                      <span class="value">{{ profileData.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Teléfono:</span>
                      <span class="value">{{ profileData.phone || 'No especificado' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Ciudad:</span>
                      <span class="value">{{ profileData.city || 'No especificado' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="info-section">
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                  <p class="text-gray-700 text-sm leading-relaxed">
                    {{ profileData.description || 'Sin descripción disponible' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Redes sociales -->
            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Redes Sociales</h3>
              <div class="flex flex-wrap gap-3">
                <Button
                  v-for="social in socialLinks"
                  :key="social.type"
                  :label="social.type"
                  :icon="`pi pi-${getSocialIcon(social.type)}`"
                  class="p-button-secondary p-button-sm"
                  @click="openSocialLink(social.url)"
                />
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Tab: Servicios -->
        <TabPanel header="Servicios" leftIcon="pi pi-briefcase">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Servicios Ofrecidos</h3>
              <Button
                label="Agregar Servicio"
                icon="pi pi-plus"
                class="p-button-primary p-button-sm"
              />
            </div>

            <div v-if="services.length" class="grid grid-nogutter gap-4">
              <div v-for="service in services" :key="service.id" class="col-12 md:col-6 lg:col-4">
                <Card class="service-card">
                  <template #header>
                    <div class="service-icon">
                      <i :class="`pi pi-${service.icon}`"></i>
                    </div>
                  </template>
                  <template #title>{{ service.name }}</template>
                  <template #content>
                    <p class="text-sm text-gray-600 mb-2">{{ service.description }}</p>
                    <div class="flex justify-between items-center">
                      <span class="font-semibold text-blue-600">S/. {{ service.price }}</span>
                      <Button
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-danger p-button-text p-button-sm"
                      />
                    </div>
                  </template>
                </Card>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500">No has agregado servicios aún</p>
            </div>
          </div>
        </TabPanel>

        <!-- Tab: Álbumes -->
        <TabPanel header="Álbumes" leftIcon="pi pi-images">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Mis Álbumes</h3>
              <Button
                label="Crear Álbum"
                icon="pi pi-plus"
                class="p-button-primary p-button-sm"
                @click="goToCreateAlbum"
              />
            </div>

            <div v-if="albums.length" class="grid grid-nogutter gap-4">
              <div v-for="album in albums" :key="album.id" class="col-12 sm:col-6 md:col-4 lg:col-3">
                <Card class="album-card cursor-pointer hover:shadow-lg transition-shadow" @click="goToAlbum(album.id)">
                  <template #header>
                    <img
                      v-if="album.cover"
                      :src="album.cover"
                      :alt="album.title"
                      class="w-full h-40 object-cover"
                    />
                    <div v-else class="w-full h-40 bg-gray-200 flex items-center justify-center">
                      <i class="pi pi-image text-gray-400 text-2xl"></i>
                    </div>
                  </template>
                  <template #title>{{ album.title }}</template>
                  <template #content>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ album.description }}</p>
                    <small class="text-gray-500">{{ album.photos?.length || 0 }} fotos</small>
                  </template>
                </Card>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500">No tienes álbumes aún</p>
            </div>
          </div>
        </TabPanel>

        <!-- Tab: Reseñas -->
        <TabPanel header="Reseñas" leftIcon="pi pi-star">
          <div class="p-4">
            <div v-if="reviews.length" class="space-y-4">
              <div v-for="review in reviews" :key="review.id" class="review-card">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <Avatar :image="review.authorImage" size="small" shape="circle" />
                    <div>
                      <p class="font-semibold text-gray-800">{{ review.author }}</p>
                      <small class="text-gray-500">{{ formatDate(review.date) }}</small>
                    </div>
                  </div>
                  <Rating v-model="review.rating" :readonly="true" />
                </div>
                <p class="text-gray-700 text-sm">{{ review.comment }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500">No hay reseñas aún</p>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { AuthApiService } from '@/auth-management/application/auth-api.service.js';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import Rating from 'primevue/rating';

const router = useRouter();
const { logout, user } = useAuth();
const activeTab = ref(0);

const defaultMetrics = Object.freeze({
  eventsOrganized: 0,
  rating: 0,
  customers: 0,
  experienceYears: 0,
});

const defaultProfile = Object.freeze({
  id: '',
  name: '',
  email: '',
  phone: '',
  city: '',
  role: '',
  profileImage: '',
  description: '',
  socialLinks: [],
  metrics: defaultMetrics,
});

const profileData = ref({ ...defaultProfile });
const isProfileLoading = ref(false);
const profileError = ref(null);

const services = ref([]);
const albums = ref([]);
const reviews = ref([]);

const normalizeProfile = (rawProfile = {}) => ({
  ...defaultProfile,
  ...rawProfile,
  socialLinks: Array.isArray(rawProfile.socialLinks) ? rawProfile.socialLinks : [],
  metrics: {
    ...defaultMetrics,
    ...(rawProfile.metrics || {}),
  },
});

const loadProfile = async () => {
  const currentUser = user.value;

  if (!currentUser) {
    profileData.value = { ...defaultProfile };
    return;
  }

  isProfileLoading.value = true;
  profileError.value = null;

  try {
    if (currentUser.id) {
      const [apiUser] = await AuthApiService.fetchUsers({ id: currentUser.id });
      const normalizedUser = apiUser ? AuthApiService.sanitizeUser(apiUser) : currentUser;
      profileData.value = normalizeProfile({ ...currentUser, ...normalizedUser });
    } else {
      profileData.value = normalizeProfile(currentUser);
    }
  } catch (error) {
    profileError.value = error.message || 'No se pudo cargar la información del perfil.';
    profileData.value = normalizeProfile(currentUser);
  } finally {
    isProfileLoading.value = false;
  }
};

onMounted(loadProfile);
watch(user, () => {
  loadProfile();
});

const socialLinks = computed(() => profileData.value.socialLinks);

// Métodos
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const getRoleLabel = (role) => {
  const labels = {
    host: 'Anfitrión',
    organizer: 'Organizador',
    admin: 'Administrador',
  };
  return labels[role] || role;
};

const getSocialIcon = (type) => {
  const icons = {
    instagram: 'instagram',
    facebook: 'facebook',
    twitter: 'twitter',
    linkedin: 'linkedin',
  };
  return icons[type] || 'link';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const goToEdit = () => {
  router.push('/profile/edit');
};

const goToSettings = () => {
  router.push('/settings');
};

const goToCreateAlbum = () => {
  router.push('/profile/albums/create');
};

const goToAlbum = (id) => {
  router.push(`/profile/albums/${id}`);
};

const openSocialLink = (url) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener');
};

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.profile-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.profile-avatar-section {
  text-align: center;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.profile-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

.info-item .value {
  color: #1e293b;
  font-weight: 500;
}

.service-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.service-icon {
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.album-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.album-card:hover {
  transform: translateY(-4px);
}

.review-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.p-tabview) {
  border: none;
}

:deep(.p-tabview .p-tabview-nav) {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.p-tabview .p-tabview-nav .p-tabview-nav-link) {
  color: #64748b;
  border: none;
}

:deep(.p-tabview .p-tabview-nav .p-tabview-nav-link.p-tabview-selected) {
  color: #667eea;
  border-bottom: 2px solid #667eea;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-header {
    padding: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
