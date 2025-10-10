<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import TaskStateBadge from '../pages/TaskStateBadge.vue';
import { TaskApiService } from '../../application/services/task-api.service.js';
import { Task, TaskPriority } from '../../domain/model';

const router = useRouter();
const toast = useToast();

const tasks = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const filteredTasks = computed(() => {
  let result = [...tasks.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

  return result;
});

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-PE');
};

const getPriorityColor = (priority) => {
  return TaskPriority.getConfig(priority).color;
};

const getPriorityIcon = (priority) => {
  return TaskPriority.getConfig(priority).icon;
};

const handleNewTask = () => {
  router.push({ name: 'task-create' });
};

const handleView = (taskId) => {
  router.push({ name: 'task-detail', params: { id: taskId } });
};

const handleEdit = (taskId) => {
  router.push({ name: 'task-edit', params: { id: taskId } });
};

const handleDelete = async (taskId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

  try {
    await TaskApiService.delete(taskId);
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tarea eliminada exitosamente',
      life: 3000
    });
    await loadTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al eliminar la tarea',
      life: 5000
    });
  }
};

const loadTasks = async () => {
  loading.value = true;
  try {
    const data = await TaskApiService.getAll();
    tasks.value = data.map(t => Task.fromJSON(t));
  } catch (error) {
    console.error('Error loading tasks:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar las tareas',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTasks();
});
</script>

<template>
  <section class="tasks-list">
    <div class="tasks-list__filters">
      <InputText
        v-model="searchQuery"
        placeholder="Buscar tareas..."
        class="search-input"
      />
      <Button
        label="Nueva Tarea"
        icon="pi pi-plus"
        @click="handleNewTask"
        class="new-task-btn"
      />
    </div>

    <DataTable
      :value="filteredTasks"
      :loading="loading"
      :paginator="true"
      :rows="10"
      responsiveLayout="scroll"
      class="tasks-table"
      stripedRows
    >
      <Column field="title" header="Título" sortable>
        <template #body="{ data }">
          <span class="task-title">{{ data.title }}</span>
        </template>
      </Column>

      <Column field="priority" header="Prioridad" sortable style="width: 130px">
        <template #body="{ data }">
          <div class="priority-cell">
            <i :class="`pi ${getPriorityIcon(data.priority)}`" 
               :style="{ color: getPriorityColor(data.priority) }"></i>
            <span :style="{ color: getPriorityColor(data.priority) }">
              {{ data.priority }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="status" header="Estado" sortable style="width: 130px">
        <template #body="{ data }">
          <TaskStateBadge :status="data.status" />
        </template>
      </Column>

      <Column field="dueDate" header="Vencimiento" sortable style="width: 130px">
        <template #body="{ data }">
          <span :class="{ 'overdue': data.isOverdue() }">
            {{ formatDate(data.dueDate) }}
          </span>
        </template>
      </Column>

      <Column header="Acciones" style="width: 180px">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              icon="pi pi-eye"
              text
              rounded
              @click="handleView(data.id)"
              class="action-btn"
            />
            <Button
              icon="pi pi-pencil"
              text
              rounded
              @click="handleEdit(data.id)"
              class="action-btn"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="handleDelete(data.id)"
              class="action-btn"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p>No hay tareas disponibles</p>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<style scoped>
.tasks-list {
  width: 100%;
}

.tasks-list__filters {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.new-task-btn {
  background-color: #3A506B;
  border-color: #3A506B;
  color: #6FFFE9;
  font-weight: 600;
}

.new-task-btn:hover {
  background-color: #5BC0BE;
  border-color: #5BC0BE;
  color: #FFFFFF;
}

.tasks-table {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-weight: 600;
  color: #212529;
}

.priority-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.overdue {
  color: #DC3545;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #6C757D;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
