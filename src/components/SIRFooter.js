import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, AlertTriangle } from 'lucide-react';

const SIRFooter = () => {
  return (
    <motion.footer 
      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="p-4 bg-white/10 rounded-lg">
            <Activity className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Modelos Epidemiológicos</h3>
            <p className="text-gray-300 text-sm">Simulación matemática SIR/SEIR para análisis de propagación de enfermedades infecciosas</p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg">
            <BarChart3 className="w-10 h-10 text-green-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Métricas Avanzadas</h3>
            <p className="text-gray-300 text-sm">Análisis de reproducción efectiva, tiempo de duplicación, saturación hospitalaria e impacto económico</p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="text-lg font-bold mb-2">Sistema de Alertas</h3>
            <p className="text-gray-300 text-sm">Validación en tiempo real con 5 niveles de riesgo para toma de decisiones informadas</p>
          </div>
        </motion.div>

        <motion.div 
          className="border-t border-gray-700 pt-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-gray-400 text-sm mb-2">Sistema de Análisis Epidemiológico</p>
          <p className="text-gray-500 text-xs">
            Herramienta profesional para análisis y modelado de escenarios epidemiológicos. 
            Los resultados son proyecciones matemáticas que deben complementarse con datos reales y criterio experto.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-600">
            <p className="text-gray-400 text-sm font-semibold mb-1">SEDES - Servicio Departamental de Salud</p>
            <p className="text-gray-500 text-xs">Sistema Oficial de Modelado Epidemiológico - Bolivia</p>
            <p className="text-gray-600 text-xs mt-2">&copy; 2025 SEDES Bolivia. Todos los derechos reservados.</p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default SIRFooter;