// src/utils/sir.js
// Solver RK4 para SIR y SEIR + análisis de métricas
export function simulateModel({
  model = 'SIR',   // 'SIR' or 'SEIR'
  S0 = 990,
  I0 = 10,
  R0 = 0,
  E0 = 0,
  beta = 0.3,
  gamma = 0.1,
  sigma = 0.2,    // para SEIR
  mu = 0.0,       // natalidad/mortalidad
  delta = 0.0,    // mortalidad por enfermedad
  days = 160,
  steps = 800
}) {
  const dt = days / steps;
  const t = new Array(steps + 1);
  const S = new Array(steps + 1);
  const I = new Array(steps + 1);
  const R = new Array(steps + 1);
  const E = new Array(steps + 1);

  t[0] = 0;
  S[0] = S0;
  I[0] = I0;
  R[0] = R0;
  E[0] = E0;

  const N0 = S0 + I0 + R0 + E0;

  function deriv(y) {
    const S_ = y[0], E_ = y[1], I_ = y[2], R_ = y[3];
    const N = Math.max(1, S_ + E_ + I_ + R_);
    if (model === 'SEIR') {
      const dS = mu * N - (beta * S_ * I_) / N - mu * S_;
      const dE = (beta * S_ * I_) / N - sigma * E_ - mu * E_;
      const dI = sigma * E_ - gamma * I_ - delta * I_ - mu * I_;
      const dR = gamma * I_ - mu * R_;
      return [dS, dE, dI, dR];
    } else { // SIR
      const dS = mu * N - (beta * S_ * I_) / N - mu * S_;
      const dI = (beta * S_ * I_) / N - gamma * I_ - delta * I_ - mu * I_;
      const dR = gamma * I_ - mu * R_;
      return [dS, 0, dI, dR];
    }
  }

  for (let i = 0; i < steps; i++) {
    const y = [S[i], E[i] || 0, I[i], R[i]];
    // RK4
    const k1 = deriv(y);
    const yk2 = y.map((v, idx) => v + (dt / 2) * k1[idx]);
    const k2 = deriv(yk2);
    const yk3 = y.map((v, idx) => v + (dt / 2) * k2[idx]);
    const k3 = deriv(yk3);
    const yk4 = y.map((v, idx) => v + dt * k3[idx]);
    const k4 = deriv(yk4);
    const yNext = y.map((v, idx) => v + (dt / 6) * (k1[idx] + 2 * k2[idx] + 2 * k3[idx] + k4[idx]));

    S[i + 1] = Math.max(0, yNext[0]);
    E[i + 1] = model === 'SEIR' ? Math.max(0, yNext[1]) : 0;
    I[i + 1] = Math.max(0, yNext[2]);
    R[i + 1] = Math.max(0, yNext[3]);
    t[i + 1] = t[i] + dt;
  }

  return {
    t, S, E, I, R, N0
  };
}

// analiza resultado: pico, día I<1, día R >= 99% de N
export function analyzeResult({t, S, E, I, R, N0}) {
  let peakIndex = 0;
  for (let i = 1; i < I.length; i++) {
    if (I[i] > I[peakIndex]) peakIndex = i;
  }
  const peakDay = t[peakIndex];
  const peakInfected = I[peakIndex];

  let dayAlmostZero = null;
  for (let i = 0; i < I.length; i++) {
    if (I[i] < 1) { dayAlmostZero = t[i]; break; }
  }

  let day99Recov = null;
  for (let i = 0; i < R.length; i++) {
    if (R[i] >= 0.99 * N0) { day99Recov = t[i]; break; }
  }

  return {
    peakDay,
    peakInfected,
    dayAlmostZero,
    day99Recov
  };
}
