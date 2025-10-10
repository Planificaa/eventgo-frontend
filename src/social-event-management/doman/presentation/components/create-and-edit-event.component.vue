<script>
import EventService from '../services/event.service.js';

export default {
  name: 'CreateAndEditEvent',
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      eventData: {
        title: '',
        date: '',
        customerName: '',
        location: '',
        status: 'Active',
        userId: 1 // Fixed user for demonstration
      },
      loading: false
    };
  },
  computed: {
    isEditMode() {
      return !!this.id;
    }
  },
  methods: {
    async fetchEvent() {
      if (!this.isEditMode) return;

      this.loading = true;
      try {
        const response = await EventService.getEventById(this.id);
        // Copy the data to avoid directly modifying the response
        this.eventData = { ...response.data };
      } catch (error) {
        console.error('Error fetching event:', error);
        this.$router.push('/events');
      } finally {
        this.loading = false;
      }
    },
    async saveEvent() {
      this.loading = true;
      try {
        if (this.isEditMode) {
          await EventService.updateEvent(this.id, this.eventData);
        } else {
          await EventService.createEvent(this.eventData);
        }
        // Redirect to events list after saving
        this.$router.push('/events');
      } catch (error) {
        console.error('Error saving event:', error);
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push('/events');
    }
  },
  created() {
    // If we're in edit mode, load the event data
    this.fetchEvent();
  }
};


</script>

<template>

  <div class="event-form-container">
    <div class="form-header">
      <h1>{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h1>
    </div>

    <form @submit.prevent="saveEvent" class="event-form">
      <div class="form-group">
        <label for="title">Event Title</label>
        <input
          type="text"
          id="title"
          v-model="eventData.title"
          required
          placeholder="Enter event title"
        >
      </div>

      <div class="form-group">
        <label for="date">Event Date</label>
        <input
          type="date"
          id="date"
          v-model="eventData.date"
          required
        >
      </div>

      <div class="form-group">
        <label for="customerName">Customer Name</label>
        <input
          type="text"
          id="customerName"
          v-model="eventData.customerName"
          required
          placeholder="Enter customer name"
        >
      </div>

      <div class="form-group">
        <label for="location">Location</label>
        <input
          type="text"
          id="location"
          v-model="eventData.location"
          required
          placeholder="Enter event location"
        >
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="eventData.status" required>
          <option value="Active">Active</option>
          <option value="To be confirmed">To be confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-btn">Cancel</button>
        <button type="submit" class="save-btn">{{ isEditMode ? 'Update Event' : 'Create Event' }}</button>
      </div>
    </form>
  </div>

</template>

<style scoped>

</style>
