import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Play } from 'lucide-react';

const SIRControls = ({ 
  beta, 
  onBetaChange, 
  gamma, 
  onGammaChange, 
  initialS, 
  onInitialSChange, 
  initialI, 
  onInitialIChange, 
  onSimulate, 
  onReset 
}) => {
  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">¡Juega con la Epidemia!</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Velocidad de Contagio (β)</label>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={beta}
            onChange={(e) => onBetaChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-600">{beta.toFixed(3)}</span>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Velocidad de Recuperación (γ)</label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={gamma}
            onChange={(e) => onGammaChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-600">{gamma.toFixed(3)}</span>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gente Sana al Inicio (S₀)</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="10"
            value={initialS}
            onChange={(e) => onInitialSChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-600">{initialS}</span>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gente Infectada al Inicio (I₀)</label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={initialI}
            onChange={(e) => onInitialIChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-600">{initialI}</span>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <motion.button
            onClick={onSimulate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            ¡Simular!
          </motion.button>
          <motion.button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SIRControls;