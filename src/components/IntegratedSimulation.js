import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Filler
} from 'chart.js';
import { Shield, Lock, Syringe, TrendingDown, Users, Activity, Download, AlertCircle, CheckCircle2, Info, Clock, TrendingUp, Zap, AlertTriangle, FileText, BookOpen, X } from 'lucide-react';
import { simulateWithInterventions } from '../utils/sirInterventions';
import { simulateSEIR, calculateSEIR_R0 } from '../utils/seirModel';
import { getAllDepartments, boliviaNational, getInterventionLevel, boliviaEpidemiologicalParams } from '../data/boliviaData';
import { downloadPDFReport } from '../utils/reportGenerator';
import DiseaseSelector from './DiseaseSelector';
import { 
  calculateDoublingTime, 
  calculateEffectiveReproduction, 
  calculateHospitalizationMetrics,
  calculateMortalityEstimates,
  earlyWarningIndicators,
  sensitivityAnalysis,
  calculateEconomicImpact,
  generateProbabilisticScenarios
} from '../utils/epidemiologicalMetrics';
import {
  validateEpidemiologicalParams,
  generateEarlyWarningAlerts,
  validateSimulationResults,
  compareScenarios as compareMultipleScenarios,
  assessDataQuality
} from '../utils/dataValidation';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IntegratedSimulation = () => {
  // Estado principal
  const [selectedDepartment, setSelectedDepartment] = useState(boliviaNational);
  const [simulationMode, setSimulationMode] = useState('basic'); // 'basic' o 'interventions'
  const [modelType, setModelType] = useState('SIR'); // 'SIR' o 'SEIR'
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showProbabilisticScenarios, setShowProbabilisticScenarios] = useState(false);
  const [showDiseaseSelector, setShowDiseaseSelector] = useState(false);
  const [selectedDiseaseProfile, setSelectedDiseaseProfile] = useState(null);
  const departments = getAllDepartments();

  // Parámetros básicos
  const [baseParams, setBaseParams] = useState({
    S0: boliviaNational.population - 100,
    E0: 50, // Para modelo SEIR
    I0: 100,
    R0: 0,
    beta: 0.35,
    gamma: 0.1,
    sigma: 0.2, // Para modelo SEIR (1/período_incubación)
    days: 365
  });

  // Estado de validación
  const [paramValidation, setParamValidation] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [notification, setNotification] = useState(null);

  // Intervenciones
  const [interventions, setInterventions] = useState({
    quarantine: {
      enabled: false,
      startDay: 30,
      duration: 60,
      effectiveness: 0.7
    },
    socialDistancing: {
      enabled: false,
      startDay: 20,
      reduction: 0.5
    },
    vaccination: {
      enabled: false,
      startDay: 60,
      dailyRate: 0.005
    },
    hospitalCapacity: selectedDepartment.hospitalCapacity.icuBeds
  });

  // Estado de resultados
  const [scenarios, setScenarios] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  // Actualizar al cambiar departamento
  React.useEffect(() => {
    setInterventions(prev => ({
      ...prev,
      hospitalCapacity: selectedDepartment.hospitalCapacity.icuBeds
    }));
    setBaseParams(prev => ({
      ...prev,
      S0: selectedDepartment.population - prev.I0
    }));
    setShowResults(false);
    setScenarios([]);
  }, [selectedDepartment]);

  // Función de simulación mejorada
  const runSimulation = () => {
    // 1. Validar parámetros antes de simular
    const validation = validateEpidemiologicalParams(baseParams);
    setParamValidation(validation);
    
    if (!validation.isValid) {
      setNotification({
        type: 'error',
        title: 'Error en Parámetros',
        message: validation.errors.join('. '),
        details: validation.warnings
      });
      setTimeout(() => setNotification(null), 8000);
      return;
    }

    // 2. Evaluar calidad de datos
    const quality = assessDataQuality(selectedDepartment);
    setDataQuality(quality);

    const newScenarios = [];

    // 3. Seleccionar modelo (SIR o SEIR)
    const simulateFunction = modelType === 'SEIR' ? simulateSEIR : simulateWithInterventions;

    if (simulationMode === 'basic') {
      // Simulación básica
      const basicResult = simulateFunction({
        ...baseParams,
        interventions: {}
      });
      
      // Validar resultados
      const resultValidation = validateSimulationResults(basicResult);
      if (!resultValidation.isValid) {
        console.warn('Advertencias de simulación:', resultValidation.issues);
      }

      newScenarios.push({
        name: `${modelType} - Sin Intervención`,
        data: basicResult,
        color: '#3B82F6',
        description: `Modelo ${modelType} sin intervenciones`,
        validation: resultValidation
      });

      // Si están habilitados los escenarios probabilísticos
      if (showProbabilisticScenarios) {
        const probScenarios = generateProbabilisticScenarios(baseParams);
        probScenarios.forEach(scenario => {
          const result = simulateFunction({
            ...scenario.params,
            interventions: {}
          });
          newScenarios.push({
            name: scenario.name,
            data: result,
            color: scenario.color,
            description: `${scenario.description} (P=${(scenario.probability * 100).toFixed(0)}%)`,
            probability: scenario.probability
          });
        });
      }
    } else {
      // Simulación con comparación de escenarios
      // Escenario 1: Sin intervención
      const baseline = simulateFunction({
        ...baseParams,
        interventions: {}
      });
      newScenarios.push({
        name: 'Sin Intervención',
        data: baseline,
        color: '#EF4444',
        description: 'Evolución natural de la epidemia'
      });

      // Escenario 2: Con intervenciones seleccionadas
      const withInterventions = simulateFunction({
        ...baseParams,
        interventions: {
          quarantine: interventions.quarantine.enabled ? interventions.quarantine : undefined,
          socialDistancing: interventions.socialDistancing.enabled ? interventions.socialDistancing : undefined,
          vaccination: interventions.vaccination.enabled ? interventions.vaccination : undefined
        }
      });

      const interventionName = getInterventionName();
      newScenarios.push({
        name: interventionName,
        data: withInterventions,
        color: '#10B981',
        description: getInterventionDescription()
      });
    }

    setScenarios(newScenarios);
    setShowResults(true);
    setSelectedScenarioIndex(0);
  };

  const getInterventionName = () => {
    const active = [];
    if (interventions.quarantine.enabled) active.push('Cuarentena');
    if (interventions.socialDistancing.enabled) active.push('Distanciamiento');
    if (interventions.vaccination.enabled) active.push('Vacunación');
    return active.length > 0 ? active.join(' + ') : 'Sin Intervenciones';
  };

  const getInterventionDescription = () => {
    const active = [];
    if (interventions.quarantine.enabled) {
      active.push(`Cuarentena ${(interventions.quarantine.effectiveness * 100).toFixed(0)}% efectiva día ${interventions.quarantine.startDay}`);
    }
    if (interventions.socialDistancing.enabled) {
      active.push(`Distanciamiento ${(interventions.socialDistancing.reduction * 100).toFixed(0)}% reducción`);
    }
    if (interventions.vaccination.enabled) {
      active.push(`Vacunación ${(interventions.vaccination.dailyRate * 100).toFixed(2)}% diario`);
    }
    return active.join(' | ') || 'Sin medidas de control';
  };

  const resetSimulation = () => {
    setShowResults(false);
    setScenarios([]);
    setSimulationMode('basic');
    setSelectedDiseaseProfile(null);
    setInterventions({
      quarantine: { enabled: false, startDay: 30, duration: 60, effectiveness: 0.7 },
      socialDistancing: { enabled: false, startDay: 20, reduction: 0.5 },
      vaccination: { enabled: false, startDay: 60, dailyRate: 0.005 },
      hospitalCapacity: selectedDepartment.hospitalCapacity.icuBeds
    });
  };

  // Manejar selección de enfermedad
  const handleDiseaseSelect = ({ disease, params, interventions: diseaseInterventions }) => {
    setSelectedDiseaseProfile(disease);
    setModelType(disease.modelType);
    setBaseParams(prev => ({
      ...prev,
      ...params
    }));

    // Si la enfermedad tiene intervenciones recomendadas, precargarlas
    if (diseaseInterventions) {
      const newInterventions = { ...interventions };
      
      if (diseaseInterventions.quarantine?.recommended) {
        newInterventions.quarantine = {
          enabled: false,
          startDay: diseaseInterventions.quarantine.startDay || 30,
          duration: diseaseInterventions.quarantine.duration || 60,
          effectiveness: diseaseInterventions.quarantine.effectiveness || 0.7
        };
      }
      
      if (diseaseInterventions.vaccination?.recommended) {
        newInterventions.vaccination = {
          enabled: false,
          startDay: diseaseInterventions.vaccination.startDay || 60,
          dailyRate: diseaseInterventions.vaccination.dailyRate || 0.005
        };
      }
      
      setInterventions(newInterventions);
    }
  };

  // Análisis de escenarios con métricas avanzadas
  const analyzeScenario = (scenario) => {
    const peakInfected = Math.max(...scenario.data.I);
    const peakDay = scenario.data.time[scenario.data.I.indexOf(peakInfected)];
    const totalInfected = scenario.data.R[scenario.data.R.length - 1];
    const attackRate = (totalInfected / selectedDepartment.population * 100).toFixed(2);
    const criticalCases = Math.round(peakInfected * 0.05);
    const icuOccupancy = criticalCases / selectedDepartment.hospitalCapacity.icuBeds;
    const interventionLevel = getInterventionLevel(icuOccupancy);
    
    const R0 = modelType === 'SEIR' 
      ? calculateSEIR_R0(baseParams.beta, baseParams.gamma, baseParams.sigma)
      : baseParams.beta / baseParams.gamma;

    // Métricas avanzadas
    const doublingTime = calculateDoublingTime(scenario.data.I, scenario.data.time);
    const hospitalizationMetrics = calculateHospitalizationMetrics(scenario, selectedDepartment.hospitalCapacity);
    const mortalityEstimates = calculateMortalityEstimates(
      { data: scenario.data, totalInfected },
      selectedDepartment.hospitalCapacity
    );
    const earlyWarnings = earlyWarningIndicators(scenario);
    const alerts = generateEarlyWarningAlerts(scenario.data, selectedDepartment.hospitalCapacity);
    
    // Impacto económico
    const economicImpact = calculateEconomicImpact(
      { 
        ...hospitalizationMetrics, 
        totalInfected: Math.round(totalInfected),
        estimatedDeaths: mortalityEstimates.estimatedDeaths 
      },
      selectedDepartment.population
    );

    return {
      // Métricas básicas
      peakInfected: Math.round(peakInfected),
      peakDay: peakDay.toFixed(1),
      totalInfected: Math.round(totalInfected),
      attackRate,
      criticalCases,
      icuOccupancy: (icuOccupancy * 100).toFixed(1),
      interventionLevel,
      R0: R0.toFixed(2),
      
      // Métricas avanzadas
      doublingTime,
      hospitalizationMetrics,
      mortalityEstimates,
      earlyWarnings,
      alerts,
      economicImpact,
      
      // Número reproductivo efectivo
      effectiveR: calculateEffectiveReproduction(
        scenario.data.S,
        selectedDepartment.population,
        R0
      )[Math.floor(scenario.data.S.length / 2)] // R efectivo a mitad de simulación
    };
  };

  // Generar datos del gráfico
  const chartData = useMemo(() => {
    if (scenarios.length === 0) return null;

    const selectedScenario = scenarios[selectedScenarioIndex];
    
    // Solo mostrar todas las curvas (S, E, I, R) para el escenario seleccionado
    // Para los demás escenarios, solo mostrar la curva de infectados
    const datasets = [];
    
    // Curvas del escenario seleccionado
    datasets.push({
      label: `${selectedScenario.name} - Susceptibles (S)`,
      data: selectedScenario.data.S,
      borderColor: '#10b981', // green-500
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      fill: true
    });
    
    // Si es SEIR, mostrar Expuestos
    if (modelType === 'SEIR' && selectedScenario.data.E) {
      datasets.push({
        label: `${selectedScenario.name} - Expuestos (E)`,
        data: selectedScenario.data.E,
        borderColor: '#f59e0b', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true
      });
    }
    
    datasets.push({
      label: `${selectedScenario.name} - Infectados (I)`,
      data: selectedScenario.data.I,
      borderColor: selectedScenario.color,
      backgroundColor: selectedScenario.color + '20',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 0,
      fill: true
    });
    
    datasets.push({
      label: `${selectedScenario.name} - Recuperados (R)`,
      data: selectedScenario.data.R,
      borderColor: '#3b82f6', // blue-500
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      fill: true
    });
    
    // Para otros escenarios (si existen), solo mostrar infectados
    scenarios.forEach((scenario, idx) => {
      if (idx !== selectedScenarioIndex) {
        datasets.push({
          label: `${scenario.name} - Infectados (I)`,
          data: scenario.data.I,
          borderColor: scenario.color,
          backgroundColor: scenario.color + '20',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          borderDash: [5, 5]
        });
      }
    });
    
    return {
      labels: Array.from({ length: selectedScenario.data.time.length }, (_, i) => {
        const day = Math.round(selectedScenario.data.time[i]);
        return day % 20 === 0 ? `Día ${day}` : '';
      }),
      datasets
    };
  }, [scenarios, selectedScenarioIndex, modelType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        },
      },
      title: {
        display: true,
        text: `Simulación Modelo SIR - ${selectedDepartment.name}`,
        font: { size: 16, weight: 'bold' },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => `${context.dataset.label}: ${Math.round(context.parsed.y).toLocaleString('es-BO')} personas`
        }
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { maxTicksLimit: 15 },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value) => value.toLocaleString('es-BO')
        },
      },
    },
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    
    if (!showResults || scenarios.length === 0) {
      setNotification({
        type: 'warning',
        title: 'Simulación No Ejecutada',
        message: 'Debe ejecutar la simulación antes de generar el reporte PDF'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      // Mostrar notificación de inicio
      setNotification({
        type: 'info',
        title: 'Generando PDF',
        message: 'Por favor espere mientras se genera el reporte...'
      });

      // Análisis completo del escenario seleccionado
      const fullAnalysis = analyzeScenario(scenarios[selectedScenarioIndex]);

      const reportData = {
        department: selectedDepartment,
        scenarios: scenarios,
        baseParams: baseParams,
        interventions: interventions,
        selectedScenario: scenarios[selectedScenarioIndex].name,
        timestamp: new Date().toISOString(),
        modelType: modelType,
        analysisData: fullAnalysis
      };

      const filename = `reporte_sedes_${selectedDepartment.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      await downloadPDFReport(reportData, filename);
      
      // Éxito
      setNotification({
        type: 'success',
        title: 'PDF Generado Exitosamente',
        message: `El reporte "${filename}" se ha descargado correctamente.`
      });
      setTimeout(() => setNotification(null), 5000);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      setNotification({
        type: 'error',
        title: 'Error al Generar PDF',
        message: error.message || 'No se pudo crear el reporte'
      });
      setTimeout(() => setNotification(null), 8000);
    }
  };

  return (
    <>
      {/* Notificación */}
      <AnimatePresence>
        {notification && (
          <Notification 
            notification={notification} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>

      <motion.section
        className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full shadow-lg">
            <Activity className="w-6 h-6" />
            <div className="text-left">
              <div className="text-sm font-bold">SEDES</div>
              <div className="text-xs opacity-90">Sistema Oficial</div>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Simulación Epidemiológica Avanzada
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Servicio Departamental de Salud - Análisis mediante ecuaciones diferenciales
          </p>

          {/* Botón de Perfiles de Enfermedades */}
          <div className="flex justify-center mb-6">
            <motion.button
              onClick={() => setShowDiseaseSelector(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="w-5 h-5" />
              Cargar Perfil de Enfermedad (Bolivia)
            </motion.button>
          </div>

          {/* Indicador de enfermedad seleccionada */}
          {selectedDiseaseProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm">{selectedDiseaseProfile.icon}</div>
                  <div>
                    <p className="font-bold text-purple-900">{selectedDiseaseProfile.name}</p>
                    <p className="text-sm text-purple-700">
                      R₀ = {selectedDiseaseProfile.params.R0_value} • Modelo {selectedDiseaseProfile.modelType} • {selectedDiseaseProfile.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDiseaseProfile(null)}
                  className="p-2 hover:bg-purple-200 rounded-lg transition-colors"
                  title="Limpiar selección"
                >
                  <X className="w-5 h-5 text-purple-700" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Selector de Departamento */}
          <div className="max-w-md mx-auto mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Departamento
            </label>
            <select
              value={selectedDepartment.name}
              onChange={(e) => {
                const dept = departments.find(d => d.name === e.target.value) || boliviaNational;
                setSelectedDepartment(dept);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
            >
              <option value={boliviaNational.name}>{boliviaNational.name}</option>
              {departments.map(dept => (
                <option key={dept.key} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Info del Departamento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <InfoCard label="Población" value={selectedDepartment.population.toLocaleString('es-BO')} />
            <InfoCard label="Camas UCI" value={selectedDepartment.hospitalCapacity.icuBeds.toLocaleString('es-BO')} color="blue" />
            <InfoCard label="Ventiladores" value={selectedDepartment.hospitalCapacity.ventilators.toLocaleString('es-BO')} />
            <InfoCard label="Personal Salud" value={selectedDepartment.hospitalCapacity.healthWorkers.toLocaleString('es-BO')} />
          </div>
        </motion.div>

        {/* Modo de Simulación y Tipo de Modelo */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSimulationMode('basic')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                simulationMode === 'basic'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300'
              }`}
            >
              Simulación Básica
            </button>
            <button
              onClick={() => setSimulationMode('interventions')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                simulationMode === 'interventions'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-300'
              }`}
            >
              Análisis de Intervenciones
            </button>
          </div>

          {/* Opciones Avanzadas */}
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
              <label className="text-sm font-semibold text-gray-700">Modelo:</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="SIR">SIR (Clásico)</option>
                <option value="SEIR">SEIR (Con Incubación)</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={showAdvancedMetrics}
                onChange={(e) => setShowAdvancedMetrics(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-700">Métricas Avanzadas</span>
            </label>

            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={showProbabilisticScenarios}
                onChange={(e) => setShowProbabilisticScenarios(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-700">Escenarios Probabilísticos</span>
            </label>
          </div>

          {/* Calidad de Datos */}
          {dataQuality && (
            <div className={`max-w-2xl mx-auto p-4 rounded-lg border-2 ${
              dataQuality.reliability === 'ALTA' ? 'bg-green-50 border-green-300' :
              dataQuality.reliability === 'MEDIA' ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5" />
                <span className="font-semibold">
                  Calidad de Datos: {dataQuality.reliability} ({dataQuality.completeness}%)
                </span>
              </div>
              {dataQuality.warnings.length > 0 && (
                <ul className="text-sm space-y-1">
                  {dataQuality.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Validación de Parámetros */}
          {paramValidation && !paramValidation.isValid && (
            <div className="max-w-2xl mx-auto p-4 rounded-lg border-2 bg-red-50 border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Errores de Validación</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {paramValidation.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Advertencias de Parámetros */}
          {paramValidation && paramValidation.warnings.length > 0 && (
            <div className="max-w-2xl mx-auto p-4 rounded-lg border-2 bg-yellow-50 border-yellow-300">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Advertencias</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {paramValidation.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Panel de Configuración */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Parámetros del Modelo */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Parámetros del Modelo
            </h3>

            <div className="space-y-4">
              <ParamSlider
                label="Población Susceptible Inicial (S₀)"
                value={baseParams.S0}
                onChange={(val) => setBaseParams({ ...baseParams, S0: val })}
                min={selectedDepartment.population * 0.1}
                max={selectedDepartment.population * 2}
                step={500}
                unit="personas"
                info={`${((baseParams.S0 / selectedDepartment.population) * 100).toFixed(1)}% de la población del departamento`}
              />
              <ParamSlider
                label="Infectados Iniciales (I₀)"
                value={baseParams.I0}
                onChange={(val) => setBaseParams({ ...baseParams, I0: val, S0: selectedDepartment.population - val })}
                min={1}
                max={50000}
                step={1}
                unit="casos"
                info={`Prevalencia inicial: ${((baseParams.I0 / selectedDepartment.population) * 100).toFixed(3)}%`}
              />
              <ParamSlider
                label="Tasa de Transmisión (β)"
                value={baseParams.beta}
                onChange={(val) => setBaseParams({ ...baseParams, beta: val })}
                min={0.01}
                max={2.0}
                step={0.001}
                unit="día⁻¹"
                info={`R₀ = ${(baseParams.beta / baseParams.gamma).toFixed(2)} | Probabilidad de contagio por contacto efectivo`}
              />
              <ParamSlider
                label="Tasa de Recuperación (γ)"
                value={baseParams.gamma}
                onChange={(val) => setBaseParams({ ...baseParams, gamma: val })}
                min={0.01}
                max={1.0}
                step={0.001}
                unit="día⁻¹"
                info={`Período infeccioso: ${(1 / baseParams.gamma).toFixed(1)} días (${((1 / baseParams.gamma) / 7).toFixed(1)} semanas)`}
              />
              
              {/* Parámetro adicional para SEIR */}
              {modelType === 'SEIR' && (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Parámetros SEIR:</p>
                  </div>
                  <ParamSlider
                    label="Expuestos Iniciales (E₀)"
                    value={baseParams.E0}
                    onChange={(val) => setBaseParams({ ...baseParams, E0: val })}
                    min={0}
                    max={20000}
                    step={1}
                    unit="personas"
                    info="Infectados en período de incubación (no contagiosos aún)"
                  />
                  <ParamSlider
                    label="Tasa de Progresión (σ)"
                    value={baseParams.sigma}
                    onChange={(val) => setBaseParams({ ...baseParams, sigma: val })}
                    min={0.01}
                    max={2.0}
                    step={0.001}
                    unit="día⁻¹"
                    info={`Período de incubación: ${(1 / baseParams.sigma).toFixed(1)} días (${((1 / baseParams.sigma) / 7).toFixed(1)} semanas)`}
                  />
                </>
              )}

              {/* Validación en tiempo real */}
              {paramValidation && paramValidation.recommendations.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Información:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {paramValidation.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* Intervenciones */}
          {simulationMode === 'interventions' && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Intervenciones de Salud Pública
              </h3>

              <div className="space-y-4">
                <InterventionToggle
                  icon={<Lock className="w-5 h-5" />}
                  label="Cuarentena Estricta"
                  enabled={interventions.quarantine.enabled}
                  onToggle={(enabled) => setInterventions({
                    ...interventions,
                    quarantine: { ...interventions.quarantine, enabled }
                  })}
                  config={interventions.quarantine}
                  onConfigChange={(config) => setInterventions({
                    ...interventions,
                    quarantine: { ...interventions.quarantine, ...config }
                  })}
                  type="quarantine"
                />

                <InterventionToggle
                  icon={<TrendingDown className="w-5 h-5" />}
                  label="Distanciamiento Social"
                  enabled={interventions.socialDistancing.enabled}
                  onToggle={(enabled) => setInterventions({
                    ...interventions,
                    socialDistancing: { ...interventions.socialDistancing, enabled }
                  })}
                  config={interventions.socialDistancing}
                  onConfigChange={(config) => setInterventions({
                    ...interventions,
                    socialDistancing: { ...interventions.socialDistancing, ...config }
                  })}
                  type="socialDistancing"
                />

                <InterventionToggle
                  icon={<Syringe className="w-5 h-5" />}
                  label="Vacunación"
                  enabled={interventions.vaccination.enabled}
                  onToggle={(enabled) => setInterventions({
                    ...interventions,
                    vaccination: { ...interventions.vaccination, enabled }
                  })}
                  config={interventions.vaccination}
                  onConfigChange={(config) => setInterventions({
                    ...interventions,
                    vaccination: { ...interventions.vaccination, ...config }
                  })}
                  type="vaccination"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <motion.button
            onClick={() => {
              const validation = validateEpidemiologicalParams(baseParams);
              setParamValidation(validation);
              if (validation.isValid) {
                setNotification({
                  type: 'success',
                  title: 'Parámetros Válidos',
                  message: 'Los parámetros epidemiológicos son correctos. Puede ejecutar la simulación.'
                });
                setTimeout(() => setNotification(null), 4000);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle2 className="w-5 h-5" />
            Validar Parámetros
          </motion.button>

          <motion.button
            onClick={runSimulation}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="w-5 h-5" />
            Ejecutar Simulación {modelType}
          </motion.button>

          {showResults && (
            <>
              <motion.button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                Exportar Reporte PDF Completo
              </motion.button>
              <motion.button
                onClick={resetSimulation}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reiniciar
              </motion.button>
            </>
          )}
        </div>

        {/* Resultados */}
        {showResults && scenarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Análisis del Escenario Seleccionado */}
            {(() => {
              const analysis = analyzeScenario(scenarios[selectedScenarioIndex]);
              return (
                <AnalysisPanel
                  analysis={analysis}
                  scenario={scenarios[selectedScenarioIndex]}
                  department={selectedDepartment}
                  comparison={scenarios.length > 1 ? {
                    baseline: analyzeScenario(scenarios[0]),
                    intervention: analysis
                  } : null}
                />
              );
            })()}

            {/* Gráfico */}
            <div className="bg-white rounded-2xl shadow-xl p-8" id="integrated-chart">
              <div style={{ height: '500px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Tabla Comparativa (solo para modo intervenciones) */}
            {scenarios.length > 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6">Comparación de Escenarios</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Escenario</th>
                        <th className="px-4 py-3 text-center font-semibold">Pico Infectados</th>
                        <th className="px-4 py-3 text-center font-semibold">Día Pico</th>
                        <th className="px-4 py-3 text-center font-semibold">UCI Req.</th>
                        <th className="px-4 py-3 text-center font-semibold">Ocupación UCI</th>
                        <th className="px-4 py-3 text-center font-semibold">Tasa Ataque</th>
                        <th className="px-4 py-3 text-center font-semibold">Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios.map((scenario, idx) => {
                        const analysis = analyzeScenario(scenario);
                        return (
                          <tr
                            key={idx}
                            className={`border-b hover:bg-gray-50 cursor-pointer ${
                              selectedScenarioIndex === idx ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => setSelectedScenarioIndex(idx)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }}></div>
                                <div>
                                  <div className="font-semibold">{scenario.name}</div>
                                  <div className="text-xs text-gray-500">{scenario.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">{analysis.peakInfected.toLocaleString('es-BO')}</td>
                            <td className="px-4 py-3 text-center">{analysis.peakDay}</td>
                            <td className="px-4 py-3 text-center">{analysis.criticalCases.toLocaleString('es-BO')}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${
                                parseFloat(analysis.icuOccupancy) > 100 ? 'text-red-600' :
                                parseFloat(analysis.icuOccupancy) > 85 ? 'text-orange-600' :
                                parseFloat(analysis.icuOccupancy) > 70 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {analysis.icuOccupancy}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">{analysis.attackRate}%</td>
                            <td className="px-4 py-3 text-center">
                              <LevelBadge level={analysis.interventionLevel.level} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Modal de Selector de Enfermedades */}
        <DiseaseSelector
          isOpen={showDiseaseSelector}
          onClose={() => setShowDiseaseSelector(false)}
          onSelectDisease={handleDiseaseSelect}
          selectedDepartment={selectedDepartment}
        />
      </div>
    </motion.section>
    </>
  );
};

// Componentes auxiliares
const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    }
  };

  const style = styles[notification.type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <div className={`${style.bg} ${style.border} border-l-4 rounded-lg shadow-2xl p-4`}>
        <div className="flex items-start gap-3">
          <div className={`${style.iconBg} rounded-full p-2 flex-shrink-0`}>
            {notification.type === 'success' && <CheckCircle2 className={`w-6 h-6 ${style.icon}`} />}
            {notification.type === 'error' && <AlertCircle className={`w-6 h-6 ${style.icon}`} />}
            {notification.type === 'warning' && <AlertTriangle className={`w-6 h-6 ${style.icon}`} />}
            {notification.type === 'info' && <Info className={`w-6 h-6 ${style.icon}`} />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 mb-1">{notification.title}</h4>
            <p className="text-sm text-gray-700">{notification.message}</p>
            
            {notification.details && notification.details.length > 0 && (
              <ul className="mt-2 space-y-1">
                {notification.details.map((detail, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const InfoCard = ({ label, value, color = 'gray' }) => (
  <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
    <p className="text-sm text-gray-600">{label}</p>
    <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

const ParamSlider = ({ label, value, onChange, min, max, step, info, unit = '', isPercentage = false }) => {
  const handleInputChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = min;
    
    // Si es porcentaje, convertir de % a decimal
    if (isPercentage) {
      val = val / 100;
    }
    
    if (val < min) val = min;
    if (val > max) val = max;
    onChange(val);
  };

  // Para display: si es porcentaje, mostrar en formato %
  const displayValue = isPercentage 
    ? (value * 100).toFixed(step < 0.01 ? 1 : 0)
    : typeof value === 'number' 
      ? value.toFixed(step < 1 ? (step < 0.01 ? 3 : 2) : 0) 
      : value;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
      </label>
      <div className="flex items-center gap-3 mb-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center gap-1 min-w-[130px]">
          <input
            type="number"
            min={isPercentage ? min * 100 : min}
            max={isPercentage ? max * 100 : max}
            step={isPercentage ? step * 100 : step}
            value={displayValue}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {unit && <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
      {info && (
        <div className="flex items-start gap-2 mt-2">
          <div className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            ℹ️ {info}
          </div>
        </div>
      )}
    </div>
  );
};

const InterventionToggle = ({ icon, label, enabled, onToggle, config, onConfigChange, type }) => (
  <div className={`p-4 rounded-lg border-2 ${enabled ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-5 h-5 cursor-pointer"
      />
    </div>
    {enabled && (
      <div className="space-y-2 text-sm">
        {type === 'quarantine' && (
          <>
            <ParamSlider
              label="Día de Inicio de Cuarentena"
              value={config.startDay}
              onChange={(val) => onConfigChange({ startDay: val })}
              min={1}
              max={300}
              step={1}
              unit="días"
              info={`Semana ${Math.ceil(config.startDay / 7)} de la simulación`}
            />
            <ParamSlider
              label="Duración de Cuarentena"
              value={config.duration}
              onChange={(val) => onConfigChange({ duration: val })}
              min={7}
              max={365}
              step={1}
              unit="días"
              info={`${(config.duration / 7).toFixed(1)} semanas | ${(config.duration / 30).toFixed(1)} meses`}
            />
            <ParamSlider
              label="Efectividad de Cuarentena"
              value={config.effectiveness}
              onChange={(val) => onConfigChange({ effectiveness: val })}
              min={0.1}
              max={0.99}
              step={0.01}
              unit="%"
              isPercentage={true}
              info="Reducción en la tasa de transmisión durante la cuarentena"
            />
          </>
        )}
        {type === 'socialDistancing' && (
          <>
            <ParamSlider
              label="Día de Inicio de Distanciamiento"
              value={config.startDay}
              onChange={(val) => onConfigChange({ startDay: val })}
              min={1}
              max={200}
              step={1}
              unit="días"
              info={`Semana ${Math.ceil(config.startDay / 7)} de la simulación`}
            />
            <ParamSlider
              label="Reducción de Contactos Sociales"
              value={config.reduction}
              onChange={(val) => onConfigChange({ reduction: val })}
              min={0.05}
              max={0.95}
              step={0.01}
              unit="%"
              isPercentage={true}
              info="Porcentaje de reducción en contactos interpersonales diarios"
            />
          </>
        )}
        {type === 'vaccination' && (
          <>
            <ParamSlider
              label="Día de Inicio de Vacunación"
              value={config.startDay}
              onChange={(val) => onConfigChange({ startDay: val })}
              min={1}
              max={365}
              step={1}
              unit="días"
              info={`Semana ${Math.ceil(config.startDay / 7)} | Mes ${Math.ceil(config.startDay / 30)}`}
            />
            <ParamSlider
              label="Tasa de Vacunación Diaria"
              value={config.dailyRate}
              onChange={(val) => onConfigChange({ dailyRate: val })}
              min={0.0001}
              max={0.1}
              step={0.0001}
              unit="%"
              isPercentage={true}
              info={`Porcentaje de la población vacunada por día | ~${(config.dailyRate * 700).toFixed(1)}% semanal`}
            />
          </>
        )}
      </div>
    )}
  </div>
);

const AnalysisPanel = ({ analysis, scenario, department, comparison }) => {
  const levelColors = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    severe: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    moderate: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    alert: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    normal: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
  };

  const colors = levelColors[analysis.interventionLevel.level] || levelColors.normal;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold mb-6">Análisis Epidemiológico</h3>
      
      {/* Nivel de Riesgo */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-8 h-8 ${colors.text}`} />
            <div>
              <h4 className={`text-xl font-bold ${colors.text}`}>
                NIVEL: {analysis.interventionLevel.level.toUpperCase()}
              </h4>
              <p className="text-sm text-gray-700">{analysis.interventionLevel.recommendation}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">R₀ (Número Reproductivo)</p>
            <p className="text-3xl font-bold text-gray-800">{analysis.R0}</p>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Pico de Infectados"
          value={analysis.peakInfected.toLocaleString('es-BO')}
          subtitle={`Día ${analysis.peakDay}`}
        />
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          label="Casos Críticos (UCI)"
          value={analysis.criticalCases.toLocaleString('es-BO')}
          subtitle={`${analysis.icuOccupancy}% capacidad`}
          alert={parseFloat(analysis.icuOccupancy) > 100}
        />
        <MetricCard
          icon={<Info className="w-6 h-6" />}
          label="Tasa de Ataque Final"
          value={`${analysis.attackRate}%`}
          subtitle={`${analysis.totalInfected.toLocaleString('es-BO')} personas`}
        />
      </div>

      {/* Métricas Avanzadas */}
      {analysis.doublingTime && analysis.hospitalizationMetrics && (
        <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-indigo-600" />
            <p className="text-xs text-gray-600 mb-1">Tiempo de Duplicación</p>
            <p className="text-lg font-bold text-gray-800">{analysis.doublingTime} días</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-purple-600" />
            <p className="text-xs text-gray-600 mb-1">R Efectivo (medio)</p>
            <p className="text-lg font-bold text-gray-800">{analysis.effectiveR}</p>
          </div>
          <div className="text-center">
            <Activity className="w-5 h-5 mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-gray-600 mb-1">Días-Cama UCI</p>
            <p className="text-lg font-bold text-gray-800">{analysis.hospitalizationMetrics.totalHospitalDays.toLocaleString('es-BO')}</p>
          </div>
          <div className="text-center">
            <Zap className="w-5 h-5 mx-auto mb-2 text-orange-600" />
            <p className="text-xs text-gray-600 mb-1">Mortalidad Estimada</p>
            <p className="text-lg font-bold text-gray-800">{analysis.mortalityEstimates.estimatedDeaths.toLocaleString('es-BO')}</p>
          </div>
        </div>
      )}

      {/* Alertas Tempranas */}
      {analysis.alerts && analysis.alerts.alerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h4 className="font-bold text-lg">Sistema de Alertas Tempranas</h4>
          </div>
          <div className="space-y-2">
            {analysis.alerts.alerts.slice(0, 3).map((alert, idx) => {
              const alertColors = {
                'CRÍTICO': 'bg-red-100 border-red-400 text-red-800',
                'ROJO': 'bg-orange-100 border-orange-400 text-orange-800',
                'NARANJA': 'bg-yellow-100 border-yellow-400 text-yellow-800',
                'AMARILLO': 'bg-yellow-50 border-yellow-300 text-yellow-700'
              };
              return (
                <div key={idx} className={`p-3 rounded-lg border-l-4 ${alertColors[alert.level] || 'bg-gray-100 border-gray-400'}`}>
                  <p className="font-semibold text-sm mb-1">{alert.type}: {alert.message}</p>
                  <p className="text-xs opacity-90">Acción recomendada: {alert.action}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impacto Económico */}
      {analysis.economicImpact && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-6 h-6 text-green-600" />
            <h4 className="font-bold text-lg">Estimación de Impacto Económico</h4>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600">Costo Total Estimado</p>
              <p className="text-xl font-bold text-gray-800">
                Bs. {(analysis.economicImpact.totalCost / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Costo per Cápita</p>
              <p className="text-xl font-bold text-gray-800">
                Bs. {analysis.economicImpact.costPerCapita.toLocaleString('es-BO')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Impacto en GDP</p>
              <p className="text-xl font-bold text-gray-800">
                {analysis.economicImpact.gdpImpact}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparación */}
      {comparison && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
          <h4 className="font-bold text-lg mb-3">Impacto de las Intervenciones</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <ImpactCard
              label="Reducción del Pico"
              value={`${((1 - comparison.intervention.peakInfected / comparison.baseline.peakInfected) * 100).toFixed(1)}%`}
              cases={`${(comparison.baseline.peakInfected - comparison.intervention.peakInfected).toLocaleString('es-BO')} casos evitados`}
            />
            <ImpactCard
              label="Reducción UCI"
              value={`${((1 - parseFloat(comparison.intervention.icuOccupancy) / parseFloat(comparison.baseline.icuOccupancy)) * 100).toFixed(1)}%`}
              cases={`De ${comparison.baseline.icuOccupancy}% a ${comparison.intervention.icuOccupancy}%`}
            />
            <ImpactCard
              label="Casos Totales Evitados"
              value={(comparison.baseline.totalInfected - comparison.intervention.totalInfected).toLocaleString('es-BO')}
              cases={`${((1 - comparison.intervention.totalInfected / comparison.baseline.totalInfected) * 100).toFixed(1)}% reducción`}
            />
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="mt-6 p-6 bg-gray-50 rounded-xl">
        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-blue-600" />
          Recomendaciones Técnicas
        </h4>
        <ul className="space-y-2 text-gray-700">
          {parseFloat(analysis.icuOccupancy) > 100 && (
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>
                <strong>CRÍTICO:</strong> La demanda de UCI ({analysis.criticalCases.toLocaleString('es-BO')} camas) 
                supera la capacidad disponible ({department.hospitalCapacity.icuBeds.toLocaleString('es-BO')} camas) 
                en {(parseFloat(analysis.icuOccupancy) - 100).toFixed(0)}%. Se requiere implementación inmediata de 
                medidas restrictivas y ampliación de capacidad hospitalaria.
              </span>
            </li>
          )}
          {parseFloat(analysis.icuOccupancy) > 85 && parseFloat(analysis.icuOccupancy) <= 100 && (
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>
                <strong>ALTO RIESGO:</strong> Ocupación UCI proyectada en {analysis.icuOccupancy}%. 
                Implementar protocolo de cuarentena preventiva y activar plan de contingencia hospitalaria.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Con R₀ = {analysis.R0}, {parseFloat(analysis.R0) > 1 
                ? `la enfermedad se propaga exponencialmente. Se requiere reducir el número reproductivo por debajo de 1 mediante intervenciones combinadas.`
                : 'la enfermedad tiende a extinguirse naturalmente sin necesidad de medidas restrictivas adicionales.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              El pico de infectados ocurre aproximadamente en el día {analysis.peakDay}. 
              Las intervenciones son más efectivas si se implementan antes de este punto crítico.
            </span>
          </li>
          {comparison && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>
                Las intervenciones aplicadas reducen el pico de infectados en {((1 - comparison.intervention.peakInfected / comparison.baseline.peakInfected) * 100).toFixed(1)}%, 
                evitando {(comparison.baseline.totalInfected - comparison.intervention.totalInfected).toLocaleString('es-BO')} casos totales. 
                Esta estrategia es {parseFloat(comparison.intervention.icuOccupancy) <= 100 ? 'viable y recomendada' : 'insuficiente y requiere medidas adicionales'}.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, subtitle, alert }) => (
  <div className={`p-4 rounded-lg border-2 ${alert ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <p className="text-sm font-semibold text-gray-700">{label}</p>
    </div>
    <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
    <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
  </div>
);

const ImpactCard = ({ label, value, cases }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-green-600">{value}</p>
    <p className="text-xs text-gray-600 mt-1">{cases}</p>
  </div>
);

const LevelBadge = ({ level }) => {
  const badges = {
    critical: { text: 'CRÍTICO', color: 'bg-red-100 text-red-700' },
    severe: { text: 'SEVERO', color: 'bg-orange-100 text-orange-700' },
    moderate: { text: 'MODERADO', color: 'bg-yellow-100 text-yellow-700' },
    alert: { text: 'ALERTA', color: 'bg-blue-100 text-blue-700' },
    normal: { text: 'NORMAL', color: 'bg-green-100 text-green-700' }
  };
  
  const badge = badges[level] || badges.normal;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
      {badge.text}
    </span>
  );
};

export default IntegratedSimulation;
