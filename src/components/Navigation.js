import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BookOpen, BarChart3, Home } from 'lucide-react';

const Navigation = ({ activeView, setActiveView }) => {
  const menuItems = [
    { 
      id: 'home', 
      label: 'Inicio', 
      icon: Home,
      description: 'Vista general'
    },
    { 
      id: 'simulation', 
      label: 'Simulación', 
      icon: Activity,
      description: 'Modelos y gráficos'
    },
    { 
      id: 'mathematics', 
      label: 'Fundamentos', 
      icon: BookOpen,
      description: 'Teoría matemática'
    },
    { 
      id: 'analysis', 
      label: 'Análisis', 
      icon: BarChart3,
      description: 'Métricas avanzadas'
    }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Título SEDES */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-400">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">SEDES</h1>
              <p className="text-xs text-gray-600 font-semibold">Servicio Departamental de Salud - Bolivia</p>
            </div>
          </motion.div>

          {/* Menú de navegación */}
          <div className="flex gap-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium transition-all duration-200
                    flex items-center gap-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
