import React from 'react';
import { motion } from 'framer-motion';
import SIREquations from './SIREquations';
import { BookOpen, Calculator, TrendingUp } from 'lucide-react';

const MathematicsView = () => {
  const sections = [
    {
      title: 'Ecuaciones Diferenciales',
      description: 'Fundamentos matemáticos de los modelos compartimentales',
      icon: Calculator
    },
    {
      title: 'Número Reproductivo Básico',
      description: 'Cálculo y significado epidemiológico de R₀',
      icon: TrendingUp
    },
    {
      title: 'Método Numérico RK4',
      description: 'Runge-Kutta de cuarto orden para solución precisa',
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-4">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
                <span className="text-2xl font-bold">SEDES</span>
                <span className="text-sm ml-2 opacity-90">Bolivia</span>
              </div>
            </div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Fundamentos Matemáticos</h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Servicio Departamental de Salud - Base teórica de modelos epidemiológicos SIR y SEIR
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Info Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SIREquations />
        </motion.div>

        {/* Additional Information */}
        <motion.div
          className="mt-12 bg-white rounded-2xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Aplicaciones en Salud Pública</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Modelos Compartimentales</h3>
              <p className="text-gray-600 mb-4">
                Los modelos SIR y SEIR dividen a la población en compartimentos epidemiológicos que representan diferentes estados de salud. La transición entre compartimentos se rige por ecuaciones diferenciales ordinarias que capturan la dinámica de transmisión.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">S:</span>
                  <span>Susceptibles - Población en riesgo de infección</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">E:</span>
                  <span>Expuestos - Infectados en período de incubación (solo SEIR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">I:</span>
                  <span>Infectados - Individuos contagiosos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">R:</span>
                  <span>Recuperados - Inmunizados o fallecidos</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Parámetros Epidemiológicos</h3>
              <p className="text-gray-600 mb-4">
                Cada enfermedad se caracteriza por parámetros específicos que determinan su comportamiento epidemiológico. Estos valores se calibran con datos reales para cada contexto.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">β (beta):</span>
                  <span>Tasa de transmisión - Probabilidad de contagio por contacto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">γ (gamma):</span>
                  <span>Tasa de recuperación - Inversa del período infeccioso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">σ (sigma):</span>
                  <span>Tasa de progresión - Inversa del período de incubación (SEIR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">R₀:</span>
                  <span>Número reproductivo básico - Casos secundarios promedio</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Numerical Methods */}
        <motion.div
          className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Método Runge-Kutta (RK4)</h2>
          <p className="text-gray-700 mb-6">
            El método RK4 es un algoritmo numérico de alta precisión para resolver ecuaciones diferenciales ordinarias. Ofrece error de truncamiento de orden O(h⁵), lo que garantiza resultados confiables para simulaciones epidemiológicas.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">O(h⁵)</div>
              <div className="text-sm font-semibold text-gray-700">Precisión de truncamiento</div>
              <div className="text-xs text-gray-500 mt-1">Error proporcional a h⁵</div>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">4</div>
              <div className="text-sm font-semibold text-gray-700">Evaluaciones por paso</div>
              <div className="text-xs text-gray-500 mt-1">k₁, k₂, k₃, k₄</div>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">0.2</div>
              <div className="text-sm font-semibold text-gray-700">Tamaño de paso (días)</div>
              <div className="text-xs text-gray-500 mt-1">Balance precisión/velocidad</div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Ventajas del RK4 en Epidemiología</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Alta precisión para sistemas no lineales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Estabilidad numérica comprobada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Balance óptimo precisión/costo computacional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Método estándar en literatura científica</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MathematicsView;
