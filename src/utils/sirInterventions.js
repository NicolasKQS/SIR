// Utilidades para simulación SIR con intervenciones de salud pública

/**
 * Simula el modelo SIR con múltiples intervenciones aplicadas en el tiempo
 * @param {Object} config - Configuración de la simulación
 * @returns {Object} - Resultados de la simulación con arrays S, I, R, time
 */
export function simulateWithInterventions(config) {
  const {
    S0 = 1000000,
    I0 = 100,
    R0 = 0,
    beta: baseBeta = 0.4,
    gamma: baseGamma = 0.1,
    days = 365,
    interventions = {}
  } = config;

  const dt = 0.2; // Paso de tiempo
  const steps = Math.floor(days / dt);
  const N = S0 + I0 + R0;

  // Arrays para almacenar resultados
  const S = new Array(steps + 1).fill(0);
  const I = new Array(steps + 1).fill(0);
  const R = new Array(steps + 1).fill(0);
  const time = new Array(steps + 1).fill(0);

  // Condiciones iniciales
  S[0] = S0;
  I[0] = I0;
  R[0] = R0;
  time[0] = 0;

  // Simulación con RK4
  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    time[step + 1] = t + dt;

    // Aplicar intervenciones para obtener beta y gamma efectivos
    const { beta, gamma, vaccinationRate } = applyInterventions(
      t,
      baseBeta,
      baseGamma,
      interventions
    );

    // Valores actuales
    const St = S[step];
    const It = I[step];
    const Rt = R[step];

    // Método RK4
    // k1
    const k1_S = derivS(St, It, N, beta);
    const k1_I = derivI(St, It, N, beta, gamma);
    const k1_R = derivR(It, gamma);

    // k2
    const S2 = St + (dt / 2) * k1_S;
    const I2 = It + (dt / 2) * k1_I;
    const k2_S = derivS(S2, I2, N, beta);
    const k2_I = derivI(S2, I2, N, beta, gamma);
    const k2_R = derivR(I2, gamma);

    // k3
    const S3 = St + (dt / 2) * k2_S;
    const I3 = It + (dt / 2) * k2_I;
    const k3_S = derivS(S3, I3, N, beta);
    const k3_I = derivI(S3, I3, N, beta, gamma);
    const k3_R = derivR(I3, gamma);

    // k4
    const S4 = St + dt * k3_S;
    const I4 = It + dt * k3_I;
    const k4_S = derivS(S4, I4, N, beta);
    const k4_I = derivI(S4, I4, N, beta, gamma);
    const k4_R = derivR(I4, gamma);

    // Actualización
    S[step + 1] = Math.max(0, St + (dt / 6) * (k1_S + 2 * k2_S + 2 * k3_S + k4_S));
    I[step + 1] = Math.max(0, It + (dt / 6) * (k1_I + 2 * k2_I + 2 * k3_I + k4_I));
    R[step + 1] = Math.min(N, Rt + (dt / 6) * (k1_R + 2 * k2_R + 2 * k3_R + k4_R));

    // Aplicar vacunación directa (mueve personas de S a R)
    if (vaccinationRate > 0) {
      const vaccinated = Math.min(S[step + 1], vaccinationRate * dt * N);
      S[step + 1] -= vaccinated;
      R[step + 1] += vaccinated;
    }

    // Normalizar para mantener S + I + R = N
    const total = S[step + 1] + I[step + 1] + R[step + 1];
    if (Math.abs(total - N) > 1) {
      const factor = N / total;
      S[step + 1] *= factor;
      I[step + 1] *= factor;
      R[step + 1] *= factor;
    }
  }

  return { S, I, R, time };
}

/**
 * Aplica las intervenciones activas en el tiempo t
 * @returns {Object} - Parámetros efectivos { beta, gamma, vaccinationRate }
 */
function applyInterventions(t, baseBeta, baseGamma, interventions) {
  let beta = baseBeta;
  let gamma = baseGamma;
  let vaccinationRate = 0;

  // Cuarentena estricta
  if (interventions.quarantine?.enabled) {
    const { startDay, duration, effectiveness } = interventions.quarantine;
    if (t >= startDay && t <= startDay + duration) {
      // Reduce beta según efectividad de la cuarentena
      beta = baseBeta * (1 - effectiveness);
    }
  }

  // Distanciamiento social
  if (interventions.socialDistancing?.enabled) {
    const { startDay, reduction } = interventions.socialDistancing;
    if (t >= startDay) {
      // Reduce beta de forma permanente
      beta = beta * (1 - reduction);
    }
  }

  // Vacunación
  if (interventions.vaccination?.enabled) {
    const { startDay, dailyRate } = interventions.vaccination;
    if (t >= startDay) {
      vaccinationRate = dailyRate;
    }
  }

  // Testeo masivo y aislamiento (aumenta gamma efectivo)
  if (interventions.testing?.enabled) {
    const { startDay, effectivenessIncrease = 1.3 } = interventions.testing;
    if (t >= startDay) {
      gamma = baseGamma * effectivenessIncrease;
    }
  }

  return { beta, gamma, vaccinationRate };
}

// Derivadas del modelo SIR
function derivS(S, I, N, beta) {
  return -beta * S * I / N;
}

function derivI(S, I, N, beta, gamma) {
  return beta * S * I / N - gamma * I;
}

function derivR(I, gamma) {
  return gamma * I;
}

/**
 * Calcula métricas epidemiológicas de una simulación
 */
export function calculateMetrics(simulationData, population) {
  const { S, I, R, time } = simulationData;

  // Pico de infectados
  const peakInfected = Math.max(...I);
  const peakIndex = I.indexOf(peakInfected);
  const peakDay = time[peakIndex];

  // Tasa de ataque final
  const finalR = R[R.length - 1];
  const attackRate = (finalR / population) * 100;

  // Día de extinción (cuando I < 1)
  let extinctionDay = null;
  for (let i = 0; i < I.length; i++) {
    if (I[i] < 1 && i > peakIndex) {
      extinctionDay = time[i];
      break;
    }
  }

  // Área bajo la curva de infectados (carga total de enfermedad)
  let totalInfectedDays = 0;
  for (let i = 0; i < I.length - 1; i++) {
    totalInfectedDays += (I[i] + I[i + 1]) / 2 * (time[i + 1] - time[i]);
  }

  return {
    peakInfected: Math.round(peakInfected),
    peakDay: peakDay.toFixed(1),
    attackRate: attackRate.toFixed(2),
    totalInfected: Math.round(finalR),
    extinctionDay: extinctionDay ? extinctionDay.toFixed(1) : 'No alcanzado',
    totalInfectedDays: Math.round(totalInfectedDays),
  };
}

/**
 * Estima el número reproductivo efectivo R(t) en el tiempo
 */
export function calculateEffectiveR(S, N, R0) {
  return R0 * (S / N);
}

/**
 * Determina si se requiere intervención basado en capacidad hospitalaria
 */
export function evaluateInterventionNeed(peakInfected, hospitalCapacity, criticalRate = 0.05) {
  const criticalCases = peakInfected * criticalRate;
  const exceedsCapacity = criticalCases > hospitalCapacity;
  const usagePercent = (criticalCases / hospitalCapacity) * 100;

  let recommendation = '';
  if (usagePercent > 100) {
    recommendation = 'INTERVENCIÓN URGENTE REQUERIDA';
  } else if (usagePercent > 80) {
    recommendation = 'INTERVENCIÓN RECOMENDADA';
  } else if (usagePercent > 50) {
    recommendation = 'MONITOREO CERCANO';
  } else {
    recommendation = 'CAPACIDAD SUFICIENTE';
  }

  return {
    criticalCases: Math.round(criticalCases),
    exceedsCapacity,
    usagePercent: usagePercent.toFixed(1),
    recommendation,
  };
}

/**
 * Compara dos escenarios y calcula la reducción de casos
 */
export function compareScenarios(baseline, intervention) {
  const baselineMetrics = calculateMetrics(baseline, baseline.S[0] + baseline.I[0] + baseline.R[0]);
  const interventionMetrics = calculateMetrics(intervention, intervention.S[0] + intervention.I[0] + intervention.R[0]);

  const casesAvoided = baselineMetrics.totalInfected - interventionMetrics.totalInfected;
  const peakReduction = ((baselineMetrics.peakInfected - interventionMetrics.peakInfected) / baselineMetrics.peakInfected) * 100;
  const delayDays = parseFloat(interventionMetrics.peakDay) - parseFloat(baselineMetrics.peakDay);

  return {
    casesAvoided: Math.round(casesAvoided),
    casesAvoidedPercent: ((casesAvoided / baselineMetrics.totalInfected) * 100).toFixed(1),
    peakReduction: peakReduction.toFixed(1),
    peakDelayDays: delayDays.toFixed(1),
  };
}
