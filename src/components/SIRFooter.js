import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Rocket } from 'lucide-react';

const SIRFooter = () => {
  return (
    <motion.footer 
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="p-4 bg-white/10 rounded-2xl">
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold">Modelo SIR Seguro</h3>
            <p className="text-gray-300">Simulación educativa, no para pánico real.</p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl">
            <Rocket className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold">¡Lanza tu Carrera!</h3>
            <p className="text-gray-300">Usa esto en tu tesis y conquista el mundo académico.</p>
          </div>
        </motion.div>

        <h3 className="text-2xl font-bold mb-4">Tips para tu clase</h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Usa esto para explicar el SIR en tu presentación: enfócate en cómo las tasas de contagio y recuperación cambian el panorama. ¡Y ya verás cómo impresiona a todos sin necesidad de matemáticas pesadas!
        </p>

        <motion.div 
          className="border-t border-gray-700 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-gray-400">&copy; 2025 Simulación SIR Educativa. Hecho con diversión y un toque de ciencia loca.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default SIRFooter;