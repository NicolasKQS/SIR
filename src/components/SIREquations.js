import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shuffle, Calculator } from 'lucide-react';

const SIREquations = () => {
  const equations = [
    {
      title: "Cambio en Sanos (dS/dt)",
      description: "Los sanos se van cuando chocan con infectados; el virus los roba a una velocidad que depende de cuánto se mezclan, como un ladrón en una fiesta llena.",
      icon: TrendingDown,
      color: "from-green-400 to-red-500",
      step: "Tasa de pérdida = -β × (sanos / total) × infectados"
    },
    {
      title: "Cambio en Infectados (dI/dt)",
      description: "Ganan de los sanos que se contagian, pero pierden a los que se recuperan; aquí nace el pico, cuando los nuevos igualan a los que se van, como una ola que crece y cae.",
      icon: TrendingUp,
      color: "from-red-400 to-yellow-500",
      step: "Tasa neta = β × (sanos / total) × infectados - γ × infectados"
    },
    {
      title: "Cambio en Recuperados (dR/dt)",
      description: "Solo ganan de los infectados que salen adelante; acumulan como un contador de sobrevivientes, terminando cuando el virus se agota o todos están a salvo.",
      icon: Shuffle,
      color: "from-blue-400 to-purple-500",
      step: "Tasa de ganancia = γ × infectados"
    }
  ];

  return (
    <motion.section 
      className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-purple-50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Calculator className="w-10 h-10 text-indigo-600" />
          Ecuaciones Diferenciales del SIR Explicadas
        </motion.h2>
        <motion.p 
          className="text-center text-xl text-gray-700 mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Estas ecuaciones miden cómo cambian los grupos en tiempo real, sumando pedacitos infinitesimales (lo que estudias en clase) para predecir epidemias. β es contagio, γ recuperación: ¡ajusta y ve la magia diferencial!
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {equations.map((eq, index) => {
            const Icon = eq.icon;
            return (
              <motion.div
                key={eq.title}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className={`p-4 rounded-2xl mx-auto w-16 h-16 bg-gradient-to-br ${eq.color} mb-6 flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{eq.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{eq.description}</p>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-4 text-center">
                  <span className="font-mono text-lg text-gray-800 block">{eq.step}</span>
                  <small className="text-gray-500 block mt-1">(Donde dt es un tiempito pequeñito)</small>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-lg text-gray-700 mb-4">
            En clase, resuelve estas ODEs numéricamente (como Euler o Runge-Kutta) para ver por qué el SIR predice picos y fin de epidemias. ¡Tu simulación arriba lo hace por ti!
          </p>
          <motion.button 
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.querySelector('#graph-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ¡Simula con Ecuaciones!
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SIREquations;