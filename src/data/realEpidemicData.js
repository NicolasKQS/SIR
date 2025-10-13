export const covidData = {
  labels: Array.from({ length: 200 }, (_, i) => `Día ${i + 1}`),
  datasets: [
    {
      label: 'Sanos (estimado)',
      data: Array.from({ length: 200 }, (_, i) => {
        const totalPop = 1000;
        const infectedPeak = 250;
        const cumulativeInfected = Math.min(totalPop * 0.8, infectedPeak * (1 - Math.exp(-(i / 50))) * (1 - 0.5 * Math.exp(-(i - 100) / 30)));
        return Math.max(0, totalPop - cumulativeInfected - (i / 200 * 0.1 * totalPop));
      }).map(v => Math.round(v)),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 0,
      borderDash: [5, 5],
    },
    {
      label: 'Infectados (activos, aproximados)',
      data: Array.from({ length: 200 }, (_, i) => {
        if (i < 20) return i * 2;
        if (i < 80) return 40 + 200 * Math.sin((i - 20) / 20 * Math.PI);
        if (i < 120) return 200 - (i - 80) * 3;
        if (i < 150) return 100 + 80 * Math.sin((i - 120) / 10 * Math.PI);
        return Math.max(0, 180 - (i - 150) * 2);
      }).map(v => Math.max(0, v)),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 0,
    },
    {
      label: 'Recuperados (acumulados)',
      data: Array.from({ length: 200 }, (_, i) => {
        return Math.min(800, i * 4 + Math.random() * 20);
      }).map(v => Math.round(v)),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 0,
      borderDash: [5, 5],
    }
  ]
};

// Nota: Datos inspirados en trayectorias reales de COVID-19 (2020, escalado a N=1000 para simulación educativa en ecuaciones diferenciales).