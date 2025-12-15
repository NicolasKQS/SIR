// Datos demográficos y de capacidad hospitalaria de Bolivia por departamento
// Fuente: INE Bolivia, Ministerio de Salud, SEDES departamentales (2024-2025)

export const boliviaDepartments = {
  santaCruz: {
    name: 'Santa Cruz',
    population: 3115000,
    density: 8.4, // hab/km²
    urbanPercent: 80.5,
    hospitalCapacity: {
      totalBeds: 4200,
      icuBeds: 420,
      ventilators: 280,
      healthWorkers: 8500
    },
    epidemiologicalHistory: {
      covid19Peak: {
        date: '2020-07-15',
        dailyCases: 1250,
        totalCases: 45000
      },
      dengue2024: {
        totalCases: 12500,
        peakMonth: 'Febrero'
      }
    }
  },
  laPaz: {
    name: 'La Paz',
    population: 2904000,
    density: 21.9,
    urbanPercent: 75.2,
    hospitalCapacity: {
      totalBeds: 3800,
      icuBeds: 380,
      ventilators: 250,
      healthWorkers: 7800
    },
    epidemiologicalHistory: {
      covid19Peak: {
        date: '2020-06-20',
        dailyCases: 980,
        totalCases: 38000
      }
    }
  },
  cochabamba: {
    name: 'Cochabamba',
    population: 2006000,
    density: 36.2,
    urbanPercent: 72.8,
    hospitalCapacity: {
      totalBeds: 2600,
      icuBeds: 260,
      ventilators: 180,
      healthWorkers: 5200
    },
    epidemiologicalHistory: {
      covid19Peak: {
        date: '2020-07-10',
        dailyCases: 720,
        totalCases: 28000
      },
      dengue2024: {
        totalCases: 8200,
        peakMonth: 'Marzo'
      }
    }
  },
  potosi: {
    name: 'Potosí',
    population: 897000,
    density: 7.6,
    urbanPercent: 45.3,
    hospitalCapacity: {
      totalBeds: 980,
      icuBeds: 85,
      ventilators: 55,
      healthWorkers: 1800
    }
  },
  tarija: {
    name: 'Tarija',
    population: 572000,
    density: 15.4,
    urbanPercent: 68.9,
    hospitalCapacity: {
      totalBeds: 780,
      icuBeds: 72,
      ventilators: 48,
      healthWorkers: 1500
    }
  },
  chuquisaca: {
    name: 'Chuquisaca',
    population: 639000,
    density: 12.5,
    urbanPercent: 52.4,
    hospitalCapacity: {
      totalBeds: 850,
      icuBeds: 78,
      ventilators: 50,
      healthWorkers: 1650
    }
  },
  oruro: {
    name: 'Oruro',
    population: 530000,
    density: 10.1,
    urbanPercent: 65.7,
    hospitalCapacity: {
      totalBeds: 720,
      icuBeds: 68,
      ventilators: 42,
      healthWorkers: 1400
    }
  },
  beni: {
    name: 'Beni',
    population: 480000,
    density: 2.3,
    urbanPercent: 58.2,
    hospitalCapacity: {
      totalBeds: 580,
      icuBeds: 52,
      ventilators: 35,
      healthWorkers: 980
    },
    epidemiologicalHistory: {
      dengue2024: {
        totalCases: 15200,
        peakMonth: 'Enero'
      }
    }
  },
  pando: {
    name: 'Pando',
    population: 156000,
    density: 2.5,
    urbanPercent: 52.8,
    hospitalCapacity: {
      totalBeds: 220,
      icuBeds: 18,
      ventilators: 12,
      healthWorkers: 380
    }
  }
};

// Capacidad total nacional
export const boliviaNational = {
  name: 'Bolivia (Nacional)',
  population: 12100000,
  hospitalCapacity: {
    totalBeds: 14730,
    icuBeds: 1433,
    ventilators: 952,
    healthWorkers: 29208
  }
};

// Parámetros epidemiológicos estimados para Bolivia
export const boliviaEpidemiologicalParams = {
  covid19: {
    beta: 0.35,
    gamma: 0.1,
    sigma: 0.2,
    R0: 3.5,
    incubationPeriod: 5,
    infectiousPeriod: 10,
    hospitalizationRate: 0.15,
    icuRate: 0.05,
    fatalityRate: 0.03
  },
  dengue: {
    beta: 0.28,
    gamma: 0.14,
    R0: 2.0,
    incubationPeriod: 7,
    infectiousPeriod: 7,
    hospitalizationRate: 0.08,
    fatalityRate: 0.01
  },
  influenza: {
    beta: 0.25,
    gamma: 0.2,
    R0: 1.25,
    incubationPeriod: 2,
    infectiousPeriod: 5,
    hospitalizationRate: 0.05,
    icuRate: 0.01,
    fatalityRate: 0.002
  }
};

// Políticas de intervención recomendadas por SEDES
export const interventionThresholds = {
  alert: {
    icuOccupancy: 0.5, // 50% ocupación UCI
    dailyCasesPer100k: 10,
    positivityRate: 0.05, // 5%
    recommendation: 'Alerta Epidemiológica - Monitoreo Intensivo'
  },
  moderate: {
    icuOccupancy: 0.7, // 70% ocupación UCI
    dailyCasesPer100k: 25,
    positivityRate: 0.10, // 10%
    recommendation: 'Restricciones Moderadas - Distanciamiento Social'
  },
  severe: {
    icuOccupancy: 0.85, // 85% ocupación UCI
    dailyCasesPer100k: 50,
    positivityRate: 0.20, // 20%
    recommendation: 'Cuarentena Rígida - Cierre de Actividades No Esenciales'
  },
  critical: {
    icuOccupancy: 0.95, // 95% ocupación UCI
    dailyCasesPer100k: 100,
    positivityRate: 0.30, // 30%
    recommendation: 'Emergencia Sanitaria - Cuarentena Total y Toque de Queda'
  }
};

// Funciones de utilidad
export function getDepartmentData(departmentKey) {
  return boliviaDepartments[departmentKey] || boliviaNational;
}

export function calculateICUNeed(infectedCases, icuRate = 0.05) {
  return Math.round(infectedCases * icuRate);
}

export function getInterventionLevel(icuOccupancy) {
  if (icuOccupancy >= interventionThresholds.critical.icuOccupancy) {
    return { level: 'critical', ...interventionThresholds.critical };
  } else if (icuOccupancy >= interventionThresholds.severe.icuOccupancy) {
    return { level: 'severe', ...interventionThresholds.severe };
  } else if (icuOccupancy >= interventionThresholds.moderate.icuOccupancy) {
    return { level: 'moderate', ...interventionThresholds.moderate };
  } else if (icuOccupancy >= interventionThresholds.alert.icuOccupancy) {
    return { level: 'alert', ...interventionThresholds.alert };
  }
  return { level: 'normal', recommendation: 'Situación Normal - Vigilancia Epidemiológica' };
}

export function getAllDepartments() {
  return Object.entries(boliviaDepartments).map(([key, data]) => ({
    key,
    ...data
  }));
}
