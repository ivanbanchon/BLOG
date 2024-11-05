import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import '../styles/AuthBackground.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 }
  }
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY);
    };

    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      document.querySelector('.particles-container')?.appendChild(particle);

      let posX = x;
      let posY = y;
      let opacity = 1;
      let lastTime = performance.now();

      function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        posX += dx * deltaTime;
        posY += dy * deltaTime;
        opacity -= deltaTime * 1;

        if (opacity <= 0) {
          particle.remove();
          return;
        }

        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.opacity = opacity;

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-background">
      <div className="animated-gradient" />
      <div className="particles-container" />
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-md w-full space-y-8 glass-card p-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <motion.h2
              className="text-3xl font-extrabold text-center form-title"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Registro en NOVEDADES FICHERITOS
            </motion.h2>
            <p className="mt-2 text-center text-sm form-text">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-300 hover:text-blue-200 transition-colors duration-200"
              >
                Inicia sesión
              </Link>
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                type="error"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          <motion.form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            variants={itemVariants}
          >
            <div className="rounded-md shadow-sm space-y-4">
              {/* Campo Nombre */}
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="sr-only">
                  Nombre
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transition-colors duration-200" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 input-field"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              {/* Campo Email */}
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 input-field"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              {/* Campo Contraseña */}
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 input-field"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              {/* Campo Confirmar Contraseña */}
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-blue-300 transition-colors duration-200" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 input-field"
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-between space-x-4">
              <motion.button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al login
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;