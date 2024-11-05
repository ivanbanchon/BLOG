import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Alert } from '../components/Alert';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';
import ConfirmDialog from '../components/ConfirmDialog';

class EditPostManager extends BaseInteractionManager {
  static validatePost(post) {
    try {
      const errors = {};

      if (!post.title?.trim()) {
        errors.title = 'El título es requerido';
      } else if (post.title.length < 3) {
        errors.title = 'El título debe tener al menos 3 caracteres';
      }

      if (!post.content?.trim()) {
        errors.content = 'El contenido es requerido';
      }

      if (!post.category) {
        errors.category = 'La categoría es requerida';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    } catch (error) {
      this.handleError(error, 'validación de post');
      return {
        isValid: false,
        errors: { general: 'Error en la validación' }
      };
    }
  }

  static hasChanges(originalPost, currentPost) {
    try {
      return (
        originalPost.title !== currentPost.title ||
        originalPost.content !== currentPost.content ||
        originalPost.category !== currentPost.category
      );
    } catch (error) {
      this.handleError(error, 'detección de cambios');
      return false;
    }
  }
}

const EditPost = ({ posts, setPosts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [originalPost, setOriginalPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const categories = [
    'trajes',
    'ocio',
    'recompensas',
    'aventura',
    'libros'
  ];

  useEffect(() => {
    const loadPost = () => {
      try {
        const post = posts.find(p => p.id === parseInt(id));
        if (!post) {
          throw new Error('Post no encontrado');
        }

        setOriginalPost(post);
        setFormData({
          title: post.title,
          content: post.content,
          category: post.category
        });
      } catch (error) {
        setAlert({
          type: 'error',
          message: error.message
        });
        setTimeout(() => navigate('/'), 2000);
      }
    };

    loadPost();
  }, [id, posts, navigate]);

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (errors[name]) {
        setErrors(prev => {
          const { [name]: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: 'Error al actualizar el campo'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { isValid, errors: validationErrors } = EditPostManager.validatePost(formData);
      if (!isValid) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      const updatedPost = {
        ...originalPost,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      setPosts(prev => prev.map(p => p.id === parseInt(id) ? updatedPost : p));

      setAlert({
        type: 'success',
        message: 'Post actualizado exitosamente'
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al actualizar el post'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    try {
      const hasChanges = EditPostManager.hasChanges(originalPost, formData);
      if (hasChanges) {
        setShowCancelConfirm(true);
      } else {
        navigate('/');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cancelar la edición'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Editar Post</h1>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary ${errors.title ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary ${errors.category ? 'border-red-500' : ''}`}
              disabled={loading}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary ${errors.content ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>

        {/* Diálogo de confirmación para cancelar */}
        <ConfirmDialog
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={() => {
            setShowCancelConfirm(false);
            navigate('/');
          }}
          type="CANCEL"
          title="Cancelar Edición"
          message="¿Estás seguro de que quieres cancelar la edición? Los cambios no guardados se perderán."
          confirmText="Sí, cancelar"
          cancelText="No, continuar editando"
        />

        {/* Alert para mensajes de error/éxito */}
        {alert && (
          <Alert
            type={alert.type}
            onClose={() => setAlert(null)}
            className="fixed bottom-4 right-4 z-50"
          >
            {alert.message}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default EditPost;