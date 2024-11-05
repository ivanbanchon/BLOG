// src/utils/BaseInteractionManager.js
export class BaseInteractionManager {
    // Método para manejar errores de forma consistente
    static handleError(error, context) {
      console.error(`Error en ${context}:`, error);
      throw new Error(`Error en ${context}: ${error.message}`);
    }
  
    // Método para validar datos
    static validateData(data, requiredFields) {
      try {
        requiredFields.forEach(field => {
          if (!data[field]) {
            throw new Error(`El campo ${field} es requerido`);
          }
        });
        return true;
      } catch (error) {
        this.handleError(error, 'validación de datos');
        return false;
      }
    }
  
    // Método para formatear fechas
    static formatDate(date) {
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        this.handleError(error, 'formato de fecha');
        return 'Fecha no disponible';
      }
    }
  }