import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Shield, Lock, Syringe, AlertTriangle, CheckCircle, TrendingDown, Users, Activity, FileText, Download } from 'lucide-react';
import { simulateWithInterventions } from '../utils/sirInterventions';
import { getAllDepartments, boliviaNational, getInterventionLevel } from '../data/boliviaData';
import { downloadPDFReport } from '../utils/reportGenerator';

const InterventionAnalysis = () => {
  const [scenarios, setScenarios] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(boliviaNational);
  const departments = getAllDepartments();
  
  // Parámetros base (sin intervención)
  const [baseParams, setBaseParams] = useState({
    S0: boliviaNational.population - 100,
    I0: 100,
    R0: 0,
    beta: 0.35,
    gamma: 0.1,
    days: 365
  });

  // Parámetros de intervenciones
  const [interventions, setInterventions] = useState({
    // Cuarentena
    quarantine: {
      enabled: false,
      startDay: 30,
      duration: 60,
      effectiveness: 0.7 // Reduce contactos en 70%
    },
    // Vacunación
    vaccination: {
      enabled: false,
      startDay: 60,
      dailyRate: 0.005 // 0.5% de población por día
    },
    // Distanciamiento social
    socialDistancing: {
      enabled: false,
      startDay: 20,
      reduction: 0.5 // Reduce beta en 50%
    },
    // Aumento de capacidad hospitalaria
    hospitalCapacity: selectedDepartment.hospitalCapacity.icuBeds
  });
  
  // Actualizar capacidad hospitalaria cuando cambia departamento
  React.useEffect(() => {
    setInterventions(prev => ({
      ...prev,
      hospitalCapacity: selectedDepartment.hospitalCapacity.icuBeds
    }));
    setBaseParams(prev => ({
      ...prev,
      S0: selectedDepartment.population - prev.I0
    }));
  }, [selectedDepartment]);

  const runScenarioComparison = () => {
    const newScenarios = [];

    // Escenario 1: Sin intervención
    const noIntervention = simulateWithInterventions({
      ...baseParams,
      interventions: {}
    });
    newScenarios.push({
      name: 'Sin Intervención',
      data: noIntervention,
      color: '#EF4444',
      description: 'Evolución natural de la epidemia'
    });

    // Escenario 2: Solo cuarentena
    const withQuarantine = simulateWithInterventions({
      ...baseParams,
      interventions: {
        quarantine: { ...interventions.quarantine, enabled: true }
      }
    });
    newScenarios.push({
      name: 'Con Cuarentena',
      data: withQuarantine,
      color: '#F59E0B',
      description: `Cuarentena ${interventions.quarantine.effectiveness * 100}% efectiva desde día ${interventions.quarantine.startDay}`
    });

    // Escenario 3: Distanciamiento social
    const withDistancing = simulateWithInterventions({
      ...baseParams,
      interventions: {
        socialDistancing: { ...interventions.socialDistancing, enabled: true }
      }
    });
    newScenarios.push({
      name: 'Distanciamiento Social',
      data: withDistancing,
      color: '#3B82F6',
      description: `Reducción de contactos ${interventions.socialDistancing.reduction * 100}%`
    });

    // Escenario 4: Cuarentena + Vacunación
    const withBoth = simulateWithInterventions({
      ...baseParams,
      interventions: {
        quarantine: { ...interventions.quarantine, enabled: true },
        vaccination: { ...interventions.vaccination, enabled: true },
        socialDistancing: { ...interventions.socialDistancing, enabled: true }
      }
    });
    newScenarios.push({
      name: 'Intervención Completa',
      data: withBoth,
      color: '#10B981',
      description: 'Cuarentena + Distanciamiento + Vacunación'
    });

    setScenarios(newScenarios);
    setShowComparison(true);
  };

  const resetScenarios = () => {
    setScenarios([]);
    setShowComparison(false);
  };

  // Datos para el gráfico comparativo
  const chartData = {
    labels: scenarios.length > 0 ? scenarios[0].data.time.map((t, i) => i % 20 === 0 ? `Día ${Math.round(t)}` : '') : [],
    datasets: scenarios.map(scenario => ({
      label: `Infectados - ${scenario.name}`,
      data: scenario.data.I,
      borderColor: scenario.color,
      backgroundColor: scenario.color + '20',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 0,
    }))
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 15, font: { size: 12 } }
      },
      title: {
        display: true,
        text: 'Comparación de Escenarios: Infectados Activos',
        font: { size: 18, weight: 'bold' },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${Math.round(context.parsed.y).toLocaleString()} personas`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString()
        }
      }
    }
  };

  // Función para evaluar si se necesita cuarentena
  const evaluateQuarantineNeed = (scenario) => {
    const peakInfected = Math.max(...scenario.data.I);
    const hospitalCapacity = selectedDepartment.hospitalCapacity.icuBeds;
    const criticalRate = 0.05; // 5% de infectados necesitan hospitalización
    const criticalCases = peakInfected * criticalRate;
    const icuOccupancy = criticalCases / hospitalCapacity;
    
    const interventionLevel = getInterventionLevel(icuOccupancy);
    
    return {
      peakInfected: Math.round(peakInfected),
      criticalCases: Math.round(criticalCases),
      exceedsCapacity: criticalCases > hospitalCapacity,
      capacityUsage: ((criticalCases / hospitalCapacity) * 100).toFixed(1),
      recommendation: interventionLevel.recommendation,
      level: interventionLevel.level
    };
  };
  
  // Función para exportar reporte PDF
  const handleExportPDF = async () => {
    if (!showComparison || scenarios.length === 0) {
      alert('Por favor, ejecute primero la simulación de escenarios');
      return;
    }
    
    const reportData = {
      department: selectedDepartment,
      scenarios: scenarios,
      baseParams: baseParams,
      interventions: interventions,
      selectedScenario: scenarios[0].name,
      chartElementId: 'comparison-chart',
      timestamp: new Date().toISOString()
    };
    
    try {
      await downloadPDFReport(reportData, `reporte_sedes_${selectedDepartment.name.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF. Por favor, intente nuevamente.');
    }
  };

  return (
    <motion.section 
      className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Análisis de Intervenciones de Salud Pública
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Simulación de escenarios para toma de decisiones - SEDES Bolivia
          </p>
          
          {/* Selector de Departamento */}
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccione Departamento
            </label>
            <select
              value={selectedDepartment.name}
              onChange={(e) => {
                const dept = departments.find(d => d.name === e.target.value) || boliviaNational;
                setSelectedDepartment(dept);
                setShowComparison(false);
                setScenarios([]);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
            >
              <option value={boliviaNational.name}>{boliviaNational.name}</option>
              {departments.map(dept => (
                <option key={dept.key} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          {/* Información del Departamento Seleccionado */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-600">Población</p>
              <p className="text-xl font-bold text-gray-800">{selectedDepartment.population.toLocaleString('es-BO')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-600">Camas Hospitalarias</p>
              <p className="text-xl font-bold text-gray-800">{selectedDepartment.hospitalCapacity.totalBeds.toLocaleString('es-BO')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-600">Camas UCI</p>
              <p className="text-xl font-bold text-blue-600">{selectedDepartment.hospitalCapacity.icuBeds.toLocaleString('es-BO')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-600">Ventiladores</p>
              <p className="text-xl font-bold text-gray-800">{selectedDepartment.hospitalCapacity.ventilators.toLocaleString('es-BO')}</p>
            </div>
          </div>
        </motion.div>

        {/* Panel de Configuración */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Parámetros Base */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Parámetros Poblacionales
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Población Total (N)
                </label>
                <input
                  type="number"
                  value={baseParams.S0}
                  onChange={(e) => setBaseParams({...baseParams, S0: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Infectados Iniciales (I₀)
                </label>
                <input
                  type="number"
                  value={baseParams.I0}
                  onChange={(e) => setBaseParams({...baseParams, I0: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tasa de Contagio (β): {baseParams.beta}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={baseParams.beta}
                  onChange={(e) => setBaseParams({...baseParams, beta: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">R₀ = {(baseParams.beta / baseParams.gamma).toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tasa de Recuperación (γ): {baseParams.gamma}
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.01"
                  value={baseParams.gamma}
                  onChange={(e) => setBaseParams({...baseParams, gamma: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Período infeccioso: {(1/baseParams.gamma).toFixed(1)} días</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Capacidad Hospitalaria (camas UCI)
                </label>
                <input
                  type="number"
                  value={interventions.hospitalCapacity}
                  onChange={(e) => setInterventions({...interventions, hospitalCapacity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Configuración de Intervenciones */}
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
              {/* Cuarentena */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">Cuarentena Estricta</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={interventions.quarantine.enabled}
                    onChange={(e) => setInterventions({
                      ...interventions,
                      quarantine: {...interventions.quarantine, enabled: e.target.checked}
                    })}
                    className="w-5 h-5"
                  />
                </div>
                {interventions.quarantine.enabled && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <label>Inicio (día): {interventions.quarantine.startDay}</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={interventions.quarantine.startDay}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          quarantine: {...interventions.quarantine, startDay: parseInt(e.target.value)}
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label>Duración (días): {interventions.quarantine.duration}</label>
                      <input
                        type="range"
                        min="14"
                        max="120"
                        value={interventions.quarantine.duration}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          quarantine: {...interventions.quarantine, duration: parseInt(e.target.value)}
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label>Efectividad: {(interventions.quarantine.effectiveness * 100).toFixed(0)}%</label>
                      <input
                        type="range"
                        min="0.3"
                        max="0.95"
                        step="0.05"
                        value={interventions.quarantine.effectiveness}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          quarantine: {...interventions.quarantine, effectiveness: parseFloat(e.target.value)}
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Distanciamiento Social */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Distanciamiento Social</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={interventions.socialDistancing.enabled}
                    onChange={(e) => setInterventions({
                      ...interventions,
                      socialDistancing: {...interventions.socialDistancing, enabled: e.target.checked}
                    })}
                    className="w-5 h-5"
                  />
                </div>
                {interventions.socialDistancing.enabled && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <label>Inicio (día): {interventions.socialDistancing.startDay}</label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={interventions.socialDistancing.startDay}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          socialDistancing: {...interventions.socialDistancing, startDay: parseInt(e.target.value)}
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label>Reducción contactos: {(interventions.socialDistancing.reduction * 100).toFixed(0)}%</label>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.05"
                        value={interventions.socialDistancing.reduction}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          socialDistancing: {...interventions.socialDistancing, reduction: parseFloat(e.target.value)}
                        })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Vacunación */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Campaña de Vacunación</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={interventions.vaccination.enabled}
                    onChange={(e) => setInterventions({
                      ...interventions,
                      vaccination: {...interventions.vaccination, enabled: e.target.checked}
                    })}
                    className="w-5 h-5"
                  />
                </div>
                {interventions.vaccination.enabled && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <label>Inicio (día): {interventions.vaccination.startDay}</label>
                      <input
                        type="range"
                        min="30"
                        max="180"
                        value={interventions.vaccination.startDay}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          vaccination: {...interventions.vaccination, startDay: parseInt(e.target.value)}
                        })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label>Tasa diaria: {(interventions.vaccination.dailyRate * 100).toFixed(2)}% población</label>
                      <input
                        type="range"
                        min="0.001"
                        max="0.02"
                        step="0.001"
                        value={interventions.vaccination.dailyRate}
                        onChange={(e) => setInterventions({
                          ...interventions,
                          vaccination: {...interventions.vaccination, dailyRate: parseFloat(e.target.value)}
                        })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ~{Math.round(baseParams.S0 * interventions.vaccination.dailyRate).toLocaleString()} personas/día
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <motion.button
            onClick={runScenarioComparison}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="w-5 h-5" />
            Simular Escenarios
          </motion.button>
          {showComparison && (
            <>
              <motion.button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                Exportar Reporte PDF
              </motion.button>
              <motion.button
                onClick={resetScenarios}
                className="flex items-center gap-2 px-8 py-4 bg-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reiniciar
              </motion.button>
            </>
          )}
        </div>

        {/* Resultados de Comparación */}
        {showComparison && scenarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Gráfico Comparativo */}
            <div className="bg-white rounded-2xl shadow-xl p-8" id="comparison-chart">
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Tabla de Comparación de Métricas */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Análisis Comparativo de Escenarios</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Escenario</th>
                      <th className="px-4 py-3 text-center font-semibold">Pico Infectados</th>
                      <th className="px-4 py-3 text-center font-semibold">Casos Críticos</th>
                      <th className="px-4 py-3 text-center font-semibold">Uso Capacidad</th>
                      <th className="px-4 py-3 text-center font-semibold">Ataque Final</th>
                      <th className="px-4 py-3 text-center font-semibold">Recomendación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((scenario, idx) => {
                      const analysis = evaluateQuarantineNeed(scenario);
                      const attackRate = ((scenario.data.R[scenario.data.R.length - 1] / baseParams.S0) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{backgroundColor: scenario.color}}></div>
                              <div>
                                <div className="font-semibold">{scenario.name}</div>
                                <div className="text-xs text-gray-500">{scenario.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {analysis.peakInfected.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {analysis.criticalCases.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${analysis.exceedsCapacity ? 'text-red-600' : 'text-green-600'}`}>
                              {analysis.capacityUsage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {attackRate}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              analysis.level === 'critical' ? 'bg-red-100 text-red-700' :
                              analysis.level === 'severe' ? 'bg-orange-100 text-orange-700' :
                              analysis.level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              analysis.level === 'alert' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {analysis.recommendation}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recomendaciones para SEDES */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                Recomendaciones para SEDES {selectedDepartment.name}
              </h3>
              <div className="space-y-3 text-lg">
                {scenarios.map((scenario, idx) => {
                  const analysis = evaluateQuarantineNeed(scenario);
                  if (idx === 0 && analysis.exceedsCapacity) {
                    return (
                      <div key={idx} className="bg-white/10 backdrop-blur p-4 rounded-lg">
                        <strong>ALERTA:</strong> Sin intervención, el sistema de salud se vería sobrepasado en {analysis.capacityUsage}%. 
                        {analysis.recommendation}. Se requiere implementar medidas de control inmediatas para evitar colapso del sistema de salud.
                      </div>
                    );
                  }
                  if (idx === scenarios.length - 1 && !analysis.exceedsCapacity) {
                    return (
                      <div key={idx} className="bg-white/10 backdrop-blur p-4 rounded-lg">
                        <strong>RECOMENDACIÓN:</strong> La combinación de intervenciones mantiene los casos críticos en {analysis.capacityUsage}% 
                        de la capacidad hospitalaria ({selectedDepartment.hospitalCapacity.icuBeds} camas UCI disponibles). Esta estrategia es viable y recomendada.
                      </div>
                    );
                  }
                  return null;
                })}
                <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                  <strong>ANÁLISIS TÉCNICO:</strong> Compare los escenarios para determinar el balance óptimo entre 
                  control epidemiológico e impacto socioeconómico. Las cuarentenas tempranas y el distanciamiento 
                  sostenido son las estrategias más efectivas según el modelo matemático SIR.
                </div>
                <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
                  <strong>NOTA METODOLÓGICA:</strong> Los resultados se basan en ecuaciones diferenciales del modelo SIR 
                  resueltas mediante método Runge-Kutta de orden 4. Los parámetros β y γ determinan la dinámica de transmisión. 
                  R₀ = β/γ = {(baseParams.beta / baseParams.gamma).toFixed(2)} indica que cada infectado contagia a {(baseParams.beta / baseParams.gamma).toFixed(1)} personas en promedio.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default InterventionAnalysis;
