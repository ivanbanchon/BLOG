import React from 'react';
import { X } from 'lucide-react';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';

class DialogManager extends BaseInteractionManager {
  static DIALOG_TYPES = {
    DELETE: {
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este elemento?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmClass: 'bg-red-500 hover:bg-red-600',
      icon: '🗑️'
    },
    SAVE: {
      title: 'Guardar Cambios',
      message: '¿Quieres guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
      confirmClass: 'bg-green-500 hover:bg-green-600',
      icon: '💾'
    },
    CANCEL: {
      title: 'Cancelar',
      message: '¿Estás seguro de que quieres cancelar? Los cambios se perderán.',
      confirmText: 'Sí, cancelar',
      cancelText: 'No, continuar',
      confirmClass: 'bg-yellow-500 hover:bg-yellow-600',
      icon: '⚠️'
    }
  };

  static getDialogConfig(type) {
    try {
      return this.DIALOG_TYPES[type] || this.DIALOG_TYPES.DELETE;
    } catch (error) {
      this.handleError(error, 'obtener configuración de diálogo');
      return this.DIALOG_TYPES.DELETE;
    }
  }
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  type = 'DELETE',
  title,
  message,
  confirmText,
  cancelText,
  loading = false
}) => {
  if (!isOpen) return null;

  const config = DialogManager.getDialogConfig(type);
  
  const handleConfirm = (e) => {
    e.stopPropagation();
    onConfirm();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={handleClose}></div>

        {/* Centrado del diálogo */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Contenido del diálogo */}
        <div 
          className="inline-block p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">{config.icon}</span>
              {title || config.title}
            </h3>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Mensaje */}
          <div className="mt-2">
            <p className="text-gray-600">
              {message || config.message}
            </p>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
            >
              {cancelText || config.cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.confirmClass} disabled:opacity-50`}
              disabled={loading}
            >
              {loading ? 'Procesando...' : (confirmText || config.confirmText)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;