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
import { Activity, TrendingUp, Users, AlertCircle } from 'lucide-react';

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
  const [metrics, setMetrics] = useState(null);

  const N = initialS + initialI;

  const simulateSIR = () => {
    const dt = 0.2;
    const steps = 400;
    const S = new Array(steps).fill(0);
    const I = new Array(steps).fill(0);
    const R = new Array(steps).fill(0);
    const time = new Array(steps).fill(0);
    
    S[0] = initialS;
    I[0] = initialI;
    R[0] = 0;
    time[0] = 0;

    // Método RK4 mejorado
    for (let t = 1; t < steps; t++) {
      const St = S[t - 1];
      const It = I[t - 1];
      const Rt = R[t - 1];

      // k1
      const k1_S = -beta * St * It / N;
      const k1_I = beta * St * It / N - gamma * It;
      const k1_R = gamma * It;

      // k2
      const S2 = St + dt * k1_S / 2;
      const I2 = It + dt * k1_I / 2;
      const k2_S = -beta * S2 * I2 / N;
      const k2_I = beta * S2 * I2 / N - gamma * I2;
      const k2_R = gamma * I2;

      // k3
      const S3 = St + dt * k2_S / 2;
      const I3 = It + dt * k2_I / 2;
      const k3_S = -beta * S3 * I3 / N;
      const k3_I = beta * S3 * I3 / N - gamma * I3;
      const k3_R = gamma * I3;

      // k4
      const S4 = St + dt * k3_S;
      const I4 = It + dt * k3_I;
      const k4_S = -beta * S4 * I4 / N;
      const k4_I = beta * S4 * I4 / N - gamma * I4;
      const k4_R = gamma * I4;

      // Actualización
      S[t] = Math.max(0, St + dt * (k1_S + 2*k2_S + 2*k3_S + k4_S) / 6);
      I[t] = Math.max(0, It + dt * (k1_I + 2*k2_I + 2*k3_I + k4_I) / 6);
      R[t] = Math.min(N, Rt + dt * (k1_R + 2*k2_R + 2*k3_R + k4_R) / 6);
      time[t] = t * dt;
    }

    // Calcular métricas epidemiológicas
    let peakInfected = Math.max(...I);
    let peakDay = I.indexOf(peakInfected) * dt;
    let finalAttackRate = (R[steps - 1] / N * 100).toFixed(2);
    let R0 = (beta / gamma).toFixed(2);
    let herdImmunity = ((1 - 1/(beta/gamma)) * 100).toFixed(1);
    
    // Día cuando I < 1
    let extinctionDay = time.find((t, idx) => I[idx] < 1) || time[steps-1];

    setMetrics({
      R0,
      peakInfected: Math.round(peakInfected),
      peakDay: peakDay.toFixed(1),
      finalAttackRate,
      herdImmunity,
      extinctionDay: extinctionDay.toFixed(1),
      avgInfectionDays: (1/gamma).toFixed(1),
    });

    setSimulatedData({ S, I, R, steps, time });
  };

  const reset = () => {
    setBeta(0.3);
    setGamma(0.1);
    setInitialS(990);
    setInitialI(10);
    setSimulatedData(null);
    setShowRealData(false);
    setMetrics(null);
  };

  const data = useMemo(() => {
    let simLabels = [];
    let simDatasets = [];
    let finalDatasets = [];

    if (simulatedData) {
      simLabels = Array.from({ length: simulatedData.steps }, (_, i) => {
        const day = Math.round(i * 0.2);
        return day % 10 === 0 ? `Día ${day}` : '';
      });
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
        text: showRealData ? 'Comparación: Modelo SIR vs Datos Reales COVID-19' : 'Simulación Modelo SIR - Método Runge-Kutta 4',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
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
          Simulación Interactiva del Modelo SIR
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
        {/* Panel de Métricas Epidemiológicas */}
        {metrics && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MetricCard 
              icon={<TrendingUp className="w-6 h-6" />}
              label="R₀ (Reproductivo Básico)"
              value={metrics.R0}
              description={parseFloat(metrics.R0) > 1 ? "Epidemia activa" : "Se extingue"}
              color={parseFloat(metrics.R0) > 1 ? "red" : "green"}
            />
            <MetricCard 
              icon={<Activity className="w-6 h-6" />}
              label="Pico de Infectados"
              value={metrics.peakInfected}
              description={`Día ${metrics.peakDay}`}
              color="orange"
            />
            <MetricCard 
              icon={<Users className="w-6 h-6" />}
              label="Tasa de Ataque Final"
              value={`${metrics.finalAttackRate}%`}
              description="Población infectada total"
              color="blue"
            />
            <MetricCard 
              icon={<AlertCircle className="w-6 h-6" />}
              label="Inmunidad de Rebaño"
              value={`${metrics.herdImmunity}%`}
              description="Umbral para detener epidemia"
              color="purple"
            />
          </motion.div>
        )}

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
            {showRealData ? 'Ocultar COVID Real' : 'Comparar con COVID-19'}
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
        <motion.div 
          className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="font-bold text-lg mb-2 text-gray-800">Interpretación Epidemiológica</h3>
          <p className="text-gray-700 leading-relaxed">
            {showRealData 
              ? 'Los datos reales de COVID-19 muestran la complejidad de epidemias reales con múltiples olas, intervenciones no farmacéuticas y cambios de comportamiento. El modelo SIR básico captura la dinámica fundamental, pero modelos más sofisticados (SEIR, SEIRS) son necesarios para predicciones precisas.'
              : metrics 
              ? `Con R₀ = ${metrics.R0}, ${parseFloat(metrics.R0) > 1 ? `la enfermedad se propaga exponencialmente. Se requiere vacunar al menos ${metrics.herdImmunity}% de la población para alcanzar inmunidad de rebaño. El pico ocurre en el día ${metrics.peakDay} cuando dI/dt = 0, con ${metrics.peakInfected} infectados simultáneos.` : 'la enfermedad no puede sostener la transmisión y se extingue naturalmente sin necesidad de intervenciones.'}`
              : 'Presiona "¡Simular!" para resolver el sistema de ecuaciones diferenciales usando el método Runge-Kutta de orden 4. Observa cómo los parámetros β (contagiosidad) y γ (recuperación) determinan la dinámica de la epidemia.'}
          </p>
          {metrics && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Parámetros actuales:</strong> β = {beta.toFixed(3)}, γ = {gamma.toFixed(3)}, 
                Período infeccioso promedio = {metrics.avgInfectionDays} días, 
                Extinción aproximada: día {metrics.extinctionDay}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

// Componente para tarjetas de métricas
const MetricCard = ({ icon, label, value, description, color }) => {
  const colorClasses = {
    red: 'from-red-50 to-red-100 border-red-300 text-red-700',
    green: 'from-green-50 to-green-100 border-green-300 text-green-700',
    blue: 'from-blue-50 to-blue-100 border-blue-300 text-blue-700',
    orange: 'from-orange-50 to-orange-100 border-orange-300 text-orange-700',
    purple: 'from-purple-50 to-purple-100 border-purple-300 text-purple-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl border-2 shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-sm">{label}</h4>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
  );
};

export default SIRGraph;