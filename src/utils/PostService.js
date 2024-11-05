// src/utils/PostService.js
import Storage from './storage';

export class PostService {
  // Constantes de configuración
  static STORAGE_KEY = 'blog_posts';
  static SORT_ORDER = 'LIFO';

  // Definición de reacciones disponibles
  static REACTIONS = {
    like: { emoji: '👍', label: 'Me gusta' },
    love: { emoji: '❤️', label: 'Me encanta' },
    wow: { emoji: '😲', label: 'Asombro' },
    thinking: { emoji: '🤔', label: 'Pensativo' }
  };

  // Validación del post
  static validatePost(postData) {
    const errors = {};

    // Validar campos requeridos
    if (!postData.title?.trim()) {
      errors.title = 'El título es requerido';
    }
    if (!postData.content?.trim()) {
      errors.content = 'El contenido es requerido';
    }
    if (!postData.category?.trim()) {
      errors.category = 'La categoría es requerida';
    }

    // Validar multimedia si existe
    if (postData.media) {
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'video/mp4', 'video/webm',
        'audio/mp3', 'audio/wav',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!validTypes.includes(postData.media.type)) {
        errors.media = 'Tipo de archivo no soportado';
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (postData.media.size > maxSize) {
        errors.media = 'El archivo es demasiado grande (máximo 10MB)';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new Error(JSON.stringify(errors));
    }
  }

  // Obtener todos los posts
  static async getPosts() {
    try {
      const posts = await Storage.get(this.STORAGE_KEY) || [];
      return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // LIFO
    } catch (error) {
      console.error('Error al obtener posts:', error);
      throw new Error('Error al cargar los posts');
    }
  }

  // Obtener un post específico
  static async getPostById(id) {
    try {
      const posts = await this.getPosts();
      const post = posts.find(p => p.id === id);
      if (!post) throw new Error('Post no encontrado');
      return post;
    } catch (error) {
      console.error('Error al obtener post:', error);
      throw new Error('Error al cargar el post');
    }
  }

  // Crear nuevo post
  static async createPost(postData) {
    try {
      this.validatePost(postData);

      const posts = await this.getPosts();
      const newPost = {
        id: Date.now(),
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: {
          like: 0,
          love: 0,
          wow: 0,
          thinking: 0
        },
        comments: []
      };

      // Procesar archivo multimedia si existe
      if (postData.media) {
        newPost.media = {
          url: URL.createObjectURL(postData.media),
          type: postData.media.type,
          name: postData.media.name
        };
      }

      posts.unshift(newPost); // LIFO implementation
      await Storage.set(this.STORAGE_KEY, posts);
      return newPost;
    } catch (error) {
      console.error('Error al crear post:', error);
      throw error;
    }
  }

  // Actualizar post existente
  static async updatePost(id, postData) {
    try {
      this.validatePost(postData);

      const posts = await this.getPosts();
      const index = posts.findIndex(p => p.id === id);
      
      if (index === -1) throw new Error('Post no encontrado');

      // Mantener datos que no se deben sobrescribir
      const updatedPost = {
        ...posts[index],
        ...postData,
        id: posts[index].id, // Asegurar que el ID no cambie
        updatedAt: new Date().toISOString(),
        reactions: posts[index].reactions, // Mantener reacciones
        comments: posts[index].comments // Mantener comentarios
      };

      // Procesar nuevo archivo multimedia si existe
      if (postData.media) {
        if (posts[index].media?.url) {
          URL.revokeObjectURL(posts[index].media.url);
        }
        updatedPost.media = {
          url: URL.createObjectURL(postData.media),
          type: postData.media.type,
          name: postData.media.name
        };
      }

      posts[index] = updatedPost;
      await Storage.set(this.STORAGE_KEY, posts);
      return updatedPost;
    } catch (error) {
      console.error('Error al actualizar post:', error);
      throw error;
    }
  }

  // Eliminar post
  static async deletePost(id) {
    try {
      const posts = await this.getPosts();
      const post = posts.find(p => p.id === id);
      
      if (!post) throw new Error('Post no encontrado');

      // Limpiar recursos multimedia
      if (post.media?.url) {
        URL.revokeObjectURL(post.media.url);
      }

      const filteredPosts = posts.filter(p => p.id !== id);
      await Storage.set(this.STORAGE_KEY, filteredPosts);
      return true;
    } catch (error) {
      console.error('Error al eliminar post:', error);
      throw new Error('Error al eliminar el post');
    }
  }

  // Gestionar reacciones
  static async addReaction(postId, reactionType) {
    try {
      if (!Object.keys(this.REACTIONS).includes(reactionType)) {
        throw new Error('Tipo de reacción no válido');
      }

      const posts = await this.getPosts();
      const index = posts.findIndex(p => p.id === postId);
      
      if (index === -1) throw new Error('Post no encontrado');

      posts[index] = {
        ...posts[index],
        reactions: {
          ...posts[index].reactions,
          [reactionType]: (posts[index].reactions[reactionType] || 0) + 1
        },
        updatedAt: new Date().toISOString()
      };

      await Storage.set(this.STORAGE_KEY, posts);
      return posts[index];
    } catch (error) {
      console.error('Error al agregar reacción:', error);
      throw new Error('Error al procesar la reacción');
    }
  }

  // Obtener posts destacados
  static async getFeaturedPosts() {
    try {
      const posts = await this.getPosts();
      return posts
        .sort((a, b) => {
          const reactionsA = Object.values(a.reactions).reduce((sum, val) => sum + val, 0);
          const reactionsB = Object.values(b.reactions).reduce((sum, val) => sum + val, 0);
          return reactionsB - reactionsA;
        })
        .slice(0, 5);
    } catch (error) {
      console.error('Error al obtener posts destacados:', error);
      throw new Error('Error al cargar posts destacados');
    }
  }
}

export default PostService;