// src/utils/CommentService.js
import Storage from './storage';
import PostService from './PostService';

class CommentService {
  static SORT_ORDER = 'LIFO';

  static validateComment(commentData) {
    try {
      if (!commentData.content?.trim()) {
        throw new Error('El contenido del comentario es requerido');
      }
      if (commentData.content.length > 500) {
        throw new Error('El comentario no puede exceder los 500 caracteres');
      }
      if (!commentData.author?.trim()) {
        throw new Error('El autor del comentario es requerido');
      }
      return true;
    } catch (error) {
      throw new Error('Error de validación: ' + error.message);
    }
  }

  static async addComment(postId, commentData) {
    try {
      this.validateComment(commentData);
      const posts = await PostService.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        throw new Error('Post no encontrado');
      }

      const newComment = {
        id: Date.now(),
        ...commentData,
        createdAt: new Date().toISOString()
      };

      posts[postIndex].comments.unshift(newComment);
      await Storage.set(PostService.STORAGE_KEY, posts);
      
      return newComment;
    } catch (error) {
      throw new Error('Error al añadir comentario: ' + error.message);
    }
  }

  static async getComments(postId) {
    try {
      const post = await PostService.getPostById(postId);
      return post.comments || [];
    } catch (error) {
      throw new Error('Error al obtener comentarios: ' + error.message);
    }
  }

  static async updateComment(postId, commentId, updatedContent) {
    try {
      this.validateComment(updatedContent);
      const posts = await PostService.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        throw new Error('Post no encontrado');
      }

      const commentIndex = posts[postIndex].comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw new Error('Comentario no encontrado');
      }

      posts[postIndex].comments[commentIndex] = {
        ...posts[postIndex].comments[commentIndex],
        ...updatedContent,
        updatedAt: new Date().toISOString()
      };

      await Storage.set(PostService.STORAGE_KEY, posts);
      return posts[postIndex].comments[commentIndex];
    } catch (error) {
      throw new Error('Error al actualizar comentario: ' + error.message);
    }
  }

  static async deleteComment(postId, commentId) {
    try {
      const posts = await PostService.getPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        throw new Error('Post no encontrado');
      }

      posts[postIndex].comments = posts[postIndex].comments.filter(c => c.id !== commentId);
      await Storage.set(PostService.STORAGE_KEY, posts);
    } catch (error) {
      throw new Error('Error al eliminar comentario: ' + error.message);
    }
  }

  static async getCommentCount(postId) {
    try {
      const comments = await this.getComments(postId);
      return comments.length;
    } catch (error) {
      throw new Error('Error al obtener cantidad de comentarios: ' + error.message);
    }
  }
}

export default CommentService;
