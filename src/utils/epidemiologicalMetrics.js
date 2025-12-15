/**
 * Métricas epidemiológicas avanzadas para análisis profesional SEDES
 */

/**
 * Calcula el tiempo de duplicación de casos
 * @param {Array} I - Array de infectados en el tiempo
 * @param {Array} time - Array de tiempos
 * @returns {number} - Tiempo de duplicación en días
 */
export function calculateDoublingTime(I, time) {
  // Buscar la fase de crecimiento exponencial inicial
  const initialGrowthPhase = I.slice(0, Math.floor(I.length * 0.2));
  
  for (let i = 1; i < initialGrowthPhase.length - 1; i++) {
    if (I[i] >= 2 * I[0] && I[i] > 10) {
      return time[i].toFixed(2);
    }
  }
  
  // Método alternativo: ajuste exponencial
  const growthRate = calculateGrowthRate(I, time);
  if (growthRate > 0) {
    return (Math.log(2) / growthRate).toFixed(2);
  }
  
  return 'N/A';
}

/**
 * Calcula la tasa de crecimiento en fase exponencial
 */
function calculateGrowthRate(I, time) {
  const n = Math.min(20, Math.floor(I.length * 0.15));
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    if (I[i] > 0) {
      const x = time[i];
      const y = Math.log(I[i]);
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}

/**
 * Calcula el número reproductivo efectivo en el tiempo
 * @param {Array} S - Susceptibles
 * @param {number} N - Población total
 * @param {number} R0 - Número reproductivo básico
 * @returns {Array} - R(t) efectivo en cada punto
 */
export function calculateEffectiveReproduction(S, N, R0) {
  return S.map(s => (R0 * s / N).toFixed(3));
}

/**
 * Calcula métricas de carga hospitalaria
 * @param {Object} scenario - Escenario de simulación
 * @param {Object} hospitalCapacity - Capacidad hospitalaria
 * @returns {Object} - Métricas de hospitalización
 */
export function calculateHospitalizationMetrics(scenario, hospitalCapacity) {
  const { I } = scenario.data;
  
  // Tasas basadas en datos epidemiológicos reales
  const hospitalizationRate = 0.15; // 15% requiere hospitalización
  const icuRate = 0.05; // 5% requiere UCI
  const ventilatorRate = 0.025; // 2.5% requiere ventilador
  
  const hospitalizations = I.map(i => Math.round(i * hospitalizationRate));
  const icuCases = I.map(i => Math.round(i * icuRate));
  const ventilatorCases = I.map(i => Math.round(i * ventilatorRate));
  
  const maxHospitalizations = Math.max(...hospitalizations);
  const maxICU = Math.max(...icuCases);
  const maxVentilators = Math.max(...ventilatorCases);
  
  // Días de saturación
  const icuSaturationDays = icuCases.filter(cases => 
    cases > hospitalCapacity.icuBeds
  ).length;
  
  const ventilatorSaturationDays = ventilatorCases.filter(cases => 
    cases > hospitalCapacity.ventilators
  ).length;
  
  return {
    maxHospitalizations,
    maxICU,
    maxVentilators,
    icuOccupancyRate: ((maxICU / hospitalCapacity.icuBeds) * 100).toFixed(1),
    ventilatorOccupancyRate: ((maxVentilators / hospitalCapacity.ventilators) * 100).toFixed(1),
    icuSaturationDays,
    ventilatorSaturationDays,
    totalHospitalDays: hospitalizations.reduce((sum, h) => sum + h, 0),
    avgDailyICU: (icuCases.reduce((sum, c) => sum + c, 0) / icuCases.length).toFixed(0)
  };
}

/**
 * Calcula métricas de mortalidad estimada
 * @param {Object} scenario - Escenario de simulación
 * @param {Object} hospitalCapacity - Capacidad hospitalaria
 * @returns {Object} - Estimaciones de mortalidad
 */
export function calculateMortalityEstimates(scenario, hospitalCapacity) {
  const { I, R } = scenario.data;
  const totalInfected = R[R.length - 1];
  
  // Tasas de fatalidad basadas en literatura científica
  const baseIFR = 0.006; // 0.6% sin colapso hospitalario
  const collapsedIFR = 0.025; // 2.5% con colapso hospitalario
  
  const icuCases = I.map(i => Math.round(i * 0.05));
  const maxICU = Math.max(...icuCases);
  
  // Si hay colapso, usar IFR más alto
  const effectiveIFR = maxICU > hospitalCapacity.icuBeds ? collapsedIFR : baseIFR;
  
  const estimatedDeaths = Math.round(totalInfected * effectiveIFR);
  const deathsWithoutCollapse = Math.round(totalInfected * baseIFR);
  const additionalDeaths = estimatedDeaths - deathsWithoutCollapse;
  
  return {
    estimatedDeaths,
    deathsWithoutCollapse,
    additionalDeaths: Math.max(0, additionalDeaths),
    mortalityRate: (effectiveIFR * 100).toFixed(2),
    hospitalCollapseRisk: maxICU > hospitalCapacity.icuBeds
  };
}

/**
 * Realiza análisis de sensibilidad de parámetros
 * @param {Object} baseParams - Parámetros base
 * @returns {Object} - Rangos de resultados según variación de parámetros
 */
export function sensitivityAnalysis(baseParams) {
  const betaVariations = [0.8, 0.9, 1.0, 1.1, 1.2].map(factor => ({
    factor,
    beta: baseParams.beta * factor,
    R0: (baseParams.beta * factor / baseParams.gamma).toFixed(2)
  }));
  
  const gammaVariations = [0.8, 0.9, 1.0, 1.1, 1.2].map(factor => ({
    factor,
    gamma: baseParams.gamma * factor,
    R0: (baseParams.beta / (baseParams.gamma * factor)).toFixed(2),
    infectiousPeriod: (1 / (baseParams.gamma * factor)).toFixed(1)
  }));
  
  return {
    betaVariations,
    gammaVariations,
    criticalThreshold: {
      betaMax: (baseParams.gamma * 1.0).toFixed(3), // Para R0 = 1
      gammaMin: (baseParams.beta / 1.0).toFixed(3)
    }
  };
}

/**
 * Calcula indicadores de alerta temprana
 * @param {Object} scenario - Escenario actual
 * @param {Object} previousData - Datos históricos (si existen)
 * @returns {Object} - Indicadores de alerta
 */
export function earlyWarningIndicators(scenario, previousData = null) {
  const { I, time } = scenario.data;
  
  // Tasa de crecimiento actual (últimos 7 días simulados)
  const window = 35; // 7 días * 5 puntos por día
  const recentI = I.slice(-window);
  const growthRate7d = calculateGrowthRate(recentI, time.slice(-window));
  
  // Aceleración de casos
  const midWindow = Math.floor(window / 2);
  const firstHalfGrowth = calculateGrowthRate(recentI.slice(0, midWindow), time.slice(-window, -midWindow));
  const secondHalfGrowth = calculateGrowthRate(recentI.slice(midWindow), time.slice(-midWindow));
  const acceleration = secondHalfGrowth - firstHalfGrowth;
  
  const warnings = [];
  let riskLevel = 'BAJO';
  
  if (growthRate7d > 0.15) {
    warnings.push('Crecimiento exponencial rápido detectado (>15% diario)');
    riskLevel = 'CRÍTICO';
  } else if (growthRate7d > 0.08) {
    warnings.push('Crecimiento exponencial moderado (8-15% diario)');
    riskLevel = 'ALTO';
  } else if (growthRate7d > 0.03) {
    warnings.push('Crecimiento sostenido (3-8% diario)');
    riskLevel = 'MODERADO';
  }
  
  if (acceleration > 0.05) {
    warnings.push('Aceleración de casos en aumento');
    if (riskLevel === 'MODERADO') riskLevel = 'ALTO';
  }
  
  return {
    growthRate7d: (growthRate7d * 100).toFixed(2),
    doublingTime: calculateDoublingTime(I, time),
    acceleration: (acceleration * 100).toFixed(2),
    riskLevel,
    warnings
  };
}

/**
 * Genera escenarios probabilísticos (mejor caso, esperado, peor caso)
 * @param {Object} baseParams - Parámetros base
 * @returns {Array} - Array de configuraciones de escenarios
 */
export function generateProbabilisticScenarios(baseParams) {
  return [
    {
      name: 'Mejor Caso',
      description: 'Intervenciones altamente efectivas, alta adherencia',
      probability: 0.15,
      params: {
        ...baseParams,
        beta: baseParams.beta * 0.6,
        gamma: baseParams.gamma * 1.2
      },
      color: '#10b981'
    },
    {
      name: 'Escenario Esperado',
      description: 'Intervenciones moderadamente efectivas',
      probability: 0.50,
      params: {
        ...baseParams,
        beta: baseParams.beta * 0.8,
        gamma: baseParams.gamma * 1.0
      },
      color: '#f59e0b'
    },
    {
      name: 'Peor Caso',
      description: 'Baja adherencia, variante más transmisible',
      probability: 0.25,
      params: {
        ...baseParams,
        beta: baseParams.beta * 1.3,
        gamma: baseParams.gamma * 0.9
      },
      color: '#ef4444'
    },
    {
      name: 'Escenario Crítico',
      description: 'Colapso de intervenciones, alta transmisibilidad',
      probability: 0.10,
      params: {
        ...baseParams,
        beta: baseParams.beta * 1.5,
        gamma: baseParams.gamma * 0.85
      },
      color: '#991b1b'
    }
  ];
}

/**
 * Calcula el impacto económico estimado
 * @param {Object} metrics - Métricas de la epidemia
 * @param {number} population - Población total
 * @returns {Object} - Estimaciones de impacto económico
 */
export function calculateEconomicImpact(metrics, population) {
  // Costos promedio en Bolivia (Bs.)
  const costPerHospitalization = 15000; // ~$2,200 USD
  const costPerICUDay = 3500; // ~$500 USD
  const costPerDeath = 50000; // Costo social y económico
  const avgICUStay = 12; // días
  
  const hospitalizationCosts = metrics.maxHospitalizations * costPerHospitalization;
  const icuCosts = metrics.totalHospitalDays * costPerICUDay;
  const mortalityCosts = metrics.estimatedDeaths * costPerDeath;
  
  // Pérdida de productividad
  const workforceLoss = (metrics.totalInfected * 0.65) * 14 * 150; // 65% fuerza laboral, 14 días, Bs.150/día
  
  const totalCost = hospitalizationCosts + icuCosts + mortalityCosts + workforceLoss;
  const costPerCapita = totalCost / population;
  
  return {
    totalCost: Math.round(totalCost),
    hospitalizationCosts: Math.round(hospitalizationCosts),
    icuCosts: Math.round(icuCosts),
    mortalityCosts: Math.round(mortalityCosts),
    workforceLoss: Math.round(workforceLoss),
    costPerCapita: Math.round(costPerCapita),
    gdpImpact: ((totalCost / (population * 25000)) * 100).toFixed(2) // Estimado GDP per capita Bolivia ~$25k
  };
}
