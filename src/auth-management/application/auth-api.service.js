/**
 * Auth API Service
 * Capa de Aplicación - Servicios de autenticación
 * Interactúa con la fake API (db.json)
 */

import axios from 'axios';

export class AuthApiService {
  static BASE_URL = '/users';

  /**
   * Carga los datos de la fake API
   * @returns {Promise<Object>} Datos de la API
   */
  static async loadFakeDatabase() {
    try {
      const response = await axios.get(this.BASE_URL);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al cargar la base de datos');
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña
   * @param {string} userData.name - Nombre completo
   * @param {string} [userData.role] - Rol del usuario (user | organizer)
   * @returns {Promise<Object>} Usuario registrado con token
   */
  static async register(userData) {
    try {
      const database = await this.loadFakeDatabase();

      // Validar que el email no exista
      if (database.users && database.users.some(u => u.email === userData.email)) {
        throw new Error('El email ya está registrado');
      }

      // Crear nuevo usuario
      const newUser = {
        id: `user_${Date.now()}`,
        email: userData.email,
        password: userData.password, // En producción, esto debe estar hasheado
        name: userData.name,
        role: userData.role || 'user',
        profileImage: '',
        status: 'active',
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simular almacenamiento en base de datos
      // En producción, esto sería una llamada POST a un servidor real
      const token = this.generateToken(newUser);

      return {
        user: newUser,
        token,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error) {
      throw this.handleError(error, 'Error al registrar usuario');
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Usuario autenticado con token
   */
  static async login(email, password) {
    try {
      const database = await this.loadFakeDatabase();

      // Buscar usuario en la fake database
      const user = database.users && database.users.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }

      if (user.status !== 'active') {
        throw new Error('La cuenta está desactivada');
      }

      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage,
          status: user.status,
        },
        token,
        message: 'Sesión iniciada exitosamente',
      };
    } catch (error) {
      throw this.handleError(error, 'Error al iniciar sesión');
    }
  }

  /**
   * Valida el token actual
   * @param {string} token - Token a validar
   * @returns {Promise<Object>} Información del usuario si el token es válido
   */
  static async validateToken(token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      // Decodificar token (en producción, esto se haría en el servidor)
      const decoded = this.decodeToken(token);
      if (!decoded) {
        throw new Error('Token inválido');
      }

      return decoded;
    } catch (error) {
      throw this.handleError(error, 'Error al validar token');
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<Object>} Confirmación de logout
   */
  static async logout() {
    try {
      // Simular cierre de sesión
      return {
        message: 'Sesión cerrada exitosamente', };
    } catch (error){
      throw this.handleError(error, 'Error al cerrar sesión');
    }
  }

  /**
   * Genera un token JWT simulado
   * @param {Object} user - Datos del usuario
   * @returns {string} Token
   */
  static generateToken(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 horas
    }));
    const signature = btoa('fake-signature');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Decodifica un token JWT simulado
   * @param {string} token - Token a decodificar
   * @returns {Object|null} Datos del token o null si es inválido
   */
  static decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return null; // Token expirado
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error a manejar
   * @param {string} defaultMessage - Mensaje por defecto
   * @returns {Error} Error procesado
   */
  static handleError(error, defaultMessage = 'Error en la autenticación') {
    if (error.response) {
      return new Error(`${error.response.status}: ${error.response.data?.message || error.message}`);
    } else if (error.message) {
      return error;
    } else {
      return new Error(defaultMessage);
    }
  }
}
