import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp, Heart, Star, Coffee,
  Edit, Trash2, MessageSquare
} from 'lucide-react';
import { Alert } from './Alert';
import ConfirmDialog from './ConfirmDialog';

const BlogEntry = ({ post, onDelete, onUpdate }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alert, setAlert] = useState(null);

  const reactions = [
    { type: 'like', icon: <ThumbsUp className="w-5 h-5" />, label: 'Me gusta' },
    { type: 'love', icon: <Heart className="w-5 h-5" />, label: 'Me encanta' },
    { type: 'wow', icon: <Star className="w-5 h-5" />, label: 'Asombro' },
    { type: 'thinking', icon: <Coffee className="w-5 h-5" />, label: 'Pensativo' }
  ];

  const handleDelete = async () => {
    try {
      await onDelete(post.id);
      setShowDeleteConfirm(false);
      setAlert({
        type: 'success',
        message: 'Post eliminado exitosamente',
        autoClose: true
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al eliminar el post. Inténtalo de nuevo.',
        autoClose: true
      });
    }
  };

  const handleReaction = async (type) => {
    try {
      const updatedPost = {
        ...post,
        reactions: {
          ...post.reactions,
          [type]: (post.reactions?.[type] || 0) + 1
        },
        isReactionUpdate: true
      };
      await onUpdate(updatedPost);
      setAlert({
        type: 'success',
        message: '¡Gracias por tu reacción!',
        autoClose: true
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'No se pudo registrar tu reacción. Inténtalo de nuevo.',
        autoClose: true
      });
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Título centrado en un banner */}
      <div className="bg-primary/5 py-10 px-6 flex flex-col items-center justify-center">
        <Link to={`/post/${post.id}`}>
          <h2 className="text-2xl font-bold text-center text-primary hover:text-primary/90 transition-colors">
            {post.title}
          </h2>
        </Link>
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.content}
        </p>

        {/* Acciones */}
        <div className="flex justify-between items-center pt-4 border-t">
          {/* Reacciones */}
          <div className="flex space-x-4">
            {reactions.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className="group flex items-center space-x-1"
                title={label}
              >
                <span className="transform group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <span className="text-sm text-gray-500">
                  {post.reactions?.[type] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments?.length || 0}</span>
            </Link>

            <Link
              to={`/editar-post/${post.id}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Editar post"
            >
              <Edit className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-500"
              title="Eliminar post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert y ConfirmDialog */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
          className="alert-fixed"
          autoClose={alert.autoClose}
        >
          {alert.message}
        </Alert>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        type="DELETE"
        title="Eliminar Post"
        message="¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer."
      />
    </article>
  );
};

export default BlogEntry;