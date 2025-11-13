<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Vista Previa de Tarea"
    :modal="true"
    :closable="true"
    :dismissableMask="true"
    class="task-preview-dialog"
    :style="{ width: '90vw', maxWidth: '800px' }"
  >
    <div class="preview-content">
      <!-- Header con información principal -->
      <div class="preview-header">
        <div class="header-left">
          <h2 class="task-title">{{ task.title }}</h2>
          <div class="task-meta">
            <TaskStateBadge :status="task.status" />
            <div class="priority-badge" :style="{ backgroundColor: getPriorityColor() }">
              <i :class="`pi ${getPriorityIcon()}`"></i>
              <span>{{ getPriorityLabel() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="task.description" class="preview-section">
        <h3 class="section-title">Descripción</h3>
        <p class="task-description">{{ task.description }}</p>
      </div>

      <!-- Details Grid -->
      <div class="preview-section">
        <h3 class="section-title">Detalles</h3>
        <div class="details-grid">
          <!-- Due Date -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-calendar"></i>
              <span>Fecha de Vencimiento</span>
            </div>
            <div class="detail-value" :class="{ 'overdue': task.isOverdue(), 'due-soon': task.isDueSoon() }">
              {{ formatDate(task.dueDate) || 'Sin fecha de vencimiento' }}
              <i v-if="task.isOverdue()" class="pi pi-exclamation-triangle warning-icon"></i>
            </div>
          </div>

          <!-- Estimated Hours -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-clock"></i>
              <span>Horas Estimadas</span>
            </div>
            <div class="detail-value">
              {{ task.estimatedHours > 0 ? `${task.estimatedHours} hrs` : 'No estimado' }}
            </div>
          </div>

          <!-- Assigned To -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-user"></i>
              <span>Asignado a</span>
            </div>
            <div class="detail-value">
              <div v-if="task.assignedTo" class="assigned-user-info">
                <Avatar
                  :label="task.assignedTo.charAt(0)"
                  size="small"
                  shape="circle"
                  class="user-avatar"
                />
                <span>{{ task.assignedTo }}</span>
              </div>
              <span v-else class="unassigned">Sin asignar</span>
            </div>
          </div>

          <!-- Created At -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-calendar-plus"></i>
              <span>Creada el</span>
            </div>
            <div class="detail-value">
              {{ formatDateTime(task.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="preview-section">
        <h3 class="section-title">Etiquetas</h3>
        <div class="tags-container">
          <span v-for="tag in task.tags" :key="tag" class="task-tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="preview-section">
        <h3 class="section-title">Historial</h3>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-icon created">
              <i class="pi pi-plus-circle"></i>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">Tarea creada</span>
              <span class="timeline-date">{{ formatDateTime(task.createdAt) }}</span>
            </div>
          </div>

          <div v-if="task.startDate" class="timeline-item">
            <div class="timeline-icon started">
              <i class="pi pi-play-circle"></i>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">Tarea iniciada</span>
              <span class="timeline-date">{{ formatDateTime(task.startDate) }}</span>
            </div>
          </div>

          <div v-if="task.completedDate" class="timeline-item">
            <div class="timeline-icon completed">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">Tarea completada</span>
              <span class="timeline-date">{{ formatDateTime(task.completedDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="preview-footer">
        <Button
          label="Editar Tarea"
          icon="pi pi-pencil"
          @click="handleEdit"
          outlined
          class="edit-btn"
        />
        <Button
          label="Cerrar"
          icon="pi pi-times"
          @click="$emit('update:visible', false)"
          class="close-btn"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import TaskStateBadge from './TaskStateBadge.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'edit'])

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityColor = () => {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  }
  return colors[props.task.priority] || '#6b7280'
}

const getPriorityIcon = () => {
  const icons = {
    high: 'pi-arrow-up',
    medium: 'pi-minus',
    low: 'pi-arrow-down'
  }
  return icons[props.task.priority] || 'pi-minus'
}

const getPriorityLabel = () => {
  const labels = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }
  return labels[props.task.priority] || 'Media'
}

const handleEdit = () => {
  emit('edit', props.task)
  emit('update:visible', false)
}
</script>

<style scoped>
.task-preview-dialog {
  font-family: var(--font-family);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.task-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.task-description {
  margin: 0;
  line-height: 1.6;
  color: var(--text-color-secondary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: 0.5rem;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 500;
}

.detail-value.overdue {
  color: #ef4444;
}

.detail-value.due-soon {
  color: #f59e0b;
}

.warning-icon {
  margin-left: 0.5rem;
  color: #ef4444;
}

.assigned-user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unassigned {
  color: var(--text-color-secondary);
  font-style: italic;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.task-tag {
  padding: 0.25rem 0.75rem;
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: 1rem;
  font-size: 0.875rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-left: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 2rem;
  width: 2px;
  height: calc(100% + 1rem);
  background: var(--surface-border);
}

.timeline-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.timeline-icon.created {
  background: var(--primary-500);
}

.timeline-icon.started {
  background: #f59e0b;
}

.timeline-icon.completed {
  background: #10b981;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-label {
  font-weight: 500;
  color: var(--text-color);
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
