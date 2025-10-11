import apiClient from '@/shared/infrastructure/components/http/axios.config.js';

export class ProfileApiService {
  static ENDPOINT = '/organizers';

  // Obtener todos los perfiles
  static async getAll() {
    try {
      const response = await apiClient.get(this.ENDPOINT);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener perfil por ID
  static async getById(id) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener perfil del usuario logueado
  static async getProfile() {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/me`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar perfil por ID
  static async update(id, profileData) {
    try {
      const response = await apiClient.put(`${this.ENDPOINT}/${id}`, profileData, {
        headers: profileData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Manejo de errores
  static handleError(error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.message;
      return new Error(`API Error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(`Request setup error: ${error.message}`);
    }
  }
}
