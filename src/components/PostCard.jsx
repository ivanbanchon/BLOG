// src/components/PostCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ThumbsUp, Heart, Star, Coffee, 
  Edit, Trash2, MessageSquare 
} from 'lucide-react';
import { Alert } from './Alert';

const PostCard = ({ post, onDelete, onUpdate }) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState(null);

  // Lista de reacciones disponibles
  const reactions = [
    { type: 'like', icon: <ThumbsUp className="w-5 h-5" />, label: 'Me gusta' },
    { type: 'love', icon: <Heart className="w-5 h-5" />, label: 'Me encanta' },
    { type: 'wow', icon: <Star className="w-5 h-5" />, label: 'Asombro' },
    { type: 'thinking', icon: <Coffee className="w-5 h-5" />, label: 'Pensativo' }
  ];

  // Manejador de reacciones
  const handleReaction = async (type) => {
    try {
      setLoading(true);
      const updatedPost = {
        ...post,
        reactions: {
          ...post.reactions,
          [type]: (post.reactions[type] || 0) + 1
        }
      };
      await onUpdate(updatedPost);
    } catch (error) {
      setError('Error al registrar reacción');
    } finally {
      setLoading(false);
    }
  };

  // Manejador para eliminar
  const handleDelete = async () => {
    try {
      if (showConfirmDelete) {
        setLoading(true);
        await onDelete(post.id);
      } else {
        setShowConfirmDelete(true);
      }
    } catch (error) {
      setError('Error al eliminar el post');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar contenido multimedia
  const renderMedia = () => {
    if (!post.media) return null;

    if (post.media.type.startsWith('image/')) {
      return (
        <img
          src={post.media.url}
          alt={post.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.jpg';
          }}
        />
      );
    }

    if (post.media.type.startsWith('video/')) {
      return (
        <video
          src={post.media.url}
          className="w-full h-48 object-cover"
          controls
        />
      );
    }

    if (post.media.type.startsWith('audio/')) {
      return (
        <audio
          src={post.media.url}
          className="w-full mt-2"
          controls
        />
      );
    }

    // Para documentos, mostrar un enlace
    return (
      <a
        href={post.media.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        📎 {post.media.name}
      </a>
    );
  };

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Mensaje de error */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Contenido multimedia */}
      {renderMedia()}

      {/* Contenido del post */}
      <div className="p-6">
        <Link to={`/post/${post.id}`}>
          <h2 className="text-xl font-bold mb-2 hover:text-primary">
            {post.title}
          </h2>
        </Link>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {post.category}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.content}
        </p>

        {/* Barra de acciones */}
        <div className="flex justify-between items-center pt-4 border-t">
          {/* Reacciones */}
          <div className="flex space-x-4">
            {reactions.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className="group flex items-center space-x-1"
                disabled={loading}
                title={label}
              >
                <span className="transform group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <span className="text-sm text-gray-500">
                  {post.reactions[type] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            {/* Botón de comentarios */}
            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary px-3 py-1 rounded-full hover:bg-gray-100"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments?.length || 0} Comentarios</span>
            </Link>

            <button
              onClick={() => window.location.href = `/editar-post/${post.id}`}
              className="text-gray-500 hover:text-primary px-3 py-1 rounded-full hover:bg-gray-100"
              disabled={loading}
            >
              <Edit className="w-5 h-5" />
            </button>

            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 px-3 py-1 rounded-full hover:bg-gray-100"
              disabled={loading}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">
              ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
