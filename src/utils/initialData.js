// src/utils/initialData.jsx
import PostService from './PostService';
import Storage from './storage';

const INITIAL_POSTS = [
  {
    title: 'Set Legendario: Dragón Celestial 2024',
    content: `El nuevo set legendario "Dragón Celestial" llega con efectos nunca antes vistos...`,
    category: 'trajes',
    image: ''
  },
  {
    title: '¡Nuevos Mini-Juegos en la Sala de Espera!',
    content: `Nuevos mini-juegos para disfrutar mientras esperas...`,
    category: 'ocio',
    image: ''
  },
  // ... otros posts sin la categoría 'free fire'
];

export const setupInitialData = async () => {
  try {
    const existingPosts = await PostService.getPosts();

    // Solo inicializar si no hay posts
    if (!existingPosts || existingPosts.length === 0) {
      for (const post of INITIAL_POSTS) {
        await PostService.createPost(post);
      }

      // Aquí guardamos los posts iniciales en localStorage usando Storage
      await Storage.set('posts', INITIAL_POSTS);
    }
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
};

export default setupInitialData;
