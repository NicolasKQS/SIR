// src/utils/exportMatlab.js
import { saveAs } from 'file-saver';
import { Card, CardContent } from "@/components/ui/card";

export function generateMatlabScript(params) {
  const {
    model, S0, I0, R0, E0, beta, gamma, sigma, mu, delta, days, steps
  } = params;

  let script = `% Script generado automáticamente para MATLAB\n`;
  script += `% Modelo: ${model}\n\n`;
  script += `S0 = ${S0};\nI0 = ${I0};\nR0 = ${R0};\nE0 = ${E0};\nbeta = ${beta};\ngamma = ${gamma};\n`;
  script += `sigma = ${sigma};\nmu = ${mu};\ndelta = ${delta};\nT = ${days};\nsteps = ${steps};\n\n`;
  script += `tspan = linspace(0,T,steps+1);\n\n`;

  if (model === 'SEIR') {
    script += `y0 = [S0; E0; I0; R0];\n`;
    script += `sir_ode = @(t,y) [ mu*(sum(y)) - (beta*y(1)*y(3))/sum(y) - mu*y(1);\n`;
    script += `                   (beta*y(1)*y(3))/sum(y) - sigma*y(2) - mu*y(2);\n`;
    script += `                   sigma*y(2) - gamma*y(3) - delta*y(3) - mu*y(3);\n`;
    script += `                   gamma*y(3) - mu*y(4)];\n\n`;
  } else {
    script += `y0 = [S0; 0; I0; R0]; % [S E I R]\n`;
    script += `sir_ode = @(t,y) [ mu*(sum(y)) - (beta*y(1)*y(3))/sum(y) - mu*y(1);\n`;
    script += `                   0;\n`;
    script += `                   (beta*y(1)*y(3))/sum(y) - gamma*y(3) - delta*y(3) - mu*y(3);\n`;
    script += `                   gamma*y(3) - mu*y(4)];\n\n`;
  }

  script += `[T,Y] = ode45(sir_ode, tspan, y0);\n\n`;
  script += `S = Y(:,1); E = Y(:,2); I = Y(:,3); R = Y(:,4);\n\n`;
  script += `figure; hold on; plot(tspan, S, 'g', 'LineWidth',2); plot(tspan, I, 'r', 'LineWidth',2); plot(tspan, R, 'b', 'LineWidth',2);\n`;
  script += `legend('S','I','R'); xlabel('Tiempo'); ylabel('Personas'); title('Simulación ${model}'); grid on;\n`;

  return script;
}

export function downloadMatlabScript(params, filename = 'simulation.m') {
  const script = generateMatlabScript(params);
  const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}
