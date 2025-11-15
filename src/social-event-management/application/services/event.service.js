// event.service.js
import apiClient from '/src/shared/infrastructure/http/axios.config.js';

const RESOURCE = '/social-events'; // <-- CORREGIDO

class EventService {

  async getEvents(params = {}) {
    const { data } = await apiClient.get(RESOURCE, { params });
    return data; // JSON Server devuelve array plano
  }

  async getEvent(id) {
    const { data } = await apiClient.get(`${RESOURCE}/${id}`);
    return data;
  }

  async getEventsByUser(ownerId) {
    if (!ownerId) return await this.getEvents();

    // JSON Server filtra por ?ownerId=xx
    const { data } = await apiClient.get(RESOURCE, { params: { ownerId } });
    return data;
  }

  async createEvent(eventData) {
    const { data } = await apiClient.post(RESOURCE, eventData);
    return data;
  }

  async updateEvent(id, eventData) {
    const { data } = await apiClient.put(`${RESOURCE}/${id}`, eventData);
    return data;
  }

  async deleteEvent(id) {
    const { data } = await apiClient.delete(`${RESOURCE}/${id}`);
    return data;
  }

  async deleteMultipleEvents(eventIds) {
    const deletePromises = eventIds.map(id =>
      apiClient.delete(`${RESOURCE}/${id}`)
    );
    return await Promise.all(deletePromises);
  }

  async searchEvents(query) {
    const { data } = await apiClient.get(`${RESOURCE}?q=${query}`);
    return data;
  }

  async filterEventsByStatus(status) {
    const { data } = await apiClient.get(`${RESOURCE}?status=${status}`);
    return data;
  }
}

export default new EventService();
