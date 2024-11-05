import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';
import { Home, PlusCircle } from 'lucide-react';

class NavigationManager extends BaseInteractionManager {
  static CATEGORIES = [
    {
      id: 'trajes',
      name: 'Trajes',
      icon: '👕',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      description: 'Colecciones y novedades en trajes'
    },
    {
      id: 'ocio',
      name: 'Ocio',
      icon: '🎯',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      description: 'Actividades y entretenimiento'
    },
    {
      id: 'recompensas',
      name: 'Recompensas',
      icon: '🎁',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      description: 'Eventos y premios disponibles'
    },
    {
      id: 'aventura',
      name: 'Aventura',
      icon: '🗺️',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      description: 'Misiones y modos de juego'
    },
    {
      id: 'libros',
      name: 'Libros',
      icon: '📚',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      description: 'Guías y tutoriales'
    }
  ];

  static getCategoryById(id) {
    try {
      return this.CATEGORIES.find(cat => cat.id === id) || null;
    } catch (error) {
      this.handleError(error, 'obtener categoría');
      return null;
    }
  }
}

const Header = ({ selectedCategory, onCategoryChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
      navigate('/');
    }
  };

  const isCategoryActive = (categoryId) => {
    if (location.pathname.startsWith('/categoria/')) {
      return location.pathname === `/categoria/${categoryId}`;
    }
    return location.pathname === '/' && selectedCategory === categoryId;
  };

  return (
    <header className="bg-white shadow-lg">
      {/* Barra principal */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors"
          >
            NOVEDADES FICHERITOS
          </Link>

          {/* Botones de navegación */}
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium
                ${location.pathname === '/' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Home className="w-5 h-5" />
              <span>Inicio</span>
            </Link>
            <Link
              to="/crear-post"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium
                ${location.pathname === '/crear-post' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Crear Post</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Cinta de categorías */}
      <div
        className={`
          transition-all duration-300
          ${isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-md' : 'bg-gray-50'}
        `}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center space-x-4">
            {NavigationManager.CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  px-4 py-2 rounded-lg transition-all duration-200
                  ${isCategoryActive(category.id) ? `${category.color} text-white` : ''}
                  ${!isCategoryActive(category.id) ? category.hoverColor : ''}
                  hover:scale-105 transform group
                `}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="font-medium">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;