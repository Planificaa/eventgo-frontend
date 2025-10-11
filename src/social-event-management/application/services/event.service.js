// event.service.js
import axios from 'axios';

const API_URL = 'https://data-jaon-eventgo.onrender.com';

class EventService {
  async getEvents() {
    return await axios.get(`${API_URL}/events`);
  }

  async getEvent(id) {
    return await axios.get(`${API_URL}/events/${id}`);
  }

  async createEvent(eventData) {
    return await axios.post(`${API_URL}/events`, eventData);
  }

  async updateEvent(id, eventData) {
    return await axios.put(`${API_URL}/events/${id}`, eventData);
  }

  async deleteEvent(id) {
    return await axios.delete(`${API_URL}/events/${id}`);
  }

  async deleteMultipleEvents(eventIds) {
    const deletePromises = eventIds.map(id =>
      axios.delete(`${API_URL}/events/${id}`)
    );
    return await Promise.all(deletePromises);
  }

  async searchEvents(query) {
    return await axios.get(`${API_URL}/events?q=${query}`);
  }

  async filterEventsByStatus(status) {
    return await axios.get(`${API_URL}/events?status=${status}`);
  }
}

export default new EventService();
