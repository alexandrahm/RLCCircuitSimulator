import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RLCCircuitSimulator = () => {
  const [L, setL] = useState(1);
  const [R, setR] = useState(20);
  const [C, setC] = useState(0.005);
  const [E, setE] = useState(150);
  const [i0, setI0] = useState(0); // Corriente inicial
  const [q0, setQ0] = useState(0); // Carga inicial
  const [timeEnd, setTimeEnd] = useState(2);
  const [specificTime, setSpecificTime] = useState(0.1);
  const [data, setData] = useState([]);
  const [currentAtTime, setCurrentAtTime] = useState(0);

  // Función para resolver la ecuación diferencial del circuito RLC
  const solveRLC = () => {
    const dt = 0.001; // Paso de tiempo
    const steps = Math.floor(timeEnd / dt);
    const newData = [];
    
    // Parámetros del circuito
    const omega0 = 1 / Math.sqrt(L * C); // Frecuencia natural
    const alpha = R / (2 * L); // Factor de amortiguamiento
    const discriminant = alpha * alpha - omega0 * omega0;
    
    // Valor en estado estacionario
    const iSteady = 0; // Para fuente DC, la corriente en estado estacionario es 0
    const qSteady = E * C; // Carga en estado estacionario
    
    let current, charge;
    
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      
      if (discriminant > 0) {
        // Sobreamortiguado
        const r1 = -alpha + Math.sqrt(discriminant);
        const r2 = -alpha - Math.sqrt(discriminant);
        
        const A = ((i0 - qSteady * r2 / L) / (r1 - r2));
        const B = ((-i0 + qSteady * r1 / L) / (r1 - r2));
        
        charge = qSteady + A * Math.exp(r1 * t) + B * Math.exp(r2 * t);
        current = A * r1 * Math.exp(r1 * t) + B * r2 * Math.exp(r2 * t);
        
      } else if (discriminant < 0) {
        // Subamortiguado
        const omegaD = Math.sqrt(-discriminant);
        
        const A = q0 - qSteady;
        const B = (i0 + alpha * A) / omegaD;
        
        charge = qSteady + Math.exp(-alpha * t) * (A * Math.cos(omegaD * t) + B * Math.sin(omegaD * t));
        current = Math.exp(-alpha * t) * ((-alpha * A + omegaD * B) * Math.cos(omegaD * t) + (-omegaD * A - alpha * B) * Math.sin(omegaD * t));
        
      } else {
        // Críticamente amortiguado
        const A = q0 - qSteady;
        const B = i0 + alpha * A;
        
        charge = qSteady + (A + B * t) * Math.exp(-alpha * t);
        current = (B - alpha * A - alpha * B * t) * Math.exp(-alpha * t);
      }
      
      if (i % 10 === 0) { // Reducir puntos para mejor rendimiento
        newData.push({
          time: parseFloat(t.toFixed(3)),
          current: parseFloat(current.toFixed(6)),
          charge: parseFloat(charge.toFixed(6))
        });
      }
    }
    
    setData(newData);
    
    // Calcular corriente en tiempo específico
    const specificCurrent = calculateCurrentAtTime(specificTime);
    setCurrentAtTime(specificCurrent);
  };

  const calculateCurrentAtTime = (t) => {
    const omega0 = 1 / Math.sqrt(L * C);
    const alpha = R / (2 * L);
    const discriminant = alpha * alpha - omega0 * omega0;
    const qSteady = E * C;
    
    let current;
    
    if (discriminant > 0) {
      // Sobreamortiguado
      const r1 = -alpha + Math.sqrt(discriminant);
      const r2 = -alpha - Math.sqrt(discriminant);
      
      const A = ((i0 - qSteady * r2 / L) / (r1 - r2));
      const B = ((-i0 + qSteady * r1 / L) / (r1 - r2));
      
      current = A * r1 * Math.exp(r1 * t) + B * r2 * Math.exp(r2 * t);
      
    } else if (discriminant < 0) {
      // Subamortiguado
      const omegaD = Math.sqrt(-discriminant);
      
      const A = q0 - qSteady;
      const B = (i0 + alpha * A) / omegaD;
      
      current = Math.exp(-alpha * t) * ((-alpha * A + omegaD * B) * Math.cos(omegaD * t) + (-omegaD * A - alpha * B) * Math.sin(omegaD * t));
      
    } else {
      // Críticamente amortiguado
      const A = q0 - qSteady;
      const B = i0 + alpha * A;
      
      current = (B - alpha * A - alpha * B * t) * Math.exp(-alpha * t);
    }
    
    return current;
  };

  useEffect(() => {
    solveRLC();
  }, [L, R, C, E, i0, q0, timeEnd, specificTime]);

  const getCircuitType = () => {
    const omega0 = 1 / Math.sqrt(L * C);
    const alpha = R / (2 * L);
    const discriminant = alpha * alpha - omega0 * omega0;
    
    if (discriminant > 0) return "Sobreamortiguado";
    if (discriminant < 0) return "Subamortiguado";
    return "Críticamente amortiguado";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
        Simulador de Circuito RLC
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Control */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Parámetros del Circuito</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inductancia (L) [H]:
              </label>
              <input
                type="number"
                value={L}
                onChange={(e) => setL(parseFloat(e.target.value) || 0)}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resistencia (R) [Ω]:
              </label>
              <input
                type="number"
                value={R}
                onChange={(e) => setR(parseFloat(e.target.value) || 0)}
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacitancia (C) [F]:
              </label>
              <input
                type="number"
                value={C}
                onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voltaje de Fuente (E) [V]:
              </label>
              <input
                type="number"
                value={E}
                onChange={(e) => setE(parseFloat(e.target.value) || 0)}
                step="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corriente Inicial (i₀) [A]:
              </label>
              <input
                type="number"
                value={i0}
                onChange={(e) => setI0(parseFloat(e.target.value) || 0)}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carga Inicial (q₀) [C]:
              </label>
              <input
                type="number"
                value={q0}
                onChange={(e) => setQ0(parseFloat(e.target.value) || 0)}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo Final [s]:
              </label>
              <input
                type="number"
                value={timeEnd}
                onChange={(e) => setTimeEnd(parseFloat(e.target.value) || 1)}
                step="0.5"
                min="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Información del Circuito */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Información del Circuito</h2>
          
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border">
              <span className="font-medium text-gray-700">Tipo de Circuito:</span>
              <span className="ml-2 text-blue-600 font-semibold">{getCircuitType()}</span>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <span className="font-medium text-gray-700">Frecuencia Natural (ω₀):</span>
              <span className="ml-2 text-green-600 font-mono">
                {(1 / Math.sqrt(L * C)).toFixed(3)} rad/s
              </span>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <span className="font-medium text-gray-700">Factor de Amortiguamiento (α):</span>
              <span className="ml-2 text-orange-600 font-mono">
                {(R / (2 * L)).toFixed(3)} s⁻¹
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Corriente en Tiempo Específico</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Tiempo [s]:</label>
                <input
                  type="number"
                  value={specificTime}
                  onChange={(e) => setSpecificTime(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                />
              </div>
              <div className="bg-blue-100 p-3 rounded border border-blue-200">
                <span className="font-medium text-gray-700">i({specificTime}s) = </span>
                <span className="text-blue-700 font-mono text-lg font-bold">
                  {currentAtTime.toFixed(6)} A
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="mt-8 bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Corriente vs Tiempo</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Corriente (A)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${parseFloat(value).toFixed(6)} ${name === 'current' ? 'A' : 'C'}`, 
                name === 'current' ? 'Corriente' : 'Carga'
              ]}
              labelFormatter={(value) => `Tiempo: ${value} s`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#2563eb" 
              strokeWidth={2}
              name="Corriente (A)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Ecuación Diferencial */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Ecuación Diferencial del Circuito</h3>
        <div className="bg-white p-3 rounded border font-mono text-center">
          L(d²q/dt²) + R(dq/dt) + q/C = E(t)
        </div>
        <div className="mt-2 bg-white p-3 rounded border font-mono text-center">
          {L}(d²q/dt²) + {R}(dq/dt) + q/{C} = {E}
        </div>
      </div>
    </div>
  );
};

export default RLCCircuitSimulator;