// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Usuarios iniciales (simulando una base de datos)
const initialUsers = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@blog.com',
    password: 'admin123',
    role: 'admin'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem('users');
      return savedUsers ? JSON.parse(savedUsers) : initialUsers;
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
      return initialUsers;
    }
  });

  // Cargar usuario autenticado al inicio
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persistir usuarios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }, [users]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const register = async ({ name, email, password }) => {
    // Validaciones
    if (!name || !email || !password) {
      throw new Error('Todos los campos son obligatorios');
    }

    if (!validateEmail(email)) {
      throw new Error('El formato del email no es válido');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el email ya está registrado
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este email ya está registrado');
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'user'
    };

    setUsers(prev => [...prev, newUser]);

    // Auto login después del registro
    const userInfo = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));

    return userInfo;
  };

  const login = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};