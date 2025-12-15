import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, AlertCircle, Info, 
  Activity, TrendingUp, MapPin, Calendar 
} from 'lucide-react';
import { 
  diseaseProfiles, 
  getDiseasesByCategory,
  adjustParamsForPopulation,
  getInterventionRecommendations 
} from '../data/diseaseProfiles';

const DiseaseSelector = ({ isOpen, onClose, onSelectDisease, selectedDepartment }) => {
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const categories = getDiseasesByCategory();

  const handleSelect = (disease) => {
    setSelectedDisease(disease);
    setShowDetails(true);
  };

  const handleConfirm = () => {
    if (selectedDisease) {
      const adjustedParams = adjustParamsForPopulation(
        selectedDisease.params,
        selectedDepartment.population
      );
      
      onSelectDisease({
        disease: selectedDisease,
        params: adjustedParams,
        interventions: selectedDisease.interventions
      });
      
      onClose();
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'ALTA': return 'text-red-600 bg-red-100 border-red-300';
      case 'MODERADA-ALTA': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'MODERADA': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-10 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Perfiles de Enfermedades - Bolivia
                  </h2>
                  <p className="text-blue-100">
                    Seleccione una enfermedad con parámetros precargados basados en datos epidemiológicos
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!showDetails ? (
                /* Lista de Enfermedades */
                <div className="space-y-6">
                  {Object.entries(categories).map(([category, diseases]) => (
                    <div key={category}>
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        {category}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {diseases.map((disease) => (
                          <DiseaseCard
                            key={disease.id}
                            disease={disease}
                            onSelect={() => handleSelect(disease)}
                            getSeverityColor={getSeverityColor}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Detalles de Enfermedad */
                <DiseaseDetails
                  disease={selectedDisease}
                  department={selectedDepartment}
                  getSeverityColor={getSeverityColor}
                  onBack={() => setShowDetails(false)}
                  onConfirm={handleConfirm}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Tarjeta de Enfermedad
const DiseaseCard = ({ disease, onSelect, getSeverityColor }) => (
  <motion.button
    onClick={onSelect}
    className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-blue-500 hover:shadow-xl transition-all"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">{disease.icon}</div>
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getSeverityColor(disease.severity)}`}>
        {disease.severity}
      </span>
    </div>
    
    <h4 className="text-lg font-bold text-gray-800 mb-2">{disease.name}</h4>
    <p className="text-sm text-gray-600 mb-3">{disease.description}</p>
    
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2 text-gray-600">
        <TrendingUp className="w-4 h-4" />
        <span>R₀ = {disease.params.R0_value}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Activity className="w-4 h-4" />
        <span>Modelo: {disease.modelType}</span>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-end text-blue-600 font-semibold">
      <span>Ver detalles</span>
      <ChevronRight className="w-4 h-4 ml-1" />
    </div>
  </motion.button>
);

// Detalles Completos de Enfermedad
const DiseaseDetails = ({ disease, department, getSeverityColor, onBack, onConfirm }) => {
  const recommendations = getInterventionRecommendations(disease.id);
  const adjustedParams = adjustParamsForPopulation(disease.params, department.population);

  return (
    <div className="space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{disease.icon}</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{disease.name}</h3>
              <p className="text-gray-600">{disease.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getSeverityColor(disease.severity)}`}>
              Gravedad: {disease.severity}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-300">
              Categoría: {disease.category}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Características */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Características Epidemiológicas
          </h4>
          <div className="space-y-2 text-sm">
            <DetailRow label="Transmisión" value={disease.characteristics.transmissionMode} />
            <DetailRow label="Período Incubación" value={disease.characteristics.incubationPeriod} />
            <DetailRow label="Período Infeccioso" value={disease.characteristics.infectiousPeriod} />
            <DetailRow label="Contagiosidad" value={disease.characteristics.contagiousPeriod} />
          </div>
        </div>

        {/* Datos Clínicos */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Datos Clínicos
          </h4>
          <div className="space-y-2 text-sm">
            <DetailRow label="Hospitalización" value={`${(disease.clinicalData.hospitalizationRate * 100).toFixed(1)}%`} />
            <DetailRow label="Requiere UCI" value={`${(disease.clinicalData.icuRate * 100).toFixed(1)}%`} />
            <DetailRow label="Ventilador" value={`${(disease.clinicalData.ventilatorRate * 100).toFixed(2)}%`} />
            <DetailRow label="Letalidad (IFR)" value={`${(disease.clinicalData.caseFatalityRate * 100).toFixed(2)}%`} />
            <DetailRow label="Estancia Hospital" value={`${disease.clinicalData.averageHospitalStay} días`} />
          </div>
        </div>
      </div>

      {/* Datos de Bolivia */}
      {disease.boliviaData && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Datos Específicos de Bolivia
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {disease.boliviaData.endemic && (
              <div className="col-span-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="font-bold text-yellow-800">ALERTA: ENFERMEDAD ENDÉMICA EN BOLIVIA</p>
              </div>
            )}
            
            {disease.boliviaData.firstCase && (
              <DetailRow label="Primer Caso" value={new Date(disease.boliviaData.firstCase).toLocaleDateString('es-BO')} />
            )}
            {disease.boliviaData.annualCases && (
              <DetailRow label="Casos Anuales" value={disease.boliviaData.annualCases.toLocaleString('es-BO')} />
            )}
            {disease.boliviaData.seasonality && (
              <DetailRow label="Estacionalidad" value={disease.boliviaData.seasonality} />
            )}
            {disease.boliviaData.highRiskDepartments && (
              <DetailRow 
                label="Depts. Alto Riesgo" 
                value={disease.boliviaData.highRiskDepartments.join(', ')} 
                colSpan={2}
              />
            )}
            {disease.boliviaData.totalCasesReported && (
              <DetailRow label="Total Casos (histórico)" value={disease.boliviaData.totalCasesReported.toLocaleString('es-BO')} />
            )}
            {disease.boliviaData.vaccinationCoverage && (
              <DetailRow 
                label="Cobertura Vacunal" 
                value={`${(disease.boliviaData.vaccinationCoverage * 100).toFixed(0)}%`} 
              />
            )}
          </div>
        </div>
      )}

      {/* Parámetros del Modelo */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Parámetros del Modelo {disease.modelType}
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <ParamCard label="β (Transmisión)" value={disease.params.beta.toFixed(3)} />
          <ParamCard label="γ (Recuperación)" value={disease.params.gamma.toFixed(3)} />
          {disease.modelType === 'SEIR' && (
            <ParamCard label="σ (Progresión)" value={disease.params.sigma.toFixed(3)} />
          )}
          <ParamCard label="R₀ Básico" value={disease.params.R0_value.toFixed(1)} highlight />
          <ParamCard 
            label="Período Infeccioso" 
            value={`${(1 / disease.params.gamma).toFixed(1)} días`} 
          />
          {disease.modelType === 'SEIR' && (
            <ParamCard 
              label="Período Incubación" 
              value={`${(1 / disease.params.sigma).toFixed(1)} días`} 
            />
          )}
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
          <p className="text-sm text-gray-700">
            <strong>Configuración inicial para {department.name}:</strong>
          </p>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div><span className="font-semibold">S₀:</span> {adjustedParams.S0.toLocaleString('es-BO')}</div>
            {disease.modelType === 'SEIR' && (
              <div><span className="font-semibold">E₀:</span> {adjustedParams.E0.toLocaleString('es-BO')}</div>
            )}
            <div><span className="font-semibold">I₀:</span> {adjustedParams.I0.toLocaleString('es-BO')}</div>
            <div><span className="font-semibold">R₀:</span> {adjustedParams.R0.toLocaleString('es-BO')}</div>
          </div>
        </div>
      </div>

      {/* Recomendaciones de Intervención */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-cyan-600" />
            Intervenciones Recomendadas
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{rec.intervention.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    rec.priority === 'ALTA' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    Prioridad: {rec.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Efectividad: <strong>{(rec.effectiveness * 100).toFixed(0)}%</strong></p>
                  {rec.note && <p className="mt-1 italic">{rec.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de Confirmación */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          Volver
        </button>
        <button
          onClick={onConfirm}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
        >
          Cargar Esta Enfermedad
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Componentes auxiliares
const DetailRow = ({ label, value, colSpan = 1 }) => (
  <div className={`${colSpan === 2 ? 'col-span-2' : ''}`}>
    <span className="font-semibold text-gray-700">{label}:</span>{' '}
    <span className="text-gray-600">{value}</span>
  </div>
);

const ParamCard = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-lg ${highlight ? 'bg-orange-200 border-2 border-orange-400' : 'bg-white border border-orange-200'}`}>
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-orange-700' : 'text-gray-800'}`}>{value}</p>
  </div>
);

export default DiseaseSelector;
