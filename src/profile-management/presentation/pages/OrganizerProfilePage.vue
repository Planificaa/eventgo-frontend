<template>
  <div class="profile-container">
    <div v-if="isProfileLoading" class="alert alert-info">
      {{ $t('profile.loading') }}
    </div>
    <div v-if="profileError" class="alert alert-error">
      {{ profileError }}
    </div>

    <template v-if="isHostProfile">
      <section class="host-profile">
        <Card class="host-profile__card">
          <template #content>
            <div class="host-profile__header">
              <Avatar
                :image="profileData.profileImage"
                :label="getInitials(profileData.name)"
                size="xlarge"
                shape="circle"
                class="host-profile__avatar"
              />
              <div class="host-profile__identity">
                <h1 class="host-profile__name">{{ profileData.name }}</h1>
                <p class="host-profile__role">{{ $t('profile.roles.host') }}</p>
                <div class="host-profile__actions">
                  <Button
                    :label="$t('profile.actions.editProfile')"
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-sm"
                    @click="goToEdit"
                  />
                  <Button
                    :label="$t('profile.actions.manageQuotes')"
                    icon="pi pi-briefcase"
                    class="p-button-text p-button-sm"
                    @click="goToQuotes"
                  />
                  <Button
                    :label="$t('profile.actions.logout')"
                    icon="pi pi-sign-out"
                    class="p-button-danger p-button-outlined p-button-sm"
                    @click="handleLogout"
                  />
                </div>
              </div>
            </div>

            <div class="host-profile__details">
              <div class="host-profile__contact">
                <h2>{{ $t('profile.sections.contactInfo') }}</h2>
                <ul>
                  <li v-if="hostOverview.contact.email">
                    <i class="pi pi-envelope"></i>
                    <span>{{ hostOverview.contact.email }}</span>
                  </li>
                  <li v-if="hostOverview.contact.phone">
                    <i class="pi pi-phone"></i>
                    <span>{{ hostOverview.contact.phone }}</span>
                  </li>
                  <li v-if="hostOverview.contact.location">
                    <i class="pi pi-map-marker"></i>
                    <span>{{ hostOverview.contact.location }}</span>
                  </li>
                  <li v-if="hostOverview.contact.company">
                    <i class="pi pi-briefcase"></i>
                    <span>{{ hostOverview.contact.company }}</span>
                  </li>
                </ul>
              </div>

              <div class="host-profile__preferences">
                <h2>{{ $t('profile.sections.preferences') }}</h2>
                <div v-if="hostOverview.preferences.length" class="preferences-tags">
                  <Tag
                    v-for="preference in hostOverview.preferences"
                    :key="preference"
                    severity="info"
                    rounded
                    :value="preference"
                  />
                </div>
                <p v-else class="empty-text">{{ $t('profile.empty.preferences') }}</p>
              </div>
            </div>
          </template>
        </Card>

        <div class="host-profile__metrics">
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3>{{ $t('profile.hostMetrics.totalQuotes') }}</h3>
                <p class="metric-value metric-value--primary">{{ hostQuoteStats.total }}</p>
                <span class="metric-subtitle">{{ $t('profile.hostMetrics.totalQuotesSubtitle') }}</span>
              </div>
            </template>
          </Card>
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3>{{ $t('profile.hostMetrics.pendingQuotes') }}</h3>
                <p class="metric-value metric-value--warning">{{ hostQuoteStats.pending }}</p>
                <span class="metric-subtitle">{{ $t('profile.hostMetrics.pendingQuotesSubtitle') }}</span>
              </div>
            </template>
          </Card>
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3>{{ $t('profile.hostMetrics.approvedQuotes') }}</h3>
                <p class="metric-value metric-value--success">{{ hostQuoteStats.approved }}</p>
                <span class="metric-subtitle">{{ $t('profile.hostMetrics.approvedQuotesSubtitle') }}</span>
              </div>
            </template>
          </Card>
          <Card class="metric-card">
            <template #content>
              <div class="metric-content">
                <h3>{{ $t('profile.hostMetrics.declinedQuotes') }}</h3>
                <p class="metric-value metric-value--danger">{{ hostQuoteStats.declined }}</p>
                <span class="metric-subtitle">{{ $t('profile.hostMetrics.declinedQuotesSubtitle') }}</span>
              </div>
            </template>
          </Card>
        </div>

        <div class="host-profile__grid">
          <Card class="host-profile__panel">
            <template #title>{{ $t('profile.sections.recentEvents') }}</template>
            <template #content>
              <ul v-if="hostOverview.recentEvents.length" class="panel-list">
                <li v-for="event in hostOverview.recentEvents" :key="event.id">
                  <div>
                    <h4>{{ event.name }}</h4>
                    <small>{{ formatDate(event.date) }}</small>
                  </div>
                  <Tag :value="$t(`profile.eventStates.${event.state.toLowerCase()}`)" :severity="getEventSeverity(event.state)" />
                </li>
              </ul>
              <p v-else class="empty-text">{{ $t('profile.empty.events') }}</p>
            </template>
          </Card>

          <Card class="host-profile__panel">
            <template #title>{{ $t('profile.sections.recentOrganizers') }}</template>
            <template #content>
              <ul v-if="hostOverview.recentOrganizers.length" class="panel-list">
                <li v-for="organizer in hostOverview.recentOrganizers" :key="organizer.id">
                  <div class="panel-list__identity">
                    <Avatar
                      :image="organizer.avatar"
                      :label="organizer.name.charAt(0)"
                      size="large"
                      shape="circle"
                    />
                    <div>
                      <h4>{{ organizer.name }}</h4>
                      <small>{{ organizer.specialty }}</small>
                    </div>
                  </div>
                  <Rating :modelValue="organizer.rating" :readonly="true" :cancel="false" />
                </li>
              </ul>
              <p v-else class="empty-text">{{ $t('profile.empty.organizers') }}</p>
            </template>
          </Card>
        </div>

        <div class="host-profile__quotes">
          <div class="host-profile__quotes-header">
            <h2>{{ $t('profile.sections.quotes') }}</h2>
            <Button
              :label="$t('profile.actions.viewAllQuotes')"
              icon="pi pi-arrow-right"
              class="p-button-text"
              @click="goToQuotes"
            />
          </div>
          <DataTable :value="hostQuotes" :loading="quotesLoading" responsiveLayout="scroll">
            <Column field="organizerName" :header="$t('profile.columns.organizer')" />
            <Column field="eventName" :header="$t('profile.columns.event')">
              <template #body="{ data }">
                <div class="quote-event">
                  <span class="quote-event__name">{{ data.eventName }}</span>
                  <small class="quote-event__type">{{ $t(`events.types.${data.eventType.toLowerCase()}`) }}</small>
                </div>
              </template>
            </Column>
            <Column field="eventDate" :header="$t('profile.columns.date')">
              <template #body="{ data }">
                {{ formatDate(data.eventDate) }}
              </template>
            </Column>
            <Column field="total" :header="$t('profile.columns.amount')" />
            <Column field="state" :header="$t('profile.columns.state')">
              <template #body="{ data }">
                <QuoteStateBadge :state="data.state" />
              </template>
            </Column>
            <Column :header="$t('profile.columns.actions')">
              <template #body="{ data }">
                <Button
                  :label="$t('profile.actions.viewQuote')"
                  icon="pi pi-eye"
                  text
                  @click="viewQuoteDetail(data.id)"
                />
              </template>
            </Column>
            <template #empty>
              <div class="empty-text">{{ $t('profile.empty.quotes') }}</div>
            </template>
          </DataTable>
        </div>
      </section>
    </template>

    <template v-else>
      <div class="profile-header">
        <div class="grid grid-nogutter">
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

          <div class="col-12 md:col-8 lg:col-9">
            <div class="grid grid-nogutter gap-3">
              <div class="col-6 md:col-3" v-for="metric in organizerMetricList" :key="metric.id">
                <div class="stat-card">
                  <div class="stat-value">{{ metric.value }}</div>
                  <div class="stat-label">{{ metric.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mt-4">
          <Button
            :label="$t('profile.actions.editProfile')"
            icon="pi pi-pencil"
            @click="goToEdit"
            class="p-button-primary"
          />
          <Button
            :label="$t('profile.actions.settings')"
            icon="pi pi-cog"
            @click="goToSettings"
            class="p-button-secondary"
          />
          <Button
            :label="$t('profile.actions.logout')"
            icon="pi pi-sign-out"
            @click="handleLogout"
            class="p-button-danger p-button-outlined"
          />
        </div>
      </div>

      <div class="profile-content mt-6">
        <TabView v-model:activeIndex="activeTab" class="profile-tabs">
          <TabPanel :header="$t('profile.tabs.information')" leftIcon="pi pi-info-circle">
            <div class="p-4">
              <div class="grid grid-nogutter gap-4">
                <div class="col-12 md:col-6">
                  <div class="info-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ $t('profile.sections.personalInfo') }}</h3>
                    <div class="space-y-3">
                      <div class="info-item">
                        <span class="label">{{ $t('profile.labels.name') }}:</span>
                        <span class="value">{{ profileData.name }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">{{ $t('profile.labels.email') }}:</span>
                        <span class="value">{{ profileData.email }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">{{ $t('profile.labels.phone') }}:</span>
                        <span class="value">{{ profileData.phone || $t('profile.empty.notProvided') }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">{{ $t('profile.labels.city') }}:</span>
                        <span class="value">{{ profileData.city || $t('profile.empty.notProvided') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 md:col-6">
                  <div class="info-section">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ $t('profile.sections.description') }}</h3>
                    <p class="text-gray-700 text-sm leading-relaxed">
                      {{ profileData.description || $t('profile.empty.description') }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ $t('profile.sections.social') }}</h3>
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

          <TabPanel :header="$t('profile.tabs.services')" leftIcon="pi pi-briefcase">
            <div class="p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">{{ $t('profile.sections.services') }}</h3>
                <Button
                  :label="$t('profile.actions.addService')"
                  icon="pi pi-plus"
                  class="p-button-primary p-button-sm"
                />
              </div>

              <div v-if="services.length" class="grid grid-nogutter gap-4">
                <div v-for="service in services" :key="service.id" class="col-12 md:col-6 lg:col-4">
                  <Card class="service-card">
                    <template #header>
                      <div class="service-icon">
                        <i :class="`pi pi-${service.icon || 'briefcase'}`"></i>
                      </div>
                    </template>
                    <template #title>{{ service.name }}</template>
                    <template #content>
                      <p class="text-sm text-gray-600 mb-2">{{ service.description }}</p>
                      <div class="flex justify-between items-center">
                        <span class="font-semibold text-blue-600">{{ service.price }}</span>
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
                <p class="text-gray-500">{{ $t('profile.empty.services') }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel :header="$t('profile.tabs.albums')" leftIcon="pi pi-images">
            <div class="p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">{{ $t('profile.sections.albums') }}</h3>
                <Button
                  :label="$t('profile.actions.createAlbum')"
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
                      <small class="text-gray-500">{{ album.photos?.length || 0 }} {{ $t('profile.labels.photos') }}</small>
                    </template>
                  </Card>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500">{{ $t('profile.empty.albums') }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel :header="$t('profile.tabs.reviews')" leftIcon="pi pi-star">
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
                    <Rating :modelValue="review.rating" :readonly="true" :cancel="false" />
                  </div>
                  <p class="text-gray-700 text-sm">{{ review.comment }}</p>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500">{{ $t('profile.empty.reviews') }}</p>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'
import { AuthApiService } from '@/auth-management/application/auth-api.service.js'
import { QuoteApiService } from '@/quote-management/application/services/quote-api.service.js'
import { QuoteOrder } from '@/quote-management/domain/model'
import QuoteStateBadge from '@/quote-management/presentation/pages/QuoteStateBadge.vue'

const router = useRouter()
const toast = useToast()
const { user, restoreSession, logout } = useAuth()
const activeTab = ref(0)

const defaultMetrics = Object.freeze({
  eventsOrganized: 0,
  rating: 0,
  customers: 0,
  experienceYears: 0,
})

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
})

const defaultHostOverview = Object.freeze({
  contact: {
    email: '',
    phone: '',
    location: '',
    company: '',
  },
  preferences: [],
  recentEvents: [],
  recentOrganizers: [],
})

const profileData = ref({ ...defaultProfile })
const isProfileLoading = ref(false)
const profileError = ref(null)
const services = ref([])
const albums = ref([])
const reviews = ref([])
const hostOverview = ref({ ...defaultHostOverview })
const hostQuotes = ref([])
const quotesLoading = ref(false)

const socialLinks = computed(() => profileData.value.socialLinks)

const isHostProfile = computed(() => (profileData.value.role || user.value?.role) === 'host')

const organizerMetricList = computed(() => [
  { id: 'events', label: 'Eventos Organizados', value: profileData.value.metrics.eventsOrganized ?? 0 },
  { id: 'rating', label: 'Calificación', value: profileData.value.metrics.rating ?? 0 },
  { id: 'customers', label: 'Clientes', value: profileData.value.metrics.customers ?? 0 },
  { id: 'experience', label: 'Años Exp.', value: profileData.value.metrics.experienceYears ?? 0 },
])

const hostQuoteStats = computed(() => hostQuotes.value.reduce((acc, quote) => {
  acc.total += 1
  if (quote.state === QuoteOrder.STATES.APPROVED) acc.approved += 1
  if (quote.state === QuoteOrder.STATES.PENDING) acc.pending += 1
  if (quote.state === QuoteOrder.STATES.DECLINED) acc.declined += 1
  return acc
}, { total: 0, approved: 0, pending: 0, declined: 0 }))

const normalizeProfile = (rawProfile = {}) => ({
  ...defaultProfile,
  ...rawProfile,
  socialLinks: Array.isArray(rawProfile.socialLinks) ? rawProfile.socialLinks : [],
  metrics: {
    ...defaultMetrics,
    ...(rawProfile.metrics || {}),
  },
})

const loadHostQuotes = async (userId) => {
  quotesLoading.value = true
  try {
    const quotesResponse = await QuoteApiService.getAll()
    const hostId = String(userId)
    const mappedQuotes = Array.isArray(quotesResponse)
      ? quotesResponse
          .map((data) => QuoteOrder.fromJSON(data))
          .filter((quote) => {
            const customerId = quote.customer?.id ? String(quote.customer.id) : null
            const ownerId = quote.ownerId ? String(quote.ownerId) : null
            return customerId === hostId || ownerId === hostId
          })
          .map((quote) => ({
            id: quote.id,
            organizerName: quote.organizer?.name || '-',
            eventName: quote.event?.name || '-',
            eventType: quote.event?.type || 'other',
            eventDate: quote.event?.date || null,
            total: quote.getFormattedTotal(),
            state: quote.state,
          }))
      : []

    hostQuotes.value = mappedQuotes
  } catch (error) {
    console.error('Error loading host quotes', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar las cotizaciones del anfitrión.',
      life: 4000,
    })
  } finally {
    quotesLoading.value = false
  }
}

const loadProfile = async () => {
  const currentUser = user.value

  if (!currentUser) {
    profileData.value = { ...defaultProfile }
    return
  }

  isProfileLoading.value = true
  profileError.value = null

  try {
    const [apiUser] = await AuthApiService.fetchUsers({ id: currentUser.id })
    const normalizedUser = apiUser ? AuthApiService.sanitizeUser(apiUser) : currentUser
    profileData.value = normalizeProfile({ ...currentUser, ...normalizedUser, ...(apiUser || {}) })

    if (profileData.value.role === 'host') {
      const hostProfile = apiUser?.hostProfile || {}
      hostOverview.value = {
        contact: {
          email: hostProfile.contact?.email || profileData.value.email,
          phone: hostProfile.contact?.phone || profileData.value.phone,
          location: hostProfile.contact?.location || profileData.value.city,
          company: hostProfile.contact?.company || hostProfile.company || '',
        },
        preferences: Array.isArray(hostProfile.preferences) ? hostProfile.preferences : [],
        recentEvents: Array.isArray(hostProfile.recentEvents) ? hostProfile.recentEvents : [],
        recentOrganizers: Array.isArray(hostProfile.recentOrganizers) ? hostProfile.recentOrganizers : [],
      }

      if (profileData.value.id) {
        await loadHostQuotes(profileData.value.id)
      }
    } else {
      services.value = Array.isArray(apiUser?.services) ? apiUser.services : []
      albums.value = Array.isArray(apiUser?.albums) ? apiUser.albums : []
      reviews.value = Array.isArray(apiUser?.reviews) ? apiUser.reviews : []
    }
  } catch (error) {
    profileError.value = error.message || 'No se pudo cargar la información del perfil.'
  } finally {
    isProfileLoading.value = false
  }
}

const ensureSession = async () => {
  if (!user.value) {
    await restoreSession()
  }
}

onMounted(async () => {
  await ensureSession()
  await loadProfile()
})

watch(user, async () => {
  await loadProfile()
})

const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const getRoleLabel = (role) => {
  const labels = {
    host: 'Anfitrión',
    organizer: 'Organizador',
    admin: 'Administrador',
  }
  return labels[role] || role
}

const getSocialIcon = (type) => {
  const icons = {
    instagram: 'instagram',
    facebook: 'facebook',
    twitter: 'twitter',
    linkedin: 'linkedin',
  }
  return icons[type] || 'link'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const getEventSeverity = (state) => {
  const normalized = (state || '').toLowerCase()
  if (normalized === 'activo' || normalized === 'active') return 'success'
  if (normalized === 'pendiente' || normalized === 'pending') return 'warning'
  if (normalized === 'finalizado' || normalized === 'completed') return 'info'
  if (normalized === 'cancelado' || normalized === 'cancelled') return 'danger'
  return 'info'
}

const goToEdit = () => {
  router.push('/profile/edit')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToCreateAlbum = () => {
  router.push('/profile/albums/create')
}

const goToAlbum = (id) => {
  router.push(`/profile/albums/${id}`)
}

const goToQuotes = () => {
  router.push({ name: 'quotes' })
}

const openSocialLink = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener')
}

const viewQuoteDetail = (quoteId) => {
  router.push({ name: 'quote-detail', params: { id: quoteId } })
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 70px);
}

.alert {
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
}

.alert-info {
  background: #e0f2fe;
  color: #0c4a6e;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
}

.host-profile {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.host-profile__card {
  border-radius: 18px;
  border: none;
  box-shadow: 0 16px 40px rgba(28, 37, 65, 0.08);
}

.host-profile__header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.host-profile__identity {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.host-profile__name {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1c2541;
}

.host-profile__role {
  margin: 0;
  color: #64748b;
  font-weight: 600;
}

.host-profile__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.host-profile__details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.host-profile__contact ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #475569;
}

.host-profile__contact i {
  margin-right: 0.5rem;
  color: #3a506b;
}

.preferences-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.empty-text {
  color: #94a3b8;
  font-size: 0.95rem;
}

.host-profile__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  border: none;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(28, 37, 65, 0.08);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-content h3 {
  margin: 0;
  color: #1c2541;
  font-size: 1rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.metric-value--primary {
  color: #3a506b;
}

.metric-value--warning {
  color: #f59e0b;
}

.metric-value--success {
  color: #22c55e;
}

.metric-value--danger {
  color: #ef4444;
}

.metric-subtitle {
  color: #94a3b8;
}

.host-profile__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.host-profile__panel {
  border-radius: 16px;
  border: none;
  box-shadow: 0 12px 28px rgba(28, 37, 65, 0.07);
}

.panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.panel-list__identity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.host-profile__quotes {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(28, 37, 65, 0.08);
}

.host-profile__quotes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quote-event {
  display: flex;
  flex-direction: column;
}

.quote-event__name {
  font-weight: 600;
  color: #1c2541;
}

.quote-event__type {
  color: #64748b;
}

.profile-header {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(28, 37, 65, 0.08);
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-card {
  background: #f1f5f9;
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1c2541;
}

.stat-label {
  color: #64748b;
}

.profile-content {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 16px 32px rgba(28, 37, 65, 0.08);
}

.info-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  color: #334155;
}

.label {
  font-weight: 600;
}

.service-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(28, 37, 65, 0.07);
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-size: 1.5rem;
  color: #3a506b;
}

.album-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(28, 37, 65, 0.07);
}

.review-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.25rem;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1.5rem;
  }

  .host-profile__actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .host-profile__metrics {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
