import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import SIRControls from './SIRControls';
import { covidData } from '../data/realEpidemicData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SIRGraph = () => {
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.1);
  const [initialS, setInitialS] = useState(990);
  const [initialI, setInitialI] = useState(10);
  const [simulatedData, setSimulatedData] = useState(null);
  const [showRealData, setShowRealData] = useState(false);

  const N = initialS + initialI;

  const simulateSIR = () => {
    const dt = 0.1;
    const steps = 200;
    const S = new Array(steps).fill(0);
    const I = new Array(steps).fill(0);
    const R = new Array(steps).fill(0);
    S[0] = initialS;
    I[0] = initialI;
    R[0] = 0;

    for (let t = 1; t < steps; t++) {
      const dS = -beta * S[t - 1] * I[t - 1] / N * dt;
      const dI = (beta * S[t - 1] * I[t - 1] / N - gamma * I[t - 1]) * dt;
      const dR = gamma * I[t - 1] * dt;

      S[t] = Math.max(0, S[t - 1] + dS);
      I[t] = Math.max(0, I[t - 1] + dI);
      R[t] = Math.min(N, R[t - 1] + dR);
    }

    setSimulatedData({ S, I, R, steps });
  };

  const reset = () => {
    setBeta(0.3);
    setGamma(0.1);
    setInitialS(990);
    setInitialI(10);
    setSimulatedData(null);
    setShowRealData(false);
  };

  const data = useMemo(() => {
    let simLabels = [];
    let simDatasets = [];
    let finalDatasets = [];

    if (simulatedData) {
      simLabels = Array.from({ length: simulatedData.steps }, (_, i) => `Día ${Math.round(i * 0.1)}`);
      simDatasets = [
        {
          label: 'Sanos (simulado)',
          data: simulatedData.S.map(val => Math.round(val)),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: 'Infectados (simulado)',
          data: simulatedData.I.map(val => Math.round(val)),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: 'Recuperados (simulado)',
          data: simulatedData.R.map(val => Math.round(val)),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
        },
      ];
      finalDatasets = [...simDatasets];
    }

    if (showRealData) {
      const realLabels = covidData.labels.slice(0, simLabels.length || covidData.labels.length);
      const realDatasets = covidData.datasets.map(dataset => ({
        ...dataset,
        label: `${dataset.label} (COVID-19, 2020)`,
      }));
      finalDatasets = [...finalDatasets, ...realDatasets];
      if (simLabels.length === 0) {
        simLabels = realLabels;
      }
    }

    return {
      labels: simLabels,
      datasets: finalDatasets,
    };
  }, [simulatedData, showRealData]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: showRealData ? 'Comparación SIR: Tu Simulación vs. Datos Reales de COVID-19 (Escalados)' : 'Simulación Interactiva del Modelo SIR (Ecuaciones Diferenciales)',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} personas`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        max: showRealData ? Math.max(...covidData.datasets.flatMap(d => d.data)) * 1.2 : N * 1.1,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <motion.section 
      id="graph-section"
      className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl font-bold text-center text-gray-800 mb-8"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          ¡Controla la Epidemia con Diferenciales!
        </motion.h2>
        <SIRControls
          beta={beta}
          onBetaChange={setBeta}
          gamma={gamma}
          onGammaChange={setGamma}
          initialS={initialS}
          onInitialSChange={setInitialS}
          initialI={initialI}
          onInitialIChange={setInitialI}
          onSimulate={simulateSIR}
          onReset={reset}
        />
        <motion.div className="flex justify-center mb-4">
          <motion.button
            onClick={() => setShowRealData(!showRealData)}
            className={`px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
              showRealData
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showRealData ? 'Ocultar COVID Real' : 'Mostrar Datos COVID Real'}
          </motion.button>
        </motion.div>
        <motion.div 
          className="bg-white rounded-3xl shadow-xl p-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Line data={data} options={options} />
        </motion.div>
        <motion.p 
          className="text-center mt-8 text-lg text-gray-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {showRealData 
            ? 'Datos reales escalados de COVID-19 (2020, inspirados en CDC), comparados con tu modelo SIR. Ajusta β y γ para que coincida: ¡aprende diferenciales en acción!'
            : 'Simula cambios infinitesimales (ecuaciones diferenciales numéricas) presionando ¡Simular!. Observa el pico cuando dI/dt = 0.'}
        </motion.p>
      </div>
    </motion.section>
  );
};

export default SIRGraph;