import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap, Heart } from 'lucide-react';

const SIRExplanation = () => {
  const steps = [
    {
      title: "Sanos (S)",
      description: "Esta es la gente que aún no ha pillado la enfermedad, pero podría contagiarse si se acerca a alguien enfermo. Imagina a tus amigos antes de que llegue el resfriado de invierno.",
      icon: Users,
      color: "from-green-400 to-blue-500"
    },
    {
      title: "Infectados (I)",
      description: "Los que ya están con el virus, esparciéndolo por todos lados como chismes en un grupo de WhatsApp. Aquí es donde la cosa se pone fea y crece rápido.",
      icon: Zap,
      color: "from-red-400 to-orange-500"
    },
    {
      title: "Recuperados (R)",
      description: "Los que se curaron y ahora están inmunes, o sea, ya no contagian ni se contagian. ¡El final feliz, pero solo si el modelo lo dice!",
      icon: Heart,
      color: "from-blue-400 to-purple-500"
    }
  ];

  return (
    <motion.section 
      className="py-16 px-4 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center text-gray-800 mb-12"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          ¿Cómo funciona el SIR?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="text-center group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${step.color} rounded-full mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}
                  whileHover={{ rotate: 5 }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed px-4">{step.description}</p>
                {index < steps.length - 1 && (
                  <motion.div
                    className="mt-8 flex justify-center"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ArrowRight className="w-8 h-8 text-gray-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        <motion.p 
          className="text-center mt-12 text-lg text-gray-700 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          El modelo usa ideas de cambio para predecir cómo fluye la gente entre estos grupos durante una epidemia grande, como un virus que arrasa con todo. Perfecto para impresionar en clase sin sudar.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default SIRExplanation;