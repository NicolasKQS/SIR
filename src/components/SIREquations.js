import { motion } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";
import { AlertTriangle, Activity, TrendingUp } from 'lucide-react';

export default function SIREquations() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Fundamentos Matemáticos y Epidemiológicos
        </h1>
        <p className="text-xl text-gray-700 mb-2">Sistema de Modelado Predictivo - SEDES Bolivia</p>
        <p className="text-sm text-gray-500 italic">Basado en teoría de ecuaciones diferenciales y dinámica de poblaciones</p>
      </motion.div>

      {/* SECCIÓN 1: MODELO SIR */}
      <Section
        title="Modelo SIR Clásico"
        content={
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              El modelo SIR es un sistema de ecuaciones diferenciales ordinarias (EDO) que describe la dinámica de transmisión de enfermedades infecciosas. Divide la población <InlineMath math="N" /> en tres compartimentos:
            </p>
            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-700 mb-2">S - Susceptibles</h4>
                <p className="text-sm">Personas que pueden contraer la enfermedad</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                <h4 className="font-bold text-red-700 mb-2">I - Infectados</h4>
                <p className="text-sm">Personas actualmente enfermas y contagiosas</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold text-blue-700 mb-2">R - Recuperados</h4>
                <p className="text-sm">Personas inmunes (recuperadas o vacunadas)</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-lg mb-4 text-center">Sistema de Ecuaciones Diferenciales</h4>
              <div className="overflow-x-auto">
                <BlockMath>{String.raw`\begin{aligned} \frac{dS}{dt} &= -\beta \frac{SI}{N} \\ \frac{dI}{dt} &= \beta \frac{SI}{N} - \gamma I \\ \frac{dR}{dt} &= \gamma I \end{aligned}`}</BlockMath>
              </div>
              <p className="text-sm text-gray-600 mt-4">Con la condición de conservación: <InlineMath>{String.raw`S(t) + I(t) + R(t) = N`}</InlineMath></p>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg">
              <h4 className="font-semibold mb-3">Parámetros Epidemiológicos:</h4>
              <ul className="space-y-2">
                <li><InlineMath>{String.raw`\beta`}</InlineMath> : Tasa de transmisión (contactos efectivos × probabilidad de contagio por día)</li>
                <li><InlineMath>{String.raw`\gamma`}</InlineMath> : Tasa de recuperación (inverso del período infeccioso, <InlineMath>{String.raw`\gamma = 1/D`}</InlineMath>)</li>
                <li><InlineMath>N</InlineMath> : Población total (constante en modelo básico)</li>
                <li><InlineMath>{String.raw`R_0 = \frac{\beta}{\gamma}`}</InlineMath> : Número básico de reproducción (personas contagiadas por cada infectado)</li>
              </ul>
            </div>
          </div>
        }
      />

      {/* SECCIÓN 2: MODELO SEIR */}
      <Section
        title="Modelo SEIR Extendido"
        content={
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              El modelo SEIR añade el compartimento de <strong>Expuestos (E)</strong>, representando el período de incubación donde las personas están infectadas pero aún no son contagiosas.
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-lg mb-4 text-center">Sistema SEIR</h4>
              <div className="overflow-x-auto">
                <BlockMath>{String.raw`\begin{aligned} \frac{dS}{dt} &= -\beta \frac{SI}{N} \\ \frac{dE}{dt} &= \beta \frac{SI}{N} - \sigma E \\ \frac{dI}{dt} &= \sigma E - \gamma I \\ \frac{dR}{dt} &= \gamma I \end{aligned}`}</BlockMath>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg">
              <h4 className="font-semibold mb-3">Parámetro Adicional:</h4>
              <ul className="space-y-2">
                <li><InlineMath>{String.raw`\sigma`}</InlineMath> : Tasa de progresión de expuesto a infeccioso (<InlineMath>{String.raw`\sigma = 1/T_E`}</InlineMath>, donde <InlineMath>{String.raw`T_E`}</InlineMath> es el período de incubación)</li>
              </ul>
            </div>
          </div>
        }
      />

      {/* SECCIÓN 3: NÚMERO REPRODUCTIVO BÁSICO */}
      <Section
        title="Número Reproductivo Básico (R₀)"
        content={
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              El <InlineMath>{String.raw`R_0`}</InlineMath> es el parámetro más importante en epidemiología. Representa el número promedio de personas que un individuo infectado contagiará en una población completamente susceptible.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-5 rounded-lg border-2 border-green-400">
                <h4 className="font-bold text-green-700 mb-2 text-center"><InlineMath>{String.raw`R_0 < 1`}</InlineMath></h4>
                <p className="text-center">La enfermedad se extingue</p>
                <p className="text-sm text-gray-600 mt-2">Cada infectado contagia a menos de una persona → Decrecimiento exponencial</p>
              </div>
              <div className="bg-red-50 p-5 rounded-lg border-2 border-red-400">
                <h4 className="font-bold text-red-700 mb-2 text-center"><InlineMath>{String.raw`R_0 > 1`}</InlineMath></h4>
                <p className="text-center">Ocurre una epidemia</p>
                <p className="text-sm text-gray-600 mt-2">Cada infectado contagia a más de una persona → Crecimiento exponencial</p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg border border-blue-300">
              <h4 className="font-semibold mb-3">Para el modelo SIR:</h4>
              <BlockMath>{String.raw`R_0 = \frac{\beta}{\gamma}`}</BlockMath>
              <p className="text-sm text-gray-600 mt-3">Ejemplos de enfermedades reales:</p>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Sarampión: R₀ ≈ 12-18</li>
                <li>• COVID-19 (original): R₀ ≈ 2.5-4</li>
                <li>• Gripe estacional: R₀ ≈ 1.3</li>
                <li>• Dengue: R₀ ≈ 2-4 (varía por región)</li>
              </ul>
            </div>
          </div>
        }
      />

      {/* SECCIÓN 4: MÉTODO NUMÉRICO */}
      <Section
        title="Método Numérico: Runge-Kutta 4 (RK4)"
        content={
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              Las ecuaciones diferenciales del modelo SIR/SEIR no tienen solución analítica cerrada. Utilizamos el método de <strong>Runge-Kutta de orden 4</strong>, uno de los métodos numéricos más precisos y estables.
            </p>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-lg mb-4 text-center">Algoritmo RK4</h4>
              <div className="overflow-x-auto">
                <BlockMath>{String.raw`\begin{aligned} k_1 &= f(t_n, y_n) \\ k_2 &= f(t_n + \frac{h}{2}, y_n + \frac{h}{2}k_1) \\ k_3 &= f(t_n + \frac{h}{2}, y_n + \frac{h}{2}k_2) \\ k_4 &= f(t_n + h, y_n + hk_3) \\ y_{n+1} &= y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4) \end{aligned}`}</BlockMath>
              </div>
              <p className="text-sm text-center text-gray-600 mt-4">Donde <InlineMath>h</InlineMath> es el tamaño del paso temporal</p>
            </div>

            <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-300">
              <h4 className="font-semibold mb-2">Consideraciones Numéricas:</h4>
              <ul className="text-sm space-y-2">
                <li>• <strong>Precisión</strong>: Error del orden O(h⁵) por paso</li>
                <li>• <strong>Estabilidad</strong>: Requiere h suficientemente pequeño</li>
                <li>• <strong>Conservación</strong>: Verificar que S+E+I+R ≈ N en cada paso</li>
              </ul>
            </div>
          </div>
        }
      />

      {/* SECCIÓN 5: ANÁLISIS DEL PICO EPIDÉMICO */}
      <Section
        title="Análisis del Pico Epidémico"
        content={
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              El pico de la epidemia ocurre cuando <InlineMath>{String.raw`\frac{dI}{dt} = 0`}</InlineMath>, es decir, cuando la tasa de nuevos contagios iguala la tasa de recuperación.
            </p>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
              <h4 className="font-semibold text-lg mb-4 text-center">Condición de Pico</h4>
              <div className="overflow-x-auto">
                <BlockMath>{String.raw`\frac{dI}{dt} = 0 \Rightarrow \beta \frac{SI}{N} = \gamma I \Rightarrow S_{\text{pico}} = \frac{N}{R_0}`}</BlockMath>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg">
              <h4 className="font-semibold mb-3">Métricas Epidemiológicas Clave:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Tiempo al pico</strong>: Tiempo hasta máximo de infectados</li>
                <li>• <strong>Tamaño del pico</strong>: Máximo de I(t)</li>
                <li>• <strong>Ataque final</strong>: Proporción de población que se infecta: <InlineMath>{String.raw`R(\infty)/N`}</InlineMath></li>
                <li>• <strong>Umbral de inmunidad colectiva</strong>: <InlineMath>{String.raw`1 - 1/R_0`}</InlineMath></li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
}

function Section({ title, content }) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-3">{title}</h2>
          <div className="text-gray-700 leading-relaxed">{content}</div>
        </div>
      </div>
    </motion.div>
  );
}
