import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import HomeView from './components/HomeView';
import MathematicsView from './components/MathematicsView';
import IntegratedSimulation from './components/IntegratedSimulation';
import SIRExplanation from './components/SIRExplanation';
import SIRFooter from './components/SIRFooter';
import "katex/dist/katex.min.css";

const App = () => {
  const [activeView, setActiveView] = useState('home');

  const renderView = () => {
    const viewVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    };

    switch (activeView) {
      case 'home':
        return (
          <motion.div
            key="home"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <HomeView onNavigate={setActiveView} />
          </motion.div>
        );
      
      case 'simulation':
        return (
          <motion.div
            key="simulation"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
          >
            <div className="py-8">
              <SIRExplanation />
              <IntegratedSimulation />
            </div>
          </motion.div>
        );
      
      case 'mathematics':
        return (
          <motion.div
            key="mathematics"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <MathematicsView />
          </motion.div>
        );
      
      case 'analysis':
        return (
          <motion.div
            key="analysis"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-16 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
                <div className="text-6xl mb-6">📊</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Vista de Análisis Avanzado</h2>
                <p className="text-gray-600 mb-8">
                  Las métricas avanzadas están disponibles en la sección de Simulación después de ejecutar un modelo.
                </p>
                <button
                  onClick={() => setActiveView('simulation')}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Ir a Simulación
                </button>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
      
      <SIRFooter />
    </div>
  );
};

export default App;