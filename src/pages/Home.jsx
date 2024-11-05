//src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogList from '../components/BlogList';
import { Loader } from 'lucide-react';
import { Alert } from '../components/Alert';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';
class HomeManager extends BaseInteractionManager {
  constructor(posts) {
    super();
    this.posts = posts;
  }

  getMostCommented() {
    try {
      return [...this.posts]
        .sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
        .slice(0, 5);
    } catch (error) {
      this.handleError(error, 'obtener posts más comentados');
      return [];
    }
  }

  getMostReacted() {
    try {
      return [...this.posts]
        .sort((a, b) => {
          const totalA = Object.values(a.reactions || {}).reduce((sum, val) => sum + val, 0);
          const totalB = Object.values(b.reactions || {}).reduce((sum, val) => sum + val, 0);
          return totalB - totalA;
        })
        .slice(0, 5);
    } catch (error) {
      this.handleError(error, 'obtener posts más populares');
      return [];
    }
  }

  getFeaturedPost() {
    try {
      const postsWithImages = this.posts.filter(post => post.image);
      if (postsWithImages.length === 0) return null;
      return postsWithImages[Math.floor(Math.random() * postsWithImages.length)];
    } catch (error) {
      this.handleError(error, 'obtener post destacado');
      return null;
    }
  }

  searchPosts(searchTerm) {
    if (!searchTerm?.trim()) return this.posts;
    
    const term = searchTerm.toLowerCase();
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.category.toLowerCase().includes(term)
    );
  }
}

// ... (mantener las importaciones y la clase HomeManager igual)

const Home = ({ posts, selectedCategory, setSelectedCategory, loading, onDelete, onUpdate }) => {
  const [homeManager, setHomeManager] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [alert, setAlert] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    if (posts.length > 0) {
      const manager = new HomeManager(posts);
      setHomeManager(manager);

      const updateFeaturedPost = () => {
        const randomIndex = Math.floor(Math.random() * posts.length);
        setFeaturedPost(posts[randomIndex]);
      };

      updateFeaturedPost();
      const interval = setInterval(updateFeaturedPost, 10000);
      return () => clearInterval(interval);
    }
  }, [posts]);

  // Actualizar posts filtrados cuando cambia la categoría
  useEffect(() => {
    setFilteredPosts(
      selectedCategory && selectedCategory !== 'all'
        ? posts.filter(post => post.category === selectedCategory)
        : posts
    );
  }, [selectedCategory, posts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex">
        {/* Sidebar izquierdo */}
        <aside className="w-64 flex-shrink-0 mr-8">
          {/* Sección Más comentarios */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <h2 className="font-bold text-xl mb-4">MÁS COMENTARIOS</h2>
            <div className="space-y-4">
              {homeManager?.getMostCommented().map(post => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <h3 className="font-medium line-clamp-2">{post.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {post.comments?.length || 0} comentarios
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sección Más populares */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="font-bold text-xl mb-4">MÁS POPULARES</h2>
            <div className="space-y-4">
              {homeManager?.getMostReacted().map(post => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <h3 className="font-medium line-clamp-2">{post.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {Object.values(post.reactions || {}).reduce((sum, val) => sum + val, 0)} reacciones
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          {/* Post Destacado */}
          {featuredPost && (
            <div className="mb-8 relative rounded-lg overflow-hidden shadow-lg group">
              <Link to={`/post/${featuredPost.id}`} className="block">
                <div 
                  className="relative h-[400px]"
                  style={{
                    backgroundImage: 'url(/images/maquina.jpg)', // Imagen de fondo por defecto
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm">
                          Destacado
                        </span>
                        <span className="text-white/80 text-sm">
                          {featuredPost.category}
                        </span>
                      </div>
                      <h2 className="text-white text-3xl font-bold mb-2">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/90 line-clamp-2 mb-4">
                        {featuredPost.content}
                      </p>
                      <div className="flex items-center space-x-4 text-white/80 text-sm">
                        <span>{featuredPost.comments?.length || 0} comentarios</span>
                        <span>·</span>
                        <span>
                          {Object.values(featuredPost.reactions || {}).reduce((sum, val) => sum + val, 0)} reacciones
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Filtro de categorías */}
          <div className="mb-6">
            <div className="inline-block">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary bg-white shadow-sm"
              >
                <option value="all">Todas las categorías</option>
                {['free fire', 'trajes', 'ocio', 'recompensas', 'aventura', 'libros'].map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de posts */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <BlogList
              posts={filteredPosts}
              selectedCategory={selectedCategory}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          )}
        </main>
      </div>

      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
          className="fixed bottom-4 right-4 z-50"
          autoClose={alert.autoClose}
        >
          {alert.message}
        </Alert>
      )}
    </div>
  );
};

export default Home;