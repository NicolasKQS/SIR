# Sistema de Modelado Epidemiológico - SEDES Bolivia

##  Descripción

Sistema profesional de simulación epidemiológica desarrollado para el Servicio Departamental de Salud (SEDES) de Bolivia. Implementa modelos matemáticos SIR y SEIR para el análisis y predicción de enfermedades infecciosas.

##  Características Principales

- **Modelos Matemáticos Avanzados**: SIR y SEIR con método Runge-Kutta de orden 4
- **15 Perfiles de Enfermedades**: Datos epidemiológicos específicos de Bolivia
- **9 Departamentos**: Datos poblacionales y capacidad hospitalaria actualizados
- **Análisis de Intervenciones**: Cuarentena, distanciamiento social y vacunación
- **Métricas Epidemiológicas**: R₀, tiempo de duplicación, tasa de ataque, ocupación UCI
- **Sistema de Alertas**: Advertencias tempranas basadas en umbrales críticos
- **Análisis Económico**: Estimación de costos e impacto en el PIB
- **Reportes PDF**: Generación automática con branding institucional SEDES

##  Tecnologías

- **React 18**: Framework principal
- **Chart.js**: Visualización de datos epidemiológicos
- **Framer Motion**: Animaciones fluidas
- **KaTeX**: Renderizado de ecuaciones matemáticas
- **jsPDF**: Generación de reportes PDF profesionales
- **Tailwind CSS**: Diseño responsivo y moderno

##  Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start

# Producción
npm run build
```

##  Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── IntegratedSimulation.js   # Simulación principal
│   ├── Navigation.js              # Menú de navegación
│   ├── HomeView.js                # Vista inicial
│   ├── MathematicsView.js         # Fundamentos matemáticos
│   └── DiseaseSelector.js         # Selector de enfermedades
├── data/               # Datos epidemiológicos
│   ├── boliviaData.js            # 9 departamentos
│   └── diseaseProfiles.js        # 15 enfermedades
├── utils/              # Utilidades y modelos
│   ├── sirInterventions.js       # Modelo SIR con intervenciones
│   ├── seirModel.js              # Modelo SEIR
│   ├── epidemiologicalMetrics.js # Métricas avanzadas
│   └── reportGenerator.js        # Generación de PDF
└── App.js              # Componente principal
```

##  Modelos Implementados

### Modelo SIR
- **S**: Susceptibles
- **I**: Infectados
- **R**: Recuperados

### Modelo SEIR
- **S**: Susceptibles
- **E**: Expuestos (período de incubación)
- **I**: Infectados
- **R**: Recuperados

##  Enfermedades Disponibles

1. COVID-19 (original y Omicron)
2. Influenza H1N1
3. Dengue
4. Fiebre Amarilla
5. Chagas
6. Malaria
7. Leishmaniasis
8. Hantavirus
9. Rabia
10. Hepatitis A
11. Influenza Estacional
12. Sarampión
13. Tuberculosis
14. Varicela

##  Departamentos de Bolivia

1. Bolivia (Nacional)
2. La Paz
3. Santa Cruz
4. Cochabamba
5. Oruro
6. Potosí
7. Chuquisaca
8. Tarija
9. Beni
10. Pando

##  Métricas Calculadas

- **R₀**: Número reproductivo básico
- **R(t)**: Número reproductivo efectivo
- **Tiempo de duplicación**: Días para doblar casos
- **Tasa de ataque**: % población infectada
- **Ocupación UCI**: % capacidad hospitalaria
- **Mortalidad estimada**: Con y sin colapso hospitalario
- **Impacto económico**: Costos en bolivianos y % PIB

##  Sistema de Alertas

- **Crítico**: R(t) > 2.0, UCI > 90%
- **Alto**: R(t) > 1.5, UCI > 75%
- **Moderado**: R(t) > 1.2, UCI > 50%
- **Bajo**: R(t) < 1.0

##  Exportación de Reportes

Generación automática de reportes PDF profesionales con:
- Encabezado institucional SEDES
- Datos del departamento
- Parámetros del modelo
- Intervenciones aplicadas
- Resultados comparativos
- Métricas avanzadas
- Sistema de alertas
- Impacto económico
- Recomendaciones

##  Desarrollado Para

**SEDES - Servicio Departamental de Salud**  
Ministerio de Salud y Deportes  
Estado Plurinacional de Bolivia

##  Versión

**1.0.0** - Sistema de Producción  
Última actualización: Diciembre 2025

##  Licencia

© 2025 SEDES Bolivia. Todos los derechos reservados.

---

**Nota**: Este sistema utiliza modelos matemáticos avanzados basados en ecuaciones diferenciales para simulación epidemiológica. Los resultados deben ser interpretados por personal capacitado en salud pública y epidemiología.
