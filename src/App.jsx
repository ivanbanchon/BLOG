import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación de componentes de páginas
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Importación de componentes
import Header from './components/Header';
import Footer from './components/Footer';

// Importación de servicios y utilidades
import { PostService } from './utils/PostService';
import { Alert } from './components/Alert';
import { BaseInteractionManager } from './utils/BaseInteractionManager';
import { AuthProvider, useAuth } from './context/AuthContext';

class AppStateManager extends BaseInteractionManager {
  static async loadPosts() {
    try {
      const posts = await PostService.getPosts();
      return {
        success: true,
        data: posts,
        error: null
      };
    } catch (error) {
      this.handleError(error, 'cargar posts');
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  static validateCategory(category, availableCategories) {
    try {
      if (!category) return 'all';
      return availableCategories.includes(category) ? category : 'all';
    } catch (error) {
      this.handleError(error, 'validar categoría');
      return 'all';
    }
  }
}

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await AppStateManager.loadPosts();
      
      if (result.success) {
        setPosts(result.data);
      } else {
        showAlert('error', 'Error al cargar los posts: ' + result.error);
      }
    } catch (error) {
      showAlert('error', 'Error inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleDeletePost = async (postId) => {
    try {
      setLoading(true);
      await PostService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      showAlert('success', 'Post eliminado exitosamente');
      return true;
    } catch (error) {
      showAlert('error', 'Error al eliminar el post: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      setLoading(true);
      
      if (updatedPost.isReactionUpdate) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === updatedPost.id 
              ? { ...post, reactions: updatedPost.reactions }
              : post
          )
        );
        return true;
      }
      
      const result = await PostService.updatePost(updatedPost.id, updatedPost);
      setPosts(prevPosts => 
        prevPosts.map(post => post.id === updatedPost.id ? result : post)
      );
      return true;
    } catch (error) {
      showAlert('error', 'Error al actualizar el post: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    try {
      const validCategory = AppStateManager.validateCategory(category, [
        'all',
        'trajes',
        'ocio',
        'recompensas',
        'aventura',
        'libros'
      ]);
      setSelectedCategory(validCategory);
    } catch (error) {
      showAlert('error', 'Error al cambiar categoría');
    }
  };

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <div className="min-h-screen flex flex-col">
              <Header 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
              <main className="flex-grow container mx-auto px-4 py-8">
                {alert && (
                  <Alert
                    type={alert.type}
                    onClose={() => setAlert(null)}
                    className="mb-4"
                  >
                    {alert.message}
                  </Alert>
                )}
                <Home
                  posts={posts}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={handleCategoryChange}
                  loading={loading}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                />
              </main>
              <Footer />
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/crear-post"
        element={
          <PrivateRoute>
            <div className="min-h-screen flex flex-col">
              <Header 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
              <main className="flex-grow container mx-auto px-4 py-8">
                <CreatePost
                  setPosts={setPosts}
                  onError={msg => showAlert('error', msg)}
                  onSuccess={msg => showAlert('success', msg)}
                />
              </main>
              <Footer />
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/editar-post/:id"
        element={
          <PrivateRoute>
            <div className="min-h-screen flex flex-col">
              <Header 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
              <main className="flex-grow container mx-auto px-4 py-8">
                <EditPost
                  posts={posts}
                  setPosts={setPosts}
                  onError={msg => showAlert('error', msg)}
                  onSuccess={msg => showAlert('success', msg)}
                />
              </main>
              <Footer />
            </div>
          </PrivateRoute>
        }
      />

      <Route
        path="/post/:id"
        element={
          <PrivateRoute>
            <div className="min-h-screen flex flex-col">
              <Header 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
              <main className="flex-grow container mx-auto px-4 py-8">
                <PostDetail
                  posts={posts}
                  setPosts={setPosts}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                  onError={msg => showAlert('error', msg)}
                  onSuccess={msg => showAlert('success', msg)}
                />
              </main>
              <Footer />
            </div>
          </PrivateRoute>
        }
      />

      {/* Ruta por defecto para manejar páginas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;