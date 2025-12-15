import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const HomeView = ({ onNavigate }) => {
  const features = [
    {
      title: 'Simulación Epidemiológica',
      description: 'Modelos SIR y SEIR con parámetros personalizables y datos reales de Bolivia',
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      action: () => onNavigate('simulation'),
      stats: 'Modelos SIR/SEIR disponibles'
    },
    {
      title: 'Fundamentos Matemáticos',
      description: 'Ecuaciones diferenciales, teoría del modelo y metodología RK4',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      action: () => onNavigate('mathematics'),
      stats: 'Teoría completa con LaTeX'
    },
    {
      title: 'Análisis Avanzado',
      description: 'Métricas epidemiológicas, alertas tempranas e impacto económico',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      action: () => onNavigate('analysis'),
      stats: 'Sistema de 5 niveles de riesgo'
    }
  ];

  const quickStats = [
    { label: 'Departamentos', value: '9', sublabel: 'Bolivia' },
    { label: 'Enfermedades', value: '15', sublabel: 'Perfiles cargados' },
    { label: 'Modelos', value: '2', sublabel: 'SIR y SEIR' },
    { label: 'Escenarios', value: '4', sublabel: 'Probabilísticos' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 text-white py-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Activity className="w-14 h-14" />
            </div>
          </motion.div>
          
          <motion.div
            className="mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-4xl font-bold mb-2">SEDES</div>
            <div className="text-lg">Servicio Departamental de Salud</div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Sistema de Modelado Epidemiológico
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-white/90"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Herramienta profesional de análisis matemático para toma de decisiones en salud pública - Bolivia
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => onNavigate('simulation')}
              className="px-8 py-4 bg-white text-red-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Iniciar Simulación
            </button>
            <button
              onClick={() => onNavigate('mathematics')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
            >
              Ver Fundamentos
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Módulos del Sistema</h2>
          <p className="text-xl text-gray-600">Selecciona el módulo que necesitas</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={feature.action}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{feature.stats}</span>
                    <span className="text-red-600 font-semibold group-hover:translate-x-2 transition-transform">
                      Abrir →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-gray-800 mb-6">Sobre el Sistema</h3>
              <p className="text-gray-600 mb-4">
                Plataforma integral de modelado epidemiológico desarrollada específicamente para las necesidades del Servicio Departamental de Salud (SEDES) de Bolivia.
              </p>
              <p className="text-gray-600 mb-4">
                Utiliza ecuaciones diferenciales ordinarias resueltas mediante el método Runge-Kutta de cuarto orden (RK4) con precisión O(h⁵), garantizando resultados confiables para la toma de decisiones.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Datos reales de capacidad hospitalaria de 9 departamentos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Perfiles de enfermedades calibrados con datos bolivianos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Sistema de alertas tempranas con 5 niveles de riesgo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Análisis de impacto económico y escenarios probabilísticos
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl"
            >
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Características Principales</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-gray-800">Modelos Compartimentales</div>
                    <div className="text-sm text-gray-600">SIR y SEIR con parámetros personalizables</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-gray-800">Intervenciones Sanitarias</div>
                    <div className="text-sm text-gray-600">Modelado de cuarentena, vacunación y distanciamiento</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-gray-800">Validación en Tiempo Real</div>
                    <div className="text-sm text-gray-600">Alertas automáticas de riesgo epidemiológico</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <div className="font-semibold text-gray-800">Reportes Profesionales</div>
                    <div className="text-sm text-gray-600">Generación de PDF con análisis completo</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
