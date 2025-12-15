/**
 * Perfiles de enfermedades infecciosas con parámetros epidemiológicos
 * Datos calibrados para contexto boliviano basados en literatura científica
 * y datos históricos de SEDES Bolivia
 */

export const diseaseProfiles = {
  // COVID-19 (Datos de Bolivia 2020-2023)
  covid19: {
    id: 'covid19',
    name: 'COVID-19 (SARS-CoV-2)',
    category: 'Respiratoria',
    description: 'Coronavirus 2019 - Variante Original',
    severity: 'ALTA',
    modelType: 'SEIR',
    icon: 'COVID',
    params: {
      beta: 0.45,
      gamma: 0.10,
      sigma: 0.18, // ~5.5 días incubación
      E0: 80,
      I0: 50,
      R0_value: 4.5
    },
    characteristics: {
      transmissionMode: 'Aérea (gotas y aerosoles)',
      incubationPeriod: '2-14 días (promedio 5-6 días)',
      infectiousPeriod: '7-10 días',
      symptomsOnset: '5 días después de exposición',
      contagiousPeriod: '2 días antes de síntomas hasta 10 días después'
    },
    clinicalData: {
      hospitalizationRate: 0.18, // 18% en Bolivia
      icuRate: 0.06, // 6% requiere UCI
      ventilatorRate: 0.03, // 3% requiere ventilador
      caseFatalityRate: 0.022, // 2.2% IFR Bolivia
      averageHospitalStay: 12,
      averageICUStay: 14
    },
    boliviaData: {
      firstCase: '2020-03-10',
      peakDate: '2020-07-15',
      totalCasesReported: 1200000,
      totalDeaths: 22000,
      vaccinationStart: '2021-01-29',
      majorOutbreaks: [
        { date: '2020-07', wave: 1, cases: 80000 },
        { date: '2021-01', wave: 2, cases: 120000 },
        { date: '2022-01', wave: 3, cases: 250000 }
      ]
    },
    interventions: {
      quarantine: {
        effectiveness: 0.75,
        recommended: true,
        duration: 60,
        startDay: 20
      },
      socialDistancing: {
        effectiveness: 0.50,
        recommended: true,
        reduction: 0.50
      },
      vaccination: {
        effectiveness: 0.85,
        recommended: true,
        dailyRate: 0.008
      }
    }
  },

  // COVID-19 Omicron
  covid19Omicron: {
    id: 'covid19Omicron',
    name: 'COVID-19 Omicron',
    category: 'Respiratoria',
    description: 'Variante Omicron - Alta transmisibilidad',
    severity: 'MODERADA',
    modelType: 'SEIR',
    icon: 'OMI',
    params: {
      beta: 0.72, // Mucho más transmisible
      gamma: 0.14,
      sigma: 0.25, // Incubación más corta
      E0: 120,
      I0: 80,
      R0_value: 5.1
    },
    characteristics: {
      transmissionMode: 'Aérea (muy alta transmisibilidad)',
      incubationPeriod: '3-5 días',
      infectiousPeriod: '5-7 días',
      symptomsOnset: '3-4 días',
      contagiousPeriod: '1 día antes hasta 7 días después'
    },
    clinicalData: {
      hospitalizationRate: 0.08, // Menos grave
      icuRate: 0.02,
      ventilatorRate: 0.01,
      caseFatalityRate: 0.005, // 0.5%
      averageHospitalStay: 7,
      averageICUStay: 9
    },
    interventions: {
      quarantine: {
        effectiveness: 0.60, // Menos efectiva por alta transmisión
        recommended: true,
        duration: 45,
        startDay: 15
      },
      vaccination: {
        effectiveness: 0.70,
        recommended: true,
        dailyRate: 0.012
      }
    }
  },

  // Dengue (Endémica en Bolivia)
  dengue: {
    id: 'dengue',
    name: 'Dengue',
    category: 'Vector (Mosquito)',
    description: 'Virus del dengue transmitido por Aedes aegypti',
    severity: 'MODERADA-ALTA',
    modelType: 'SEIR',
    icon: 'DENG',
    params: {
      beta: 0.35,
      gamma: 0.14,
      sigma: 0.15, // ~7 días incubación
      E0: 100,
      I0: 60,
      R0_value: 2.5
    },
    characteristics: {
      transmissionMode: 'Vector (mosquito Aedes aegypti)',
      incubationPeriod: '4-10 días (promedio 7 días)',
      infectiousPeriod: '5-7 días',
      symptomsOnset: '4-7 días post-picadura',
      contagiousPeriod: 'No hay transmisión persona a persona directa'
    },
    clinicalData: {
      hospitalizationRate: 0.25, // 25% en casos reportados
      icuRate: 0.05,
      ventilatorRate: 0.01,
      caseFatalityRate: 0.015, // 1.5% con atención, 20% sin atención (dengue grave)
      averageHospitalStay: 5,
      averageICUStay: 7
    },
    boliviaData: {
      endemic: true,
      highRiskDepartments: ['Santa Cruz', 'Beni', 'Pando', 'Tarija'],
      seasonality: 'Diciembre-Mayo (época lluviosa)',
      cases2024: 52000,
      historicalPeak: {
        year: 2020,
        cases: 78000,
        deaths: 68
      },
      serotypesPresent: ['DENV-1', 'DENV-2', 'DENV-3', 'DENV-4']
    },
    interventions: {
      socialDistancing: {
        effectiveness: 0.20, // Baja para vector
        recommended: false
      },
      vectorControl: { // Intervención especial
        effectiveness: 0.65,
        recommended: true,
        description: 'Fumigación y eliminación de criaderos'
      },
      vaccination: {
        effectiveness: 0.60,
        recommended: true,
        dailyRate: 0.005,
        note: 'Vacuna Dengvaxia disponible en áreas endémicas'
      }
    }
  },

  // Influenza (Gripe estacional)
  influenza: {
    id: 'influenza',
    name: 'Influenza (Gripe Estacional)',
    category: 'Respiratoria',
    description: 'Virus de la influenza A/B',
    severity: 'MODERADA',
    modelType: 'SEIR',
    icon: 'FLU',
    params: {
      beta: 0.28,
      gamma: 0.25, // ~4 días infeccioso
      sigma: 0.50, // ~2 días incubación
      E0: 50,
      I0: 30,
      R0_value: 1.3
    },
    characteristics: {
      transmissionMode: 'Aérea (gotas respiratorias)',
      incubationPeriod: '1-4 días (promedio 2 días)',
      infectiousPeriod: '3-5 días',
      symptomsOnset: '1-2 días',
      contagiousPeriod: '1 día antes hasta 5-7 días después'
    },
    clinicalData: {
      hospitalizationRate: 0.12,
      icuRate: 0.02,
      ventilatorRate: 0.005,
      caseFatalityRate: 0.001, // 0.1% general, mayor en >65 años
      averageHospitalStay: 5,
      averageICUStay: 8
    },
    boliviaData: {
      seasonality: 'Mayo-Septiembre (invierno)',
      annualCases: 45000,
      peakMonth: 'Julio',
      vaccinationCoverage: 0.25 // 25% población vulnerable
    },
    interventions: {
      quarantine: {
        effectiveness: 0.50,
        recommended: true,
        duration: 30,
        startDay: 15
      },
      vaccination: {
        effectiveness: 0.60,
        recommended: true,
        dailyRate: 0.010,
        note: 'Vacuna anual especialmente para >65 años'
      }
    }
  },

  // Sarampión (Riesgo de reintroducción)
  measles: {
    id: 'measles',
    name: 'Sarampión',
    category: 'Respiratoria',
    description: 'Virus del sarampión - Altamente contagioso',
    severity: 'ALTA',
    modelType: 'SEIR',
    icon: 'SARAM',
    params: {
      beta: 0.95, // Extremadamente contagioso
      gamma: 0.08,
      sigma: 0.09, // ~11 días incubación
      E0: 20,
      I0: 5,
      R0_value: 12.0
    },
    characteristics: {
      transmissionMode: 'Aérea (aerosoles, altamente contagioso)',
      incubationPeriod: '10-14 días',
      infectiousPeriod: '8-10 días',
      symptomsOnset: '10-12 días',
      contagiousPeriod: '4 días antes del exantema hasta 4 días después'
    },
    clinicalData: {
      hospitalizationRate: 0.30,
      icuRate: 0.08,
      ventilatorRate: 0.02,
      caseFatalityRate: 0.002, // 0.2% en países con buen sistema salud, 10% sin atención
      averageHospitalStay: 7,
      averageICUStay: 10,
      complications: ['Neumonía', 'Encefalitis', 'Ceguera', 'Desnutrición']
    },
    boliviaData: {
      eliminationYear: 2000,
      lastOutbreak: {
        year: 2019,
        cases: 3,
        imported: true
      },
      vaccinationCoverage: 0.88, // 88% cobertura SPR
      riskStatus: 'MODERADO - Riesgo de reintroducción',
      vulnerablePopulations: ['No vacunados', 'Inmigrantes', 'Población rural']
    },
    interventions: {
      quarantine: {
        effectiveness: 0.85,
        recommended: true,
        duration: 21,
        startDay: 5,
        note: 'Aislamiento inmediato de casos'
      },
      vaccination: {
        effectiveness: 0.97,
        recommended: true,
        dailyRate: 0.020,
        note: 'Vacunación de emergencia en brotes',
        herdImmunityThreshold: 0.95 // 95% necesario
      }
    }
  },

  // Tuberculosis
  tuberculosis: {
    id: 'tuberculosis',
    name: 'Tuberculosis (TB)',
    category: 'Respiratoria',
    description: 'Mycobacterium tuberculosis',
    severity: 'ALTA',
    modelType: 'SEIR',
    icon: 'TB',
    params: {
      beta: 0.15, // Transmisión prolongada
      gamma: 0.004, // ~250 días tratamiento
      sigma: 0.002, // Latencia muy larga (meses-años)
      E0: 200,
      I0: 30,
      R0_value: 2.0
    },
    characteristics: {
      transmissionMode: 'Aérea (exposición prolongada)',
      incubationPeriod: '2-12 semanas (infección latente puede durar años)',
      infectiousPeriod: '6-9 meses si no se trata',
      symptomsOnset: 'Variable (semanas a años)',
      contagiousPeriod: 'Durante enfermedad activa no tratada'
    },
    clinicalData: {
      hospitalizationRate: 0.15,
      icuRate: 0.03,
      ventilatorRate: 0.01,
      caseFatalityRate: 0.15, // 15% sin tratamiento, <5% con tratamiento
      averageHospitalStay: 30,
      averageICUStay: 14,
      treatmentDuration: 180 // 6 meses tratamiento
    },
    boliviaData: {
      endemic: true,
      incidenceRate: 120, // Por 100,000 habitantes
      annualCases: 13000,
      tbMdrCases: 350, // TB multidrogorresistente
      highRiskAreas: ['El Alto', 'Potosí', 'Cochabamba', 'Pando'],
      hivCoinfection: 0.08 // 8% TB-VIH
    },
    interventions: {
      quarantine: {
        effectiveness: 0.90,
        recommended: true,
        duration: 14,
        startDay: 1,
        note: 'Aislamiento hasta 2 semanas de tratamiento'
      },
      treatment: {
        effectiveness: 0.95,
        recommended: true,
        note: 'DOTS (Directly Observed Treatment Short-course)'
      }
    }
  },

  // Varicela (Presente en Bolivia)
  chickenpox: {
    id: 'chickenpox',
    name: 'Varicela',
    category: 'Respiratoria',
    description: 'Virus varicela-zóster',
    severity: 'MODERADA',
    modelType: 'SEIR',
    icon: 'VAR',
    params: {
      beta: 0.65,
      gamma: 0.10,
      sigma: 0.06, // ~16 días incubación
      E0: 50,
      I0: 20,
      R0_value: 6.5
    },
    characteristics: {
      transmissionMode: 'Aérea y contacto directo',
      incubationPeriod: '10-21 días (promedio 14-16 días)',
      infectiousPeriod: '10-21 días',
      symptomsOnset: '14-16 días',
      contagiousPeriod: '2 días antes del exantema hasta costra en todas las lesiones'
    },
    clinicalData: {
      hospitalizationRate: 0.05,
      icuRate: 0.01,
      ventilatorRate: 0.002,
      caseFatalityRate: 0.0001, // Muy baja en niños sanos
      averageHospitalStay: 5,
      averageICUStay: 7,
      complications: ['Neumonía', 'Encefalitis', 'Infecciones bacterianas secundarias']
    },
    boliviaData: {
      annualCases: 8500,
      peakAge: '1-9 años',
      vaccinationCoverage: 0.60, // Baja cobertura
      seasonality: 'Invierno-Primavera (mayo-octubre)'
    },
    interventions: {
      quarantine: {
        effectiveness: 0.70,
        recommended: true,
        duration: 21,
        startDay: 10
      },
      vaccination: {
        effectiveness: 0.90,
        recommended: true,
        dailyRate: 0.008
      }
    }
  },

  // Perfil genérico personalizable
  custom: {
    id: 'custom',
    name: 'Enfermedad Personalizada',
    category: 'Personalizada',
    description: 'Configure manualmente los parámetros',
    severity: 'VARIABLE',
    modelType: 'SIR',
    icon: 'CUSTOM',
    params: {
      beta: 0.35,
      gamma: 0.10,
      sigma: 0.20,
      E0: 50,
      I0: 100,
      R0_value: 3.5
    }
  }
};

/**
 * Obtiene lista de enfermedades por categoría
 */
export function getDiseasesByCategory() {
  const categories = {
    'Respiratoria': [],
    'Arbovirosis': [],
    'Parasitaria': [],
    'Zoonótica': [],
    'Gastrointestinal': [],
    'Personalizada': []
  };

  Object.values(diseaseProfiles).forEach(disease => {
    if (categories[disease.category]) {
      categories[disease.category].push(disease);
    } else {
      // Si la categoría no existe, crearla
      if (disease.category && disease.category !== 'Personalizada') {
        if (!categories[disease.category]) {
          categories[disease.category] = [];
        }
        categories[disease.category].push(disease);
      }
    }
  });

  // Eliminar categorías vacías
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0 && key !== 'Personalizada') {
      delete categories[key];
    }
  });

  return categories;
}

/**
 * Obtiene perfil de enfermedad por ID
 */
export function getDiseaseProfile(diseaseId) {
  return diseaseProfiles[diseaseId] || diseaseProfiles.custom;
}

/**
 * Calcula parámetros ajustados para población
 */
export function adjustParamsForPopulation(diseaseParams, population, initialCases = null) {
  return {
    S0: initialCases ? population - initialCases - (diseaseParams.E0 || 0) : population - diseaseParams.I0 - (diseaseParams.E0 || 0),
    E0: diseaseParams.E0 || 0,
    I0: initialCases || diseaseParams.I0,
    R0: 0,
    beta: diseaseParams.beta,
    gamma: diseaseParams.gamma,
    sigma: diseaseParams.sigma || 0.2
  };
}

/**
 * Obtiene recomendaciones de intervención para enfermedad
 */
export function getInterventionRecommendations(diseaseId) {
  const disease = getDiseaseProfile(diseaseId);
  const recommendations = [];

  if (disease.interventions) {
    Object.entries(disease.interventions).forEach(([intervention, config]) => {
      if (config.recommended) {
        const interventionNames = {
          'quarantine': 'Cuarentena/Aislamiento',
          'socialDistancing': 'Distanciamiento Social',
          'vaccination': 'Vacunación',
          'vectorControl': 'Control de Vectores',
          'hygiene': 'Medidas de Higiene',
          'rodentControl': 'Control de Roedores',
          'animalControl': 'Control Animal',
          'screening': 'Tamizaje y Detección',
          'treatment': 'Tratamiento Temprano'
        };

        recommendations.push({
          intervention: interventionNames[intervention] || intervention,
          interventionKey: intervention,
          effectiveness: config.effectiveness,
          priority: config.effectiveness >= 0.8 ? 'CRÍTICA' : 
                   config.effectiveness >= 0.6 ? 'ALTA' : 
                   config.effectiveness >= 0.4 ? 'MEDIA' : 'BAJA',
          note: config.note || ''
        });
      }
    });
  }

  return recommendations.sort((a, b) => b.effectiveness - a.effectiveness);
}

// Perfiles adicionales

// Hepatitis A
diseaseProfiles.hepatitisA = {
  id: 'hepatitisA',
  name: 'Hepatitis A',
  category: 'Gastrointestinal',
  description: 'Infección viral hepática - Transmisión fecal-oral',
  severity: 'MODERADA',
  modelType: 'SEIR',
  icon: 'HEPA',
  params: {
    beta: 0.28,
    gamma: 0.033,
    sigma: 0.033,
    E0: 40,
    I0: 20,
    R0_value: 8.5
  },
  characteristics: {
    transmissionMode: 'Fecal-oral (agua y alimentos contaminados)',
    incubationPeriod: '15-50 días (promedio 28-30 días)',
    infectiousPeriod: '28-30 días',
    symptomsOnset: '28-30 días después de exposición',
    contagiousPeriod: '2 semanas antes de síntomas hasta 1 semana después'
  },
  clinicalData: {
    hospitalizationRate: 0.05,
    icuRate: 0.005,
    ventilatorRate: 0.001,
    caseFatalityRate: 0.003,
    averageHospitalStay: 7,
    averageICUStay: 5
  },
  boliviaData: {
    endemicStatus: 'Endémica - Alta prevalencia en áreas rurales',
    annualCases: 8500,
    highRiskDepartments: ['La Paz', 'Cochabamba', 'Potosí', 'Oruro'],
    seasonality: 'Todo el año, picos en época seca',
    vaccinationCoverage: 0.42
  },
  interventions: {
    quarantine: {
      effectiveness: 0.40,
      recommended: false,
      note: 'Aislamiento individual más efectivo que cuarentena masiva'
    },
    socialDistancing: {
      effectiveness: 0.30,
      recommended: false,
      note: 'Control de agua y alimentos más importante'
    },
    vaccination: {
      effectiveness: 0.95,
      recommended: true,
      note: 'Vacuna inactivada altamente efectiva. Dosis única protección >95%'
    },
    hygiene: {
      effectiveness: 0.80,
      recommended: true,
      note: 'Lavado de manos, agua potable, saneamiento básico críticos'
    }
  }
};

// Fiebre Amarilla
diseaseProfiles.yellowFever = {
  id: 'yellowFever',
  name: 'Fiebre Amarilla',
  category: 'Arbovirosis',
  description: 'Enfermedad viral transmitida por mosquitos Aedes',
  severity: 'CRÍTICA',
  modelType: 'SEIR',
  icon: 'FA',
  params: {
    beta: 0.35,
    gamma: 0.14,
    sigma: 0.17,
    E0: 30,
    I0: 15,
    R0_value: 2.5
  },
  characteristics: {
    transmissionMode: 'Vector - Mosquitos Aedes aegypti y Haemagogus',
    incubationPeriod: '3-6 días',
    infectiousPeriod: '6-7 días',
    symptomsOnset: '3-6 días',
    contagiousPeriod: 'No hay transmisión persona-persona directa'
  },
  clinicalData: {
    hospitalizationRate: 0.35,
    icuRate: 0.15,
    ventilatorRate: 0.08,
    caseFatalityRate: 0.15,
    averageHospitalStay: 10,
    averageICUStay: 7
  },
  boliviaData: {
    endemicStatus: 'Endémica en zonas tropicales',
    annualCases: 150,
    highRiskDepartments: ['Beni', 'Pando', 'Santa Cruz', 'La Paz (Yungas)'],
    seasonality: 'Diciembre-Mayo (época de lluvias)',
    vaccinationCoverage: 0.68,
    lastOutbreak: '2024'
  },
  interventions: {
    quarantine: {
      effectiveness: 0.20,
      recommended: false,
      note: 'Transmisión vectorial, no persona-persona'
    },
    socialDistancing: {
      effectiveness: 0.15,
      recommended: false,
      note: 'Inefectivo contra transmisión vectorial'
    },
    vaccination: {
      effectiveness: 0.99,
      recommended: true,
      note: 'Vacuna 17D una dosis protección de por vida. OBLIGATORIA zonas endémicas'
    },
    vectorControl: {
      effectiveness: 0.75,
      recommended: true,
      note: 'Fumigación, eliminación criaderos, mosquiteros, repelentes'
    }
  }
};

// Chagas (Trypanosoma cruzi)
diseaseProfiles.chagas = {
  id: 'chagas',
  name: 'Chagas (Trypanosomiasis)',
  category: 'Parasitaria',
  description: 'Enfermedad parasitaria transmitida por vinchuca',
  severity: 'ALTA',
  modelType: 'SIR',
  icon: 'CHAG',
  params: {
    beta: 0.08,
    gamma: 0.005,
    E0: 0,
    I0: 100,
    R0_value: 16
  },
  characteristics: {
    transmissionMode: 'Vector - Vinchuca (Triatoma infestans), transfusiones, congénita',
    incubationPeriod: '5-14 días (fase aguda)',
    infectiousPeriod: 'Crónica - décadas',
    symptomsOnset: 'Aguda: 1-2 semanas. Crónica: 10-30 años',
    contagiousPeriod: 'Transmisión vectorial y transfusional principalmente'
  },
  clinicalData: {
    hospitalizationRate: 0.25,
    icuRate: 0.08,
    ventilatorRate: 0.03,
    caseFatalityRate: 0.10,
    averageHospitalStay: 15,
    averageICUStay: 10
  },
  boliviaData: {
    endemicStatus: 'Endémica - Mayor prevalencia en Sudamérica',
    annualCases: 600000,
    prevalence: 0.06,
    highRiskDepartments: ['Cochabamba', 'Chuquisaca', 'Tarija', 'Santa Cruz', 'Potosí'],
    seasonality: 'Permanente',
    notes: '6% población infectada. 1.2M personas en riesgo'
  },
  interventions: {
    quarantine: {
      effectiveness: 0.10,
      recommended: false,
      note: 'No relevante para transmisión vectorial crónica'
    },
    socialDistancing: {
      effectiveness: 0.05,
      recommended: false,
      note: 'Inefectivo'
    },
    vectorControl: {
      effectiveness: 0.85,
      recommended: true,
      note: 'Mejoramiento de viviendas, rociado de insecticidas, mosquiteros'
    },
    screening: {
      effectiveness: 0.70,
      recommended: true,
      note: 'Detección precoz y tratamiento antiparasitario (Benznidazol, Nifurtimox)'
    }
  }
};

// Malaria
diseaseProfiles.malaria = {
  id: 'malaria',
  name: 'Malaria (Paludismo)',
  category: 'Parasitaria',
  description: 'Enfermedad parasitaria transmitida por mosquitos Anopheles',
  severity: 'ALTA',
  modelType: 'SEIR',
  icon: 'MAL',
  params: {
    beta: 0.40,
    gamma: 0.067,
    sigma: 0.083,
    E0: 50,
    I0: 30,
    R0_value: 6.0
  },
  characteristics: {
    transmissionMode: 'Vector - Mosquitos Anopheles',
    incubationPeriod: '7-30 días (P. falciparum: 7-14, P. vivax: 12-17)',
    infectiousPeriod: '10-15 días sin tratamiento',
    symptomsOnset: '7-30 días',
    contagiousPeriod: 'No hay transmisión persona-persona'
  },
  clinicalData: {
    hospitalizationRate: 0.20,
    icuRate: 0.05,
    ventilatorRate: 0.02,
    caseFatalityRate: 0.02,
    averageHospitalStay: 8,
    averageICUStay: 6
  },
  boliviaData: {
    endemicStatus: 'Endémica en tierras bajas tropicales',
    annualCases: 18000,
    highRiskDepartments: ['Pando', 'Beni', 'Santa Cruz (norte)'],
    seasonality: 'Todo el año, picos en época de lluvias',
    species: 'P. vivax (95%), P. falciparum (5%)'
  },
  interventions: {
    quarantine: {
      effectiveness: 0.15,
      recommended: false,
      note: 'Transmisión vectorial'
    },
    socialDistancing: {
      effectiveness: 0.10,
      recommended: false,
      note: 'No efectivo contra vectores'
    },
    vectorControl: {
      effectiveness: 0.80,
      recommended: true,
      note: 'Mosquiteros impregnados, fumigación, eliminación de criaderos'
    },
    treatment: {
      effectiveness: 0.95,
      recommended: true,
      note: 'Tratamiento temprano con antimaláricos (Cloroquina, Artemisinin). Diagnóstico rápido crítico'
    }
  }
};

// Leishmaniasis
diseaseProfiles.leishmaniasis = {
  id: 'leishmaniasis',
  name: 'Leishmaniasis',
  category: 'Parasitaria',
  description: 'Enfermedad parasitaria transmitida por flebótomos',
  severity: 'MODERADA',
  modelType: 'SIR',
  icon: 'LEISH',
  params: {
    beta: 0.15,
    gamma: 0.017,
    E0: 0,
    I0: 25,
    R0_value: 8.8
  },
  characteristics: {
    transmissionMode: 'Vector - Flebótomos (Lutzomyia)',
    incubationPeriod: '2 semanas a 6 meses (cutánea), meses-años (visceral)',
    infectiousPeriod: 'Meses (cutánea) a permanente (visceral sin tratamiento)',
    symptomsOnset: 'Variable 2-6 meses',
    contagiousPeriod: 'No hay transmisión persona-persona'
  },
  clinicalData: {
    hospitalizationRate: 0.15,
    icuRate: 0.03,
    ventilatorRate: 0.01,
    caseFatalityRate: 0.05,
    averageHospitalStay: 12,
    averageICUStay: 8
  },
  boliviaData: {
    endemicStatus: 'Endémica en regiones tropicales y subtropicales',
    annualCases: 2500,
    highRiskDepartments: ['La Paz (Yungas)', 'Cochabamba', 'Santa Cruz', 'Beni'],
    seasonality: 'Todo el año',
    types: 'Cutánea (98%), Mucocutánea (2%)'
  },
  interventions: {
    quarantine: {
      effectiveness: 0.05,
      recommended: false,
      note: 'Transmisión vectorial exclusiva'
    },
    socialDistancing: {
      effectiveness: 0.05,
      recommended: false,
      note: 'No efectivo'
    },
    vectorControl: {
      effectiveness: 0.70,
      recommended: true,
      note: 'Rociado de insecticidas, mosquiteros finos, repelentes'
    },
    treatment: {
      effectiveness: 0.85,
      recommended: true,
      note: 'Antimoniales pentavalentes, Anfotericina B, Miltefosina. Diagnóstico temprano crítico'
    }
  }
};

// Hantavirus
diseaseProfiles.hantavirus = {
  id: 'hantavirus',
  name: 'Hantavirus (SPHV)',
  category: 'Zoonótica',
  description: 'Síndrome Pulmonar por Hantavirus - Transmisión por roedores',
  severity: 'CRÍTICA',
  modelType: 'SEIR',
  icon: 'HANTA',
  params: {
    beta: 0.12,
    gamma: 0.10,
    sigma: 0.067,
    E0: 5,
    I0: 3,
    R0_value: 1.2
  },
  characteristics: {
    transmissionMode: 'Zoonótica - Inhalación de excretas de roedores (Oligoryzomys)',
    incubationPeriod: '7-39 días (promedio 14-17 días)',
    infectiousPeriod: '7-10 días',
    symptomsOnset: '14-17 días',
    contagiousPeriod: 'Muy rara transmisión persona-persona'
  },
  clinicalData: {
    hospitalizationRate: 0.90,
    icuRate: 0.60,
    ventilatorRate: 0.40,
    caseFatalityRate: 0.37,
    averageHospitalStay: 15,
    averageICUStay: 10
  },
  boliviaData: {
    endemicStatus: 'Casos esporádicos',
    annualCases: 15,
    highRiskDepartments: ['Tarija', 'Chuquisaca', 'Cochabamba'],
    seasonality: 'Otoño-Primavera (Mayor actividad roedores)',
    lastOutbreak: '2019'
  },
  interventions: {
    quarantine: {
      effectiveness: 0.25,
      recommended: false,
      note: 'Transmisión zoonótica, no persona-persona generalmente'
    },
    socialDistancing: {
      effectiveness: 0.15,
      recommended: false,
      note: 'Limitada efectividad'
    },
    rodentControl: {
      effectiveness: 0.85,
      recommended: true,
      note: 'Control de roedores peridomésticos, sellado de viviendas, almacenamiento seguro alimentos'
    },
    hygiene: {
      effectiveness: 0.75,
      recommended: true,
      note: 'Ventilación antes de limpiar, uso de mascarilla N95, desinfección con cloro 10%'
    }
  }
};

// Rabia
diseaseProfiles.rabies = {
  id: 'rabies',
  name: 'Rabia',
  category: 'Zoonótica',
  description: 'Encefalitis viral transmitida por mordeduras - Fatal sin tratamiento',
  severity: 'CRÍTICA',
  modelType: 'SEIR',
  icon: 'RABIA',
  params: {
    beta: 0.05,
    gamma: 0.10,
    sigma: 0.017,
    E0: 3,
    I0: 1,
    R0_value: 0.5
  },
  characteristics: {
    transmissionMode: 'Zoonótica - Mordedura/arañazo de animales infectados (perros, murciélagos)',
    incubationPeriod: '20-90 días (puede ser hasta 1 año)',
    infectiousPeriod: '10 días (desde síntomas hasta muerte)',
    symptomsOnset: '30-60 días promedio',
    contagiousPeriod: 'Saliva infectante días antes de síntomas'
  },
  clinicalData: {
    hospitalizationRate: 1.0,
    icuRate: 0.80,
    ventilatorRate: 0.60,
    caseFatalityRate: 0.999,
    averageHospitalStay: 8,
    averageICUStay: 6
  },
  boliviaData: {
    endemicStatus: 'Endémica - Casos esporádicos',
    annualCases: 12,
    highRiskDepartments: ['Santa Cruz', 'Beni', 'Pando', 'Cochabamba'],
    mainReservoir: 'Perros (urbano), Murciélagos (rural)',
    vaccinationCoverage: 0.55
  },
  interventions: {
    quarantine: {
      effectiveness: 0.10,
      recommended: false,
      note: 'No transmisión persona-persona'
    },
    socialDistancing: {
      effectiveness: 0.05,
      recommended: false,
      note: 'No relevante'
    },
    vaccination: {
      effectiveness: 1.0,
      recommended: true,
      note: 'Profilaxis post-exposición 100% efectiva si se aplica antes de síntomas. Vacunación canina masiva crítica'
    },
    animalControl: {
      effectiveness: 0.90,
      recommended: true,
      note: 'Vacunación de perros (>70% cobertura), control de población canina, educación sobre manejo de mordeduras'
    }
  }
};

// Gripe H1N1 (Influenza A)
diseaseProfiles.h1n1 = {
  id: 'h1n1',
  name: 'Gripe H1N1 (Influenza A)',
  category: 'Respiratoria',
  description: 'Influenza A H1N1 - Pandemia 2009',
  severity: 'MODERADA',
  modelType: 'SEIR',
  icon: 'H1N1',
  params: {
    beta: 0.48,
    gamma: 0.20,
    sigma: 0.50,
    E0: 60,
    I0: 40,
    R0_value: 2.4
  },
  characteristics: {
    transmissionMode: 'Aérea (gotas respiratorias)',
    incubationPeriod: '1-4 días (promedio 2 días)',
    infectiousPeriod: '3-5 días',
    symptomsOnset: '1-2 días',
    contagiousPeriod: '1 día antes hasta 5-7 días después de síntomas'
  },
  clinicalData: {
    hospitalizationRate: 0.08,
    icuRate: 0.02,
    ventilatorRate: 0.01,
    caseFatalityRate: 0.008,
    averageHospitalStay: 7,
    averageICUStay: 10
  },
  boliviaData: {
    endemicStatus: 'Brotes estacionales',
    annualCases: 35000,
    highRiskDepartments: ['La Paz', 'Santa Cruz', 'Cochabamba'],
    seasonality: 'Mayo-Septiembre (invierno)',
    pandemic2009: 'Primera detección: Mayo 2009, 2.500 casos confirmados'
  },
  interventions: {
    quarantine: {
      effectiveness: 0.55,
      recommended: true,
      note: 'Aislamiento temprano de casos reduce transmisión'
    },
    socialDistancing: {
      effectiveness: 0.45,
      recommended: true,
      note: 'Efectivo durante pico epidémico'
    },
    vaccination: {
      effectiveness: 0.70,
      recommended: true,
      note: 'Vacuna estacional anual. Protección 60-70% en adultos sanos'
    },
    hygiene: {
      effectiveness: 0.65,
      recommended: true,
      note: 'Lavado de manos, etiqueta respiratoria, mascarillas en espacios cerrados'
    }
  }
};
