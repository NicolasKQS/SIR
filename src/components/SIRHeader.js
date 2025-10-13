import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Heart } from 'lucide-react';

const SIRHeader = () => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-b-4 border-red-200 py-12 px-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full mb-6 shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AlertTriangle className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h1 
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Modelo SIR
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Entiende cómo se propagan las epidemias: de sanos a infectados y recuperados, todo con un toque matemático simple para tu clase de ecuaciones diferenciales.
        </motion.p>
        <div className="flex flex-wrap justify-center items-center gap-8 text-lg font-semibold">
          <motion.div 
            className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Shield className="w-6 h-6 text-green-500" />
            <span className="text-green-700">Sanos</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-red-700">Infectados</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Heart className="w-6 h-6 text-blue-500" />
            <span className="text-blue-700">Recuperados</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SIRHeader;