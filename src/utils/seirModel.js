/**
 * Simulador SEIR completo con intervenciones
 * Modelo extendido que incluye período de incubación
 */

/**
 * Simula el modelo SEIR con intervenciones
 * @param {Object} config - Configuración de la simulación
 * @returns {Object} - Resultados de la simulación con arrays S, E, I, R, time
 */
export function simulateSEIR(config) {
  const {
    S0 = 1000000,
    E0 = 50,
    I0 = 100,
    R0 = 0,
    beta: baseBeta = 0.4,
    gamma: baseGamma = 0.1,
    sigma: baseSigma = 0.2, // Tasa de progresión de E a I (1/período_incubación)
    days = 365,
    interventions = {}
  } = config;

  const dt = 0.2; // Paso de tiempo
  const steps = Math.floor(days / dt);
  const N = S0 + E0 + I0 + R0;

  // Arrays para almacenar resultados
  const S = new Array(steps + 1).fill(0);
  const E = new Array(steps + 1).fill(0);
  const I = new Array(steps + 1).fill(0);
  const R = new Array(steps + 1).fill(0);
  const time = new Array(steps + 1).fill(0);

  // Condiciones iniciales
  S[0] = S0;
  E[0] = E0;
  I[0] = I0;
  R[0] = R0;
  time[0] = 0;

  // Simulación con RK4
  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    time[step + 1] = t + dt;

    // Aplicar intervenciones para obtener parámetros efectivos
    const { beta, gamma, sigma, vaccinationRate } = applySEIRInterventions(
      t,
      baseBeta,
      baseGamma,
      baseSigma,
      interventions
    );

    // Valores actuales
    const St = S[step];
    const Et = E[step];
    const It = I[step];
    const Rt = R[step];

    // RK4 para SEIR
    const k1 = derivativesSEIR(St, Et, It, Rt, beta, gamma, sigma, vaccinationRate, N);
    
    const k2 = derivativesSEIR(
      St + 0.5 * dt * k1.dS,
      Et + 0.5 * dt * k1.dE,
      It + 0.5 * dt * k1.dI,
      Rt + 0.5 * dt * k1.dR,
      beta, gamma, sigma, vaccinationRate, N
    );
    
    const k3 = derivativesSEIR(
      St + 0.5 * dt * k2.dS,
      Et + 0.5 * dt * k2.dE,
      It + 0.5 * dt * k2.dI,
      Rt + 0.5 * dt * k2.dR,
      beta, gamma, sigma, vaccinationRate, N
    );
    
    const k4 = derivativesSEIR(
      St + dt * k3.dS,
      Et + dt * k3.dE,
      It + dt * k3.dI,
      Rt + dt * k3.dR,
      beta, gamma, sigma, vaccinationRate, N
    );

    // Actualizar valores
    S[step + 1] = Math.max(0, St + (dt / 6) * (k1.dS + 2 * k2.dS + 2 * k3.dS + k4.dS));
    E[step + 1] = Math.max(0, Et + (dt / 6) * (k1.dE + 2 * k2.dE + 2 * k3.dE + k4.dE));
    I[step + 1] = Math.max(0, It + (dt / 6) * (k1.dI + 2 * k2.dI + 2 * k3.dI + k4.dI));
    R[step + 1] = Math.max(0, Rt + (dt / 6) * (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR));

    // Normalizar para mantener conservación
    const total = S[step + 1] + E[step + 1] + I[step + 1] + R[step + 1];
    if (Math.abs(total - N) > 0.01 * N) {
      const factor = N / total;
      S[step + 1] *= factor;
      E[step + 1] *= factor;
      I[step + 1] *= factor;
      R[step + 1] *= factor;
    }
  }

  return {
    S,
    E,
    I,
    R,
    time,
    modelType: 'SEIR'
  };
}

/**
 * Calcula las derivadas del sistema SEIR
 */
function derivativesSEIR(S, E, I, R, beta, gamma, sigma, vaccinationRate, N) {
  const infection = beta * S * I / N;
  const progression = sigma * E;
  const recovery = gamma * I;
  const vaccination = vaccinationRate * S;

  return {
    dS: -infection - vaccination,
    dE: infection - progression,
    dI: progression - recovery,
    dR: recovery + vaccination
  };
}

/**
 * Aplica intervenciones al modelo SEIR
 */
function applySEIRInterventions(t, baseBeta, baseGamma, baseSigma, interventions) {
  let beta = baseBeta;
  let gamma = baseGamma;
  let sigma = baseSigma;
  let vaccinationRate = 0;

  // Cuarentena
  if (interventions.quarantine?.enabled) {
    const { startDay, duration, effectiveness } = interventions.quarantine;
    if (t >= startDay && t < startDay + duration) {
      beta *= (1 - effectiveness);
    }
  }

  // Distanciamiento social permanente
  if (interventions.socialDistancing?.enabled) {
    const { startDay, reduction } = interventions.socialDistancing;
    if (t >= startDay) {
      beta *= (1 - reduction);
    }
  }

  // Vacunación
  if (interventions.vaccination?.enabled) {
    const { startDay, dailyRate } = interventions.vaccination;
    if (t >= startDay) {
      vaccinationRate = dailyRate;
    }
  }

  // Mejora en detección y aislamiento (reduce sigma, más rápido progresión a aislamiento)
  if (interventions.testing?.enabled) {
    const { startDay, effectiveness } = interventions.testing;
    if (t >= startDay) {
      gamma *= (1 + effectiveness * 0.5); // Recuperación/aislamiento más rápido
    }
  }

  // Tratamiento médico mejorado
  if (interventions.treatment?.enabled) {
    const { startDay, effectiveness } = interventions.treatment;
    if (t >= startDay) {
      gamma *= (1 + effectiveness); // Recuperación más rápida
    }
  }

  return { beta, gamma, sigma, vaccinationRate };
}

/**
 * Calcula R0 efectivo para SEIR
 * @param {number} beta - Tasa de transmisión
 * @param {number} gamma - Tasa de recuperación
 * @param {number} sigma - Tasa de progresión
 * @returns {number} - R0 del modelo SEIR
 */
export function calculateSEIR_R0(beta, gamma, sigma) {
  // Para SEIR: R0 = beta / gamma (mismo que SIR en la mayoría de casos)
  // El período de incubación no afecta directamente R0, pero sí la dinámica
  return beta / gamma;
}

/**
 * Calcula el número reproductivo efectivo en el tiempo para SEIR
 * @param {Array} S - Susceptibles en el tiempo
 * @param {number} N - Población total
 * @param {number} R0 - Número reproductivo básico
 * @returns {Array} - R(t) efectivo en cada punto
 */
export function calculateSEIR_EffectiveR(S, N, R0) {
  return S.map(s => R0 * s / N);
}

/**
 * Compara modelos SIR vs SEIR
 * @param {Object} sirData - Datos de simulación SIR
 * @param {Object} seirData - Datos de simulación SEIR
 * @returns {Object} - Análisis comparativo
 */
export function compareSIRvsSEIR(sirData, seirData) {
  const sirPeak = Math.max(...sirData.I);
  const seirPeak = Math.max(...seirData.I);
  
  const sirPeakTime = sirData.time[sirData.I.indexOf(sirPeak)];
  const seirPeakTime = seirData.time[seirData.I.indexOf(seirPeak)];
  
  const sirTotal = sirData.R[sirData.R.length - 1];
  const seirTotal = seirData.R[seirData.R.length - 1];
  
  return {
    peakDifference: {
      absolute: Math.round(seirPeak - sirPeak),
      percentage: ((seirPeak / sirPeak - 1) * 100).toFixed(2)
    },
    peakTimeDifference: {
      days: (seirPeakTime - sirPeakTime).toFixed(1),
      description: seirPeakTime > sirPeakTime ? 'SEIR pico más tardío' : 'SEIR pico más temprano'
    },
    totalInfectedDifference: {
      absolute: Math.round(seirTotal - sirTotal),
      percentage: ((seirTotal / sirTotal - 1) * 100).toFixed(2)
    },
    recommendation: seirPeak < sirPeak 
      ? 'Modelo SEIR sugiere epidemia más controlada debido al período de incubación'
      : 'Ambos modelos sugieren epidemia similar'
  };
}

/**
 * Estima parámetros SEIR desde datos reales
 * @param {Object} observedData - Datos observados {casos diarios, tiempo}
 * @param {Object} initialGuess - Estimación inicial de parámetros
 * @returns {Object} - Parámetros ajustados
 */
export function fitSEIRToData(observedData, initialGuess = {}) {
  // Implementación simplificada de ajuste de parámetros
  // En producción, usar algoritmos de optimización como Nelder-Mead
  
  const {
    beta: initialBeta = 0.4,
    gamma: initialGamma = 0.1,
    sigma: initialSigma = 0.2
  } = initialGuess;
  
  // Por ahora, retornar parámetros razonables basados en literatura
  // Esto debería ser reemplazado con optimización real
  
  return {
    beta: initialBeta,
    gamma: initialGamma,
    sigma: initialSigma,
    R0: (initialBeta / initialGamma).toFixed(2),
    incubationPeriod: (1 / initialSigma).toFixed(1),
    infectiousPeriod: (1 / initialGamma).toFixed(1),
    confidence: 'ESTIMADO', // 'BAJO', 'MEDIO', 'ALTO', 'ESTIMADO'
    note: 'Parámetros basados en literatura científica. Se recomienda calibración con datos locales.'
  };
}

/**
 * Genera escenarios SEIR con diferentes períodos de incubación
 * @param {Object} baseParams - Parámetros base
 * @returns {Array} - Configuraciones de escenarios
 */
export function generateIncubationScenarios(baseParams) {
  return [
    {
      name: 'Incubación Corta',
      description: 'Período de incubación 2-3 días (ej: Influenza)',
      sigma: 0.4, // 1/2.5 días
      params: { ...baseParams, sigma: 0.4 }
    },
    {
      name: 'Incubación Media',
      description: 'Período de incubación 5-6 días (ej: COVID-19)',
      sigma: 0.18, // 1/5.5 días
      params: { ...baseParams, sigma: 0.18 }
    },
    {
      name: 'Incubación Larga',
      description: 'Período de incubación 10-14 días',
      sigma: 0.08, // 1/12 días
      params: { ...baseParams, sigma: 0.08 }
    }
  ];
}
