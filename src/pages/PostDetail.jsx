// src/pages/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, Heart, Star, Coffee, Edit, 
  Trash2, Share2, MessageSquare, Link as LinkIcon 
} from 'lucide-react';
import CommentSection from '../components/CommentSection';
import { Alert } from '../components/Alert';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';

// Clase para manejar los detalles del post
class PostDetailManager extends BaseInteractionManager {
  constructor(post) {
    super();
    this.post = post;
  }

  // Lista de reacciones disponibles
  static REACTIONS = [
    { type: 'like', icon: <ThumbsUp className="w-6 h-6" />, label: 'Me gusta' },
    { type: 'love', icon: <Heart className="w-6 h-6" />, label: 'Me encanta' },
    { type: 'wow', icon: <Star className="w-6 h-6" />, label: 'Asombro' },
    { type: 'thinking', icon: <Coffee className="w-6 h-6" />, label: 'Pensativo' }
  ];

  // Método para obtener el conteo total de reacciones
  getTotalReactions() {
    try {
      return Object.values(this.post.reactions)
        .reduce((sum, count) => sum + count, 0);
    } catch (error) {
      this.handleError(error, 'obtener total de reacciones');
      return 0;
    }
  }

  // Método para validar una reacción
  validateReaction(type) {
    try {
      if (!PostDetailManager.REACTIONS.find(r => r.type === type)) {
        throw new Error('Tipo de reacción inválida');
      }
      return true;
    } catch (error) {
      this.handleError(error, 'validar reacción');
      return false;
    }
  }

  // Método para compartir el post
  static async sharePost(url) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Compartir post',
          url: url
        });
        return true;
      }
      
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      this.handleError(error, 'compartir post');
      return false;
    }
  }
}

const PostDetail = ({ posts, setPosts }) => {
  // Estados
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alert, setAlert] = useState(null);

  // Hooks de navegación y parámetros
  const { id } = useParams();
  const navigate = useNavigate();

  // Crear instancia del manager cuando el post esté disponible
  const postManager = post ? new PostDetailManager(post) : null;

  // Efecto para cargar el post
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const foundPost = posts.find(p => p.id === parseInt(id));
        
        if (!foundPost) {
          throw new Error('Post no encontrado');
        }

        setPost(foundPost);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, posts]);

  // Manejador para reacciones
  const handleReaction = async (type) => {
    try {
      if (!postManager.validateReaction(type)) {
        throw new Error('Reacción inválida');
      }

      const updatedPost = {
        ...post,
        reactions: {
          ...post.reactions,
          [type]: (post.reactions[type] || 0) + 1
        }
      };

      setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
      setPost(updatedPost);

      showAlert('success', '¡Reacción registrada!');
    } catch (error) {
      showAlert('error', 'Error al registrar reacción');
    }
  };

  // Manejador para compartir
  const handleShare = async () => {
    try {
      const success = await PostDetailManager.sharePost(window.location.href);
      if (success) {
        showAlert('success', 'Enlace copiado al portapapeles');
      }
    } catch (error) {
      showAlert('error', 'Error al compartir el post');
    }
  };

  // Manejador para eliminar
  const handleDelete = async () => {
    try {
      if (!showDeleteConfirm) {
        setShowDeleteConfirm(true);
        return;
      }

      setPosts(prev => prev.filter(p => p.id !== post.id));
      showAlert('success', 'Post eliminado exitosamente');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      showAlert('error', 'Error al eliminar el post');
    }
  };

  // Función auxiliar para mostrar alertas
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert type="error">
          {error}
          <button
            onClick={() => navigate('/')}
            className="ml-4 underline hover:text-primary"
          >
            Volver al inicio
          </button>
        </Alert>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Encabezado del post */}
        <header className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/editar-post/${post.id}`)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-500"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
              {post.category}
            </span>
          </div>
        </header>

        {/* Contenido del post */}
        <div className="p-6">
          {/* Imagen del post */}
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          )}

          {/* Contenido del post */}
          <div className="prose max-w-none mb-6">
            {post.content}
          </div>

          {/* Enlaces del post */}
          {post.links?.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Enlaces relacionados:</h3>
              <ul className="space-y-2">
                {post.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Barra de reacciones */}
          <div className="flex justify-between items-center py-4 border-t border-b">
            <div className="flex space-x-4">
              {PostDetailManager.REACTIONS.map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className="group flex flex-col items-center"
                  title={label}
                >
                  <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    {icon}
                  </div>
                  <span className="text-sm text-gray-500">
                    {post.reactions[type] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Compartir"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <div className="flex items-center text-gray-500">
                <MessageSquare className="w-5 h-5 mr-1" />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Sección de comentarios */}
          <div className="mt-8">
            <CommentSection
              post={post}
              onUpdatePost={(updatedPost) => {
                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                setPost(updatedPost);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">
              ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
          className="fixed bottom-4 right-4 z-50"
        >
          {alert.message}
        </Alert>
      )}
    </article>
  );
};

export default PostDetail;