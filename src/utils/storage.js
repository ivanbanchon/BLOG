// src/utils/storage.js

// Clase para gestionar errores de almacenamiento
class StorageError extends Error {
  constructor(message, operation) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
  }
}

// Clase para manejar el almacenamiento local con validaciones
export class Storage {
  // Validar disponibilidad de localStorage
  static validateStorage() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      throw new StorageError('localStorage no está disponible', 'validation');
    }
  }

  // Validar valor antes de guardar
  static validateValue(value) {
    try {
      JSON.stringify(value);
      return true;
    } catch (error) {
      throw new StorageError('Valor no serializable', 'validation');
    }
  }

  // Validar clave
  static validateKey(key) {
    if (!key || typeof key !== 'string') {
      throw new StorageError('Clave inválida', 'validation');
    }
    return true;
  }

  // Obtener datos del almacenamiento
  static async get(key) {
    try {
      this.validateStorage();
      this.validateKey(key);

      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }

      try {
        return JSON.parse(item);
      } catch (parseError) {
        throw new StorageError('Error al parsear datos almacenados', 'parse');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Error al obtener datos: ${error.message}`, 'get');
    }
  }

  // Guardar datos en el almacenamiento
  static async set(key, value) {
    try {
      this.validateStorage();
      this.validateKey(key);
      this.validateValue(value);

      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);

      // Verificar que se guardó correctamente
      const savedValue = localStorage.getItem(key);
      if (savedValue !== serializedValue) {
        throw new StorageError('Error de verificación al guardar datos', 'verification');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Error al guardar datos: ${error.message}`, 'set');
    }
  }

  // Eliminar datos del almacenamiento
  static async remove(key) {
    try {
      this.validateStorage();
      this.validateKey(key);

      localStorage.removeItem(key);

      // Verificar que se eliminó correctamente
      if (localStorage.getItem(key) !== null) {
        throw new StorageError('Error de verificación al eliminar datos', 'verification');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Error al eliminar datos: ${error.message}`, 'remove');
    }
  }

  // Limpiar todo el almacenamiento
  static async clear() {
    try {
      this.validateStorage();
      localStorage.clear();

      // Verificar que se limpió correctamente
      if (localStorage.length !== 0) {
        throw new StorageError('Error de verificación al limpiar almacenamiento', 'verification');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Error al limpiar almacenamiento: ${error.message}`, 'clear');
    }
  }

  // Obtener espacio disponible (aproximado)
  static async getAvailableSpace() {
    try {
      this.validateStorage();
      let space = 0;
      const testString = 'a'.repeat(1024); // 1KB

      try {
        while (true) {
          localStorage.setItem('__space_test__', testString.repeat(space));
          space++;
        }
      } catch {
        localStorage.removeItem('__space_test__');
        return space - 1; // Restar el último intento fallido
      }
    } catch (error) {
      throw new StorageError('Error al calcular espacio disponible', 'space');
    }
  }
}

export default Storage;
