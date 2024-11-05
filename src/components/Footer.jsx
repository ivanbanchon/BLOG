import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Instagram, Twitter } from 'lucide-react';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';

class FooterManager extends BaseInteractionManager {
  static QUICK_LINKS = [
    { to: '/', label: 'Inicio' },
    { to: '/crear-post', label: 'Crear Post' }
  ];

  static SOCIAL_LINKS = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' }
  ];

  static getCurrentYear() {
    try {
      return new Date().getFullYear();
    } catch (error) {
      this.handleError(error, 'obtener año actual');
      return '2024';
    }
  }
}

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Columna 1: Logo e información */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4">NOVEDADES FICHERITOS</h3>
            <p className="text-gray-300 mb-4">
              Tu fuente de información sobre Free Fire, trajes, ocio y mucho más.
            </p>
            {/* Redes sociales */}
            <div className="flex justify-center md:justify-start space-x-4">
              {FooterManager.SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Columna 3: Enlaces rápidos */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {FooterManager.QUICK_LINKS.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors flex items-center justify-center md:justify-end group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-700 pt-8">
          {/* Copyright y créditos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            {/* Hecho con amor */}
            <div className="text-gray-300 text-sm flex items-center justify-center md:justify-start">
              Hecho con <Heart className="w-4 h-4 mx-1 text-red-500 animate-pulse" /> por Mi
            </div>
            
            {/* Copyright centrado */}
            <div className="text-gray-300 text-sm">
              © {FooterManager.getCurrentYear()} NOVEDADES FICHERITOS. 
              <br className="md:hidden" />
              Todos los derechos reservados.
            </div>

            {/* Versión */}
            <div className="text-gray-400 text-sm md:text-right">
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;