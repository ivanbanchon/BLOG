import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Alert } from '../components/Alert';
import PostService from '../utils/PostService';

const CreatePost = ({ setPosts }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'trajes',
    'ocio',
    'recompensas',
    'aventura',
    'libros'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newPost = await PostService.createPost(formData);
      setPosts(prev => [newPost, ...prev]);
      navigate('/');
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Post</h1>

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Escribe un título llamativo"
              required
            />
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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
              rows="6"
              placeholder="Escribe el contenido de tu post"
              required
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Creando...' : 'Crear Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;