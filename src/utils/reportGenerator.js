import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera un reporte PDF profesional con análisis epidemiológico completo
 * Incluye métricas avanzadas, alertas tempranas e impacto económico
 */
export async function generatePDFReport(data) {
  try {
    const {
      department,
      scenarios,
      baseParams,
      interventions,
      selectedScenario,
      timestamp = new Date().toISOString(),
      modelType = 'SIR',
      analysisData = null,
      chartElementId = null
    } = data;

    if (!department || !scenarios || scenarios.length === 0) {
      throw new Error('Datos insuficientes para generar el reporte');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 15;

  // Encabezado con logo y título SEDES
  pdf.setFillColor(0, 102, 204);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SEDES', 15, 15);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SERVICIO DEPARTAMENTAL DE SALUD', 15, 22);
  pdf.text('BOLIVIA', 15, 27);

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REPORTE EPIDEMIOLÓGICO', pageWidth - 15, 20, { align: 'right' });
  
  pdf.setTextColor(0, 0, 0);
  yPosition = 42;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Modelo ${modelType} - Análisis de Escenarios`, 15, yPosition);
  yPosition += 5;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generado: ${new Date(timestamp).toLocaleString('es-BO')}`, 15, yPosition);
  pdf.setTextColor(0, 0, 0);
  yPosition += 10;

  // Línea divisoria
  pdf.setDrawColor(0, 102, 204);
  pdf.setLineWidth(0.5);
  pdf.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  // Información del Departamento
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. DATOS DEL DEPARTAMENTO', 15, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const deptInfo = [
    ['Departamento:', department.name],
    ['Población Total:', department.population.toLocaleString('es-BO')],
    ['Camas Hospitalarias:', department.hospitalCapacity.totalBeds.toLocaleString('es-BO')],
    ['Camas UCI:', department.hospitalCapacity.icuBeds.toLocaleString('es-BO')],
    ['Ventiladores:', department.hospitalCapacity.ventilators.toLocaleString('es-BO')],
    ['Personal de Salud:', department.hospitalCapacity.healthWorkers.toLocaleString('es-BO')]
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [],
    body: deptInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 80 }
    }
  });

  yPosition = pdf.lastAutoTable.finalY + 10;

  // Parámetros de Simulación
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. PARÁMETROS DEL MODELO MATEMÁTICO', 15, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  // Ecuaciones del modelo
  pdf.text('Modelo SIR (Susceptible-Infectado-Recuperado):', 15, yPosition);
  yPosition += 5;
  
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(9);
  pdf.text('dS/dt = -β·S·I/N', 20, yPosition);
  yPosition += 4;
  pdf.text('dI/dt = β·S·I/N - γ·I', 20, yPosition);
  yPosition += 4;
  pdf.text('dR/dt = γ·I', 20, yPosition);
  yPosition += 7;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const R0 = (baseParams.beta / baseParams.gamma).toFixed(2);
  const infectionPeriod = (1 / baseParams.gamma).toFixed(1);

  const modelParams = [
    ['β (Tasa de transmisión):', baseParams.beta.toFixed(3)],
    ['γ (Tasa de recuperación):', baseParams.gamma.toFixed(3)],
    ['R₀ (Número reproductivo básico):', R0],
    ['Período infeccioso promedio:', `${infectionPeriod} días`],
    ['Población inicial susceptible:', baseParams.S0.toLocaleString('es-BO')],
    ['Infectados iniciales:', baseParams.I0.toLocaleString('es-BO')],
    ['Días de simulación:', baseParams.days.toString()]
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [],
    body: modelParams,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 70 }
    }
  });

  yPosition = pdf.lastAutoTable.finalY + 10;

  // Nueva página para intervenciones
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  // Intervenciones Aplicadas
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. INTERVENCIONES DE SALUD PÚBLICA', 15, yPosition);
  yPosition += 7;

  const interventionData = [];
  if (interventions.quarantine?.enabled) {
    interventionData.push([
      'Cuarentena Estricta',
      `Día ${interventions.quarantine.startDay}`,
      `${interventions.quarantine.duration} días`,
      `${(interventions.quarantine.effectiveness * 100).toFixed(0)}%`
    ]);
  }
  if (interventions.socialDistancing?.enabled) {
    interventionData.push([
      'Distanciamiento Social',
      `Día ${interventions.socialDistancing.startDay}`,
      'Permanente',
      `${(interventions.socialDistancing.reduction * 100).toFixed(0)}%`
    ]);
  }
  if (interventions.vaccination?.enabled) {
    interventionData.push([
      'Vacunación',
      `Día ${interventions.vaccination.startDay}`,
      'Continua',
      `${(interventions.vaccination.dailyRate * 100).toFixed(2)}% diario`
    ]);
  }

  if (interventionData.length > 0) {
    autoTable(pdf, {
      startY: yPosition,
      head: [['Intervención', 'Inicio', 'Duración', 'Efectividad/Tasa']],
      body: interventionData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 204], textColor: 255, fontStyle: 'bold' }
    });
    yPosition = pdf.lastAutoTable.finalY + 10;
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.text('Sin intervenciones aplicadas (Escenario base)', 15, yPosition);
    yPosition += 10;
  }

  // Nueva página para resultados
  pdf.addPage();
  yPosition = 20;

  // Resultados de Escenarios
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('4. RESULTADOS DE SIMULACIÓN', 15, yPosition);
  yPosition += 7;

  const scenarioResults = scenarios.map(scenario => {
    const peakInfected = Math.max(...scenario.data.I);
    const peakDay = scenario.data.time[scenario.data.I.indexOf(peakInfected)];
    const totalInfected = scenario.data.R[scenario.data.R.length - 1];
    const attackRate = (totalInfected / department.population * 100).toFixed(2);
    const icuNeed = Math.round(peakInfected * 0.05);
    const icuOccupancy = (icuNeed / department.hospitalCapacity.icuBeds * 100).toFixed(1);

    return [
      scenario.name,
      Math.round(peakInfected).toLocaleString('es-BO'),
      Math.round(peakDay),
      Math.round(totalInfected).toLocaleString('es-BO'),
      `${attackRate}%`,
      icuNeed.toLocaleString('es-BO'),
      `${icuOccupancy}%`
    ];
  });

  autoTable(pdf, {
    startY: yPosition,
    head: [['Escenario', 'Pico Infectados', 'Día Pico', 'Total Infectados', 'Tasa Ataque', 'UCI Req.', 'Ocup. UCI']],
    body: scenarioResults,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5, halign: 'center' },
    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 45 },
      1: { cellWidth: 25 },
      2: { cellWidth: 18 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 22 }
    }
  });

  yPosition = pdf.lastAutoTable.finalY + 10;

  // Métricas Avanzadas
  if (analysisData && analysisData.hospitalizationMetrics) {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. MÉTRICAS EPIDEMIOLÓGICAS AVANZADAS', 15, yPosition);
    yPosition += 7;

    const advancedMetrics = [
      ['Tiempo de Duplicación:', `${analysisData.doublingTime} días`],
      ['R Efectivo (promedio):', analysisData.effectiveR || 'N/A'],
      ['Días-Cama UCI Totales:', analysisData.hospitalizationMetrics.totalHospitalDays.toLocaleString('es-BO')],
      ['Hospitalizaciones Pico:', analysisData.hospitalizationMetrics.maxHospitalizations.toLocaleString('es-BO')],
      ['UCI Promedio Diario:', `${analysisData.hospitalizationMetrics.avgDailyICU} camas`],
      ['Ventiladores Pico:', `${analysisData.hospitalizationMetrics.maxVentilators} (${analysisData.hospitalizationMetrics.ventilatorOccupancyRate}%)`],
      ['Días Saturación UCI:', analysisData.hospitalizationMetrics.icuSaturationDays],
      ['Días Saturación Ventiladores:', analysisData.hospitalizationMetrics.ventilatorSaturationDays]
    ];

    autoTable(pdf, {
      startY: yPosition,
      body: advancedMetrics,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 80 }
      }
    });

    yPosition = pdf.lastAutoTable.finalY + 8;
  }

  // Estimaciones de Mortalidad
  if (analysisData && analysisData.mortalityEstimates) {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5.1 Estimaciones de Mortalidad', 15, yPosition);
    yPosition += 6;

    const mortalityData = [
      ['Mortalidad Estimada:', `${analysisData.mortalityEstimates.estimatedDeaths.toLocaleString('es-BO')} personas`],
      ['Tasa de Letalidad:', `${analysisData.mortalityEstimates.mortalityRate}%`],
      ['Sin Colapso Hospitalario:', `${analysisData.mortalityEstimates.deathsWithoutCollapse.toLocaleString('es-BO')} personas`],
      ['Muertes por Colapso:', `${analysisData.mortalityEstimates.additionalDeaths.toLocaleString('es-BO')} adicionales`],
      ['Riesgo de Colapso:', analysisData.mortalityEstimates.hospitalCollapseRisk ? 'SÍ - CRÍTICO' : 'NO']
    ];

    autoTable(pdf, {
      startY: yPosition,
      body: mortalityData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 90, fontStyle: analysisData.mortalityEstimates.hospitalCollapseRisk ? 'bold' : 'normal' }
      }
    });

    yPosition = pdf.lastAutoTable.finalY + 8;
  }

  // Sistema de Alertas Tempranas
  if (analysisData && analysisData.alerts && analysisData.alerts.alerts.length > 0) {
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. SISTEMA DE ALERTAS TEMPRANAS', 15, yPosition);
    yPosition += 5;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nivel de Riesgo Global: ${analysisData.alerts.overallRiskLevel}`, 15, yPosition);
    yPosition += 7;

    const alertsData = analysisData.alerts.alerts.slice(0, 5).map(alert => [
      alert.level,
      alert.type,
      alert.message,
      alert.action
    ]);

    autoTable(pdf, {
      startY: yPosition,
      head: [['Nivel', 'Tipo', 'Mensaje', 'Acción Recomendada']],
      body: alertsData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [204, 51, 0], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 }
      }
    });

    yPosition = pdf.lastAutoTable.finalY + 8;
  }

  // Impacto Económico
  if (analysisData && analysisData.economicImpact) {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('7. ESTIMACIÓN DE IMPACTO ECONÓMICO', 15, yPosition);
    yPosition += 7;

    const economicData = [
      ['Costo Total Estimado:', `Bs. ${(analysisData.economicImpact.totalCost / 1000000).toFixed(2)} millones`],
      ['Costo per Cápita:', `Bs. ${analysisData.economicImpact.costPerCapita.toLocaleString('es-BO')}`],
      ['Costos Hospitalización:', `Bs. ${(analysisData.economicImpact.hospitalizationCosts / 1000000).toFixed(2)}M`],
      ['Costos UCI:', `Bs. ${(analysisData.economicImpact.icuCosts / 1000000).toFixed(2)}M`],
      ['Costos Mortalidad:', `Bs. ${(analysisData.economicImpact.mortalityCosts / 1000000).toFixed(2)}M`],
      ['Pérdida Productividad:', `Bs. ${(analysisData.economicImpact.workforceLoss / 1000000).toFixed(2)}M`],
      ['Impacto en GDP:', `${analysisData.economicImpact.gdpImpact}%`]
    ];

    autoTable(pdf, {
      startY: yPosition,
      body: economicData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70, fillColor: [240, 240, 240] },
        1: { cellWidth: 90, fontStyle: 'bold', textColor: [0, 102, 0] }
      }
    });

    yPosition = pdf.lastAutoTable.finalY + 8;
  }

  // Gráfico (captura del canvas)
  if (chartElementId) {
    if (yPosition > pageHeight - 120) {
      pdf.addPage();
      yPosition = 20;
    }

    try {
      // Nota sobre gráficos
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5. VISUALIZACIÓN DE RESULTADOS', 15, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text('• Los gráficos interactivos están disponibles en el sistema web SEDES', 15, yPosition);
      yPosition += 5;
      pdf.text('• Este reporte contiene tablas de datos completos para análisis detallado', 15, yPosition);
      yPosition += 5;
      pdf.text('• Consulte el sistema para visualizaciones dinámicas de curvas epidémicas', 15, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 10;
    } catch (error) {
      // Sección de visualización omitida
    }
  }

  // Nueva página para recomendaciones
  pdf.addPage();
  yPosition = 20;

  // Análisis y Recomendaciones
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('5. ANÁLISIS Y RECOMENDACIONES PARA SEDES', 15, yPosition);
  yPosition += 10;

  // Calcular nivel de intervención necesario
  const baselineScenario = scenarios.find(s => s.name === 'Sin Intervención');
  if (baselineScenario) {
    const peakInfected = Math.max(...baselineScenario.data.I);
    const icuNeed = Math.round(peakInfected * 0.05);
    const icuOccupancy = icuNeed / department.hospitalCapacity.icuBeds;
    
    let interventionLevel = '';
    let bgColor = [0, 0, 0];
    
    if (icuOccupancy >= 0.95) {
      interventionLevel = 'CRÍTICO';
      bgColor = [220, 38, 38];
    } else if (icuOccupancy >= 0.85) {
      interventionLevel = 'SEVERO';
      bgColor = [249, 115, 22];
    } else if (icuOccupancy >= 0.70) {
      interventionLevel = 'MODERADO';
      bgColor = [234, 179, 8];
    } else if (icuOccupancy >= 0.50) {
      interventionLevel = 'ALERTA';
      bgColor = [59, 130, 246];
    } else {
      interventionLevel = 'NORMAL';
      bgColor = [34, 197, 94];
    }

    pdf.setFillColor(...bgColor);
    pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`NIVEL DE RIESGO: ${interventionLevel}`, pageWidth / 2, yPosition + 2, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recomendaciones Específicas:', 15, yPosition);
  yPosition += 7;

  pdf.setFont('helvetica', 'normal');
  const recommendations = generateRecommendations(scenarios, department);
  
  recommendations.forEach((rec, index) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    
    const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 35);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 3;
  });

  yPosition += 5;

  // Metodología
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('6. METODOLOGÍA', 15, yPosition);
  yPosition += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const methodology = [
    'El modelo SIR es un sistema de ecuaciones diferenciales ordinarias que describe la dinámica de transmisión de enfermedades infecciosas.',
    'La resolución numérica se realiza mediante el método de Runge-Kutta de orden 4 (RK4), que proporciona alta precisión.',
    'Los parámetros β (tasa de transmisión) y γ (tasa de recuperación) determinan el número reproductivo básico R₀ = β/γ.',
    'Las intervenciones modifican dinámicamente estos parámetros para simular el efecto de medidas de salud pública.',
    'La tasa de ocupación UCI se estima como el 5% de los casos de infección activa simultáneos.',
    'Las recomendaciones se basan en umbrales establecidos por organismos internacionales de salud (OMS, OPS).'
  ];

  methodology.forEach(line => {
    const lines = pdf.splitTextToSize(line, pageWidth - 30);
    pdf.text(lines, 15, yPosition);
    yPosition += lines.length * 4 + 2;
  });

  // Pie de página en todas las páginas
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `SEDES Bolivia - Reporte Epidemiológico | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text(
      'Documento generado automáticamente mediante modelo matemático SIR',
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

    return pdf;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
}

/**
 * Genera recomendaciones basadas en los resultados de simulación
 */
function generateRecommendations(scenarios, department) {
  const recommendations = [];
  
  const baseline = scenarios.find(s => s.name === 'Sin Intervención');
  const bestIntervention = scenarios
    .filter(s => s.name !== 'Sin Intervención')
    .sort((a, b) => Math.max(...a.data.I) - Math.max(...b.data.I))[0];

  if (baseline) {
    const baselinePeak = Math.max(...baseline.data.I);
    const baselineICU = Math.round(baselinePeak * 0.05);
    const icuOccupancy = baselineICU / department.hospitalCapacity.icuBeds;

    if (icuOccupancy > 1.0) {
      recommendations.push(
        `Sin intervención, la demanda de UCI alcanzará ${baselineICU.toLocaleString('es-BO')} camas, superando la capacidad disponible (${department.hospitalCapacity.icuBeds.toLocaleString('es-BO')}) en ${((icuOccupancy - 1) * 100).toFixed(0)}%. Se requiere intervención inmediata.`
      );
    } else if (icuOccupancy > 0.85) {
      recommendations.push(
        `La ocupación UCI alcanzará ${(icuOccupancy * 100).toFixed(0)}% sin intervención. Se recomienda implementar restricciones preventivas para evitar colapso del sistema de salud.`
      );
    }
  }

  if (bestIntervention) {
    const interventionPeak = Math.max(...bestIntervention.data.I);
    const casesAvoided = baseline ? Math.max(...baseline.data.I) - interventionPeak : 0;
    
    recommendations.push(
      `La estrategia "${bestIntervention.name}" es la más efectiva, reduciendo el pico de infectados en ${casesAvoided.toLocaleString('es-BO')} casos (${(casesAvoided / Math.max(...baseline.data.I) * 100).toFixed(1)}%).`
    );
  }

  recommendations.push(
    'Implementar un sistema de vigilancia epidemiológica activa con monitoreo diario de casos y ocupación hospitalaria.'
  );

  recommendations.push(
    'Establecer protocolos de activación escalonada de medidas según umbrales de ocupación UCI: 50% (alerta), 70% (moderado), 85% (severo).'
  );

  recommendations.push(
    'Fortalecer la capacidad de testeo y trazabilidad de contactos para detección temprana y aislamiento oportuno de casos.'
  );

  recommendations.push(
    'Coordinar con municipios la implementación uniforme de medidas de salud pública y comunicación de riesgos a la población.'
  );

  recommendations.push(
    'Mantener reserva estratégica de insumos médicos y planificar ampliación de capacidad hospitalaria en escenarios de alta demanda.'
  );

  return recommendations;
}

/**
 * Descarga el PDF generado
 */
export async function downloadPDFReport(data, filename = 'reporte_epidemiologico_sedes.pdf') {
  try {
    console.log('Iniciando generación de PDF con datos:', data);
    const pdf = await generatePDFReport(data);
    
    if (!pdf) {
      throw new Error('El PDF no se generó correctamente');
    }
    
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error en downloadPDFReport:', error);
    throw error;
  }
}

/**
 * Genera reporte Excel con datos tabulares
 */
export function generateExcelData(scenarios, department) {
  const data = [];
  
  // Encabezado
  data.push(['SEDES - BOLIVIA']);
  data.push(['Reporte de Análisis Epidemiológico']);
  data.push([`Departamento: ${department.name}`]);
  data.push([`Población: ${department.population.toLocaleString('es-BO')}`]);
  data.push([]);

  // Resultados por escenario
  data.push(['Escenario', 'Pico Infectados', 'Día del Pico', 'Total Infectados', 'Tasa de Ataque (%)', 'UCI Requerida', 'Ocupación UCI (%)']);
  
  scenarios.forEach(scenario => {
    const peakInfected = Math.max(...scenario.data.I);
    const peakDay = scenario.data.time[scenario.data.I.indexOf(peakInfected)];
    const totalInfected = scenario.data.R[scenario.data.R.length - 1];
    const attackRate = (totalInfected / department.population * 100).toFixed(2);
    const icuNeed = Math.round(peakInfected * 0.05);
    const icuOccupancy = (icuNeed / department.hospitalCapacity.icuBeds * 100).toFixed(1);

    data.push([
      scenario.name,
      Math.round(peakInfected),
      Math.round(peakDay),
      Math.round(totalInfected),
      attackRate,
      icuNeed,
      icuOccupancy
    ]);
  });

  return data;
}
