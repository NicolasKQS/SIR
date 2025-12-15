/**
 * Sistema de validación de datos y alertas para SEDES
 */

/**
 * Valida parámetros epidemiológicos
 * @param {Object} params - Parámetros a validar
 * @returns {Object} - Resultado de validación con errores y advertencias
 */
export function validateEpidemiologicalParams(params) {
  const errors = [];
  const warnings = [];
  const recommendations = [];
  
  // Validar beta (tasa de transmisión)
  if (params.beta < 0 || params.beta > 2) {
    errors.push('Beta debe estar entre 0 y 2. Valores típicos: 0.1-0.8');
  } else if (params.beta > 0.8) {
    warnings.push('Beta muy alto (>0.8) indica enfermedad extremadamente contagiosa');
  } else if (params.beta < 0.1) {
    warnings.push('Beta muy bajo (<0.1) puede no capturar transmisión significativa');
  }
  
  // Validar gamma (tasa de recuperación)
  if (params.gamma < 0 || params.gamma > 1) {
    errors.push('Gamma debe estar entre 0 y 1. Valores típicos: 0.05-0.3');
  } else {
    const infectiousPeriod = 1 / params.gamma;
    if (infectiousPeriod < 2) {
      warnings.push(`Período infeccioso muy corto (${infectiousPeriod.toFixed(1)} días)`);
    } else if (infectiousPeriod > 30) {
      warnings.push(`Período infeccioso muy largo (${infectiousPeriod.toFixed(1)} días)`);
    }
  }
  
  // Validar R0
  const R0 = params.beta / params.gamma;
  if (R0 > 10) {
    warnings.push(`R₀ = ${R0.toFixed(2)} es extremadamente alto. Verificar parámetros.`);
  } else if (R0 > 5) {
    warnings.push(`R₀ = ${R0.toFixed(2)} indica alta transmisibilidad (ej: sarampión)`);
  } else if (R0 > 2) {
    recommendations.push('R₀ moderado-alto. Intervenciones tempranas son críticas.');
  } else if (R0 > 1) {
    recommendations.push('R₀ >1 pero controlable con intervenciones adecuadas.');
  } else {
    recommendations.push('R₀ <1. La enfermedad tiende a extinguirse naturalmente.');
  }
  
  // Validar población inicial
  if (params.S0 + params.I0 + params.R0 !== params.S0 + params.I0 + (params.R0 || 0)) {
    errors.push('La suma S0 + I0 + R0 debe ser constante');
  }
  
  if (params.I0 < 1) {
    errors.push('Debe haber al menos 1 infectado inicial');
  } else if (params.I0 / (params.S0 + params.I0) > 0.05) {
    warnings.push('Más del 5% de la población ya está infectada al inicio');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    R0: R0.toFixed(2),
    infectiousPeriod: (1 / params.gamma).toFixed(1)
  };
}

/**
 * Sistema de alertas tempranas basado en tendencias
 * @param {Object} currentData - Datos actuales de la simulación
 * @param {Object} hospitalCapacity - Capacidad hospitalaria
 * @returns {Object} - Sistema de alertas con niveles
 */
export function generateEarlyWarningAlerts(currentData, hospitalCapacity) {
  const alerts = [];
  let overallRiskLevel = 'VERDE'; // VERDE, AMARILLO, NARANJA, ROJO, CRÍTICO
  
  const { I, R, time } = currentData;
  const population = currentData.S[0] + currentData.I[0] + currentData.R[0];
  
  // Análisis de crecimiento
  const currentInfected = I[I.length - 1];
  const weekAgoInfected = I[Math.max(0, I.length - 35)]; // ~7 días atrás
  const growthFactor = currentInfected / weekAgoInfected;
  
  if (growthFactor > 2) {
    alerts.push({
      level: 'CRÍTICO',
      type: 'CRECIMIENTO_EXPONENCIAL',
      message: `Casos duplicándose en menos de 7 días (factor: ${growthFactor.toFixed(2)}x)`,
      action: 'ACTIVAR PROTOCOLO DE EMERGENCIA: Cuarentena estricta inmediata',
      priority: 1
    });
    overallRiskLevel = 'CRÍTICO';
  } else if (growthFactor > 1.5) {
    alerts.push({
      level: 'ROJO',
      type: 'CRECIMIENTO_RÁPIDO',
      message: `Crecimiento acelerado de casos (${((growthFactor - 1) * 100).toFixed(0)}% en 7 días)`,
      action: 'Implementar intervenciones no farmacéuticas de forma urgente',
      priority: 2
    });
    if (overallRiskLevel === 'VERDE') overallRiskLevel = 'ROJO';
  } else if (growthFactor > 1.2) {
    alerts.push({
      level: 'NARANJA',
      type: 'CRECIMIENTO_SOSTENIDO',
      message: `Tendencia de crecimiento sostenido (${((growthFactor - 1) * 100).toFixed(0)}% en 7 días)`,
      action: 'Preparar medidas de mitigación y monitoreo intensivo',
      priority: 3
    });
    if (overallRiskLevel === 'VERDE') overallRiskLevel = 'NARANJA';
  }
  
  // Análisis de capacidad hospitalaria
  const icuCases = Math.round(currentInfected * 0.05);
  const icuOccupancy = icuCases / hospitalCapacity.icuBeds;
  
  if (icuOccupancy > 1.0) {
    alerts.push({
      level: 'CRÍTICO',
      type: 'COLAPSO_HOSPITALARIO',
      message: `Capacidad UCI superada: ${(icuOccupancy * 100).toFixed(0)}% (${icuCases} casos / ${hospitalCapacity.icuBeds} camas)`,
      action: 'URGENTE: Expandir capacidad UCI, transferir pacientes, solicitar apoyo externo',
      priority: 1
    });
    overallRiskLevel = 'CRÍTICO';
  } else if (icuOccupancy > 0.85) {
    alerts.push({
      level: 'ROJO',
      type: 'SATURACIÓN_UCI',
      message: `UCI cerca de saturación: ${(icuOccupancy * 100).toFixed(0)}%`,
      action: 'Activar plan de expansión hospitalaria, suspender cirugías electivas',
      priority: 2
    });
    if (overallRiskLevel !== 'CRÍTICO') overallRiskLevel = 'ROJO';
  } else if (icuOccupancy > 0.70) {
    alerts.push({
      level: 'NARANJA',
      type: 'PRESIÓN_HOSPITALARIA',
      message: `Ocupación UCI significativa: ${(icuOccupancy * 100).toFixed(0)}%`,
      action: 'Preparar protocolos de triaje, aumentar personal de salud',
      priority: 3
    });
    if (overallRiskLevel === 'VERDE') overallRiskLevel = 'NARANJA';
  } else if (icuOccupancy > 0.50) {
    alerts.push({
      level: 'AMARILLO',
      type: 'ALERTA_PREVENTIVA',
      message: `Ocupación UCI moderada: ${(icuOccupancy * 100).toFixed(0)}%`,
      action: 'Monitorear de cerca, preparar protocolos de respuesta',
      priority: 4
    });
    if (overallRiskLevel === 'VERDE') overallRiskLevel = 'AMARILLO';
  }
  
  // Análisis de velocidad de contagio
  const attackRate = (R[R.length - 1] / population) * 100;
  if (attackRate > 50) {
    alerts.push({
      level: 'ROJO',
      type: 'ALTA_PREVALENCIA',
      message: `Más del 50% de la población afectada (${attackRate.toFixed(1)}%)`,
      action: 'Epidemia avanzada: Enfocarse en proteger grupos vulnerables',
      priority: 2
    });
  } else if (attackRate > 30) {
    alerts.push({
      level: 'NARANJA',
      type: 'PREVALENCIA_SIGNIFICATIVA',
      message: `${attackRate.toFixed(1)}% de la población ha sido infectada`,
      action: 'Fortalecer sistemas de atención y seguimiento',
      priority: 3
    });
  }
  
  // Análisis de ventiladores
  const ventilatorCases = Math.round(currentInfected * 0.025);
  const ventilatorOccupancy = ventilatorCases / hospitalCapacity.ventilators;
  
  if (ventilatorOccupancy > 0.90) {
    alerts.push({
      level: 'CRÍTICO',
      type: 'CRISIS_VENTILADORES',
      message: `Ventiladores casi agotados: ${(ventilatorOccupancy * 100).toFixed(0)}%`,
      action: 'URGENTE: Adquirir/solicitar ventiladores adicionales',
      priority: 1
    });
  }
  
  // Ordenar alertas por prioridad
  alerts.sort((a, b) => a.priority - b.priority);
  
  return {
    overallRiskLevel,
    alerts,
    timestamp: new Date().toISOString(),
    metrics: {
      growthFactor: growthFactor.toFixed(2),
      icuOccupancy: (icuOccupancy * 100).toFixed(1),
      ventilatorOccupancy: (ventilatorOccupancy * 100).toFixed(1),
      attackRate: attackRate.toFixed(1),
      activeInfected: Math.round(currentInfected)
    }
  };
}

/**
 * Valida consistencia de resultados de simulación
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Object} - Resultado de validación
 */
export function validateSimulationResults(simulationData) {
  const issues = [];
  const { S, I, R, time } = simulationData;
  
  // Verificar conservación de población
  const N0 = S[0] + I[0] + R[0];
  for (let i = 0; i < S.length; i += Math.floor(S.length / 10)) {
    const Ni = S[i] + I[i] + R[i];
    const error = Math.abs((Ni - N0) / N0);
    if (error > 0.01) {
      issues.push(`Error de conservación en t=${time[i].toFixed(1)}: ${(error * 100).toFixed(2)}%`);
    }
  }
  
  // Verificar no-negatividad
  const hasNegatives = [...S, ...I, ...R].some(val => val < 0);
  if (hasNegatives) {
    issues.push('CRÍTICO: Valores negativos detectados en la simulación');
  }
  
  // Verificar monotonía de R
  for (let i = 1; i < R.length; i++) {
    if (R[i] < R[i - 1] - 0.01) {
      issues.push('Recuperados decrecen (no físico)');
      break;
    }
  }
  
  // Verificar convergencia
  const finalChangeRate = Math.abs(I[I.length - 1] - I[I.length - 2]) / I[I.length - 2];
  if (finalChangeRate > 0.001 && I[I.length - 1] > 100) {
    issues.push('Simulación puede no haber convergido completamente');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    conservationError: Math.abs((S[S.length - 1] + I[I.length - 1] + R[R.length - 1] - N0) / N0 * 100).toFixed(4)
  };
}

/**
 * Compara escenarios y genera recomendaciones
 * @param {Array} scenarios - Array de escenarios simulados
 * @param {Object} hospitalCapacity - Capacidad hospitalaria
 * @returns {Object} - Análisis comparativo y recomendaciones
 */
export function compareScenarios(scenarios, hospitalCapacity) {
  if (scenarios.length < 2) {
    return { error: 'Se requieren al menos 2 escenarios para comparar' };
  }
  
  const comparison = scenarios.map(scenario => {
    const peakInfected = Math.max(...scenario.data.I);
    const totalInfected = scenario.data.R[scenario.data.R.length - 1];
    const icuCases = Math.round(peakInfected * 0.05);
    
    return {
      name: scenario.name,
      peakInfected,
      totalInfected,
      icuCases,
      exceedsCapacity: icuCases > hospitalCapacity.icuBeds,
      costScore: totalInfected * 1000 + icuCases * 5000 // Puntuación simple de costo
    };
  });
  
  // Encontrar mejor escenario
  const bestScenario = comparison.reduce((best, current) => 
    current.costScore < best.costScore ? current : best
  );
  
  const worstScenario = comparison.reduce((worst, current) => 
    current.costScore > worst.costScore ? current : worst
  );
  
  const recommendations = [
    `Escenario óptimo: ${bestScenario.name}`,
    `Reducción de pico: ${((1 - bestScenario.peakInfected / worstScenario.peakInfected) * 100).toFixed(0)}%`,
    `Casos evitados: ${(worstScenario.totalInfected - bestScenario.totalInfected).toLocaleString('es-BO')}`
  ];
  
  if (bestScenario.exceedsCapacity) {
    recommendations.push('ADVERTENCIA: Incluso el mejor escenario excede la capacidad UCI');
    recommendations.push('ACCIÓN: Expandir capacidad hospitalaria es crítico');
  }
  
  return {
    comparison,
    bestScenario: bestScenario.name,
    worstScenario: worstScenario.name,
    recommendations
  };
}

/**
 * Genera reporte de calidad de datos
 * @param {Object} departmentData - Datos del departamento
 * @returns {Object} - Reporte de calidad
 */
export function assessDataQuality(departmentData) {
  const quality = {
    completeness: 100,
    reliability: 'ALTA',
    issues: [],
    warnings: []
  };
  
  // Verificar campos requeridos
  const requiredFields = ['population', 'hospitalCapacity'];
  for (const field of requiredFields) {
    if (!departmentData[field]) {
      quality.issues.push(`Falta campo requerido: ${field}`);
      quality.completeness -= 20;
    }
  }
  
  // Verificar rangos razonables
  if (departmentData.population < 100000) {
    quality.warnings.push('Población muy pequeña (<100k), resultados pueden no ser representativos');
  }
  
  const icuRatio = departmentData.hospitalCapacity?.icuBeds / departmentData.population * 100000;
  if (icuRatio < 5) {
    quality.warnings.push(`Capacidad UCI muy baja (${icuRatio.toFixed(1)} camas por 100k hab)`);
    quality.reliability = 'MEDIA';
  } else if (icuRatio > 50) {
    quality.warnings.push(`Capacidad UCI inusualmente alta (${icuRatio.toFixed(1)} camas por 100k hab) - Verificar datos`);
  }
  
  if (quality.completeness < 80) {
    quality.reliability = 'BAJA';
  }
  
  return quality;
}
