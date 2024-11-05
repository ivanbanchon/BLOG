// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { setupInitialData } from './utils/initialData';

// Función para iniciar la aplicación
const startApp = async () => {
  try {
    // Inicializar datos
    await setupInitialData();
    
    // Obtener el elemento raíz
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Elemento root no encontrado');
    }

    // Crear raíz de React
    const root = createRoot(container);

    // Renderizar la aplicación
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    
    // Mostrar error al usuario
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="
          padding: 20px;
          margin: 20px;
          background-color: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #991b1b;
          text-align: center;
        ">
          <h1 style="margin-bottom: 10px;">Error al iniciar la aplicación</h1>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
};

// Iniciar la aplicación
startApp();