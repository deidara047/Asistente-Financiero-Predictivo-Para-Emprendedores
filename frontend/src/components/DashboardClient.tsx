'use client';

import { FaMoneyBillWave, FaChartPie, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface AnalysisData {
  total_income: number;
  total_expense: number;
  net_gain: number;
  avg_monthly_income: number;
  avg_monthly_expense: number;
  unspent_percentage: number;
  expense_comparison: string;
  top_category: string;
  top_days: string[];
}

interface DashboardClientProps {
  analysis: AnalysisData;
  prediction: number;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ analysis, prediction }) => {
  const [pieError, setPieError] = useState(false);
  const [barError, setBarError] = useState(false);
  const [lineError, setLineError] = useState(false);
  const [pieLoading, setPieLoading] = useState(true);
  const [barLoading, setBarLoading] = useState(true);
  const [lineLoading, setLineLoading] = useState(true);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  const handleImageLoad = (setter: (value: boolean) => void) => {
    setter(false);
  };

  const handleImageError = (
    errorSetter: (value: boolean) => void,
    loadingSetter: (value: boolean) => void
  ) => {
    errorSetter(true);
    loadingSetter(false);
  };

  return (
    <div className="space-y-8">
      {/* Fila 1: Ingresos Totales, Gastos Totales, Predicción Próximo Mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <div className="flex items-center mb-4">
            <FaMoneyBillWave className="text-green-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Ingresos Totales</h2>
          </div>
          <p className="text-3xl font-bold text-green-700">
            ${analysis.total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-200">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-red-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Gastos Totales</h2>
          </div>
          <p className="text-3xl font-bold text-red-700">
            ${analysis.total_expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-blue-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Predicción Próximo Mes</h2>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {prediction !== null
              ? `$${prediction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'No disponible'}
          </p>
        </div>
      </div>

      {/* Fila 2: Gráfico de Pastel, Gráfico de Barras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Pastel: Distribución de Gastos</h2>
          <div className="flex justify-center">
            {pieLoading && !pieError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                <div className="text-gray-500 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Cargando gráfico...</p>
                </div>
              </div>
            )}
            {pieError ? (
              <p className="text-gray-600">No disponible</p>
            ) : (
              <img
                src={`http://localhost:5000/graphs/pie?t=${timestamp}`}
                alt="Pie Graph"
                className="max-w-full h-auto"
                onLoad={() => handleImageLoad(setPieLoading)}
                onError={() => handleImageError(setPieError, setPieLoading)}
              />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Barras: Ingresos vs Gastos</h2>
          <div className="flex justify-center">
            {barLoading && !barError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                <div className="text-gray-500 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Cargando gráfico...</p>
                </div>
              </div>
            )}
            {barError ? (
              <p className="text-gray-600">No disponible</p>
            ) : (
              <img
                src={`http://localhost:5000/graphs/bar?t=${timestamp}`}
                alt="Bar Graph"
                className="max-w-full h-auto"
                onLoad={() => handleImageLoad(setBarLoading)}
                onError={() => handleImageError(setBarError, setBarLoading)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: Gráfico de Líneas */}
      <div className="grid grid-cols-1">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Líneas: Evolución de Gastos</h2>
          <div className="flex justify-center">
            {lineLoading && !lineError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                <div className="text-gray-500 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Cargando gráfico...</p>
                </div>
              </div>
            )}
            {lineError ? (
              <p className="text-gray-600">No disponible</p>
            ) : (
              <img
                src={`http://localhost:5000/graphs/line?t=${timestamp}`}
                alt="Line Graph"
                className="max-w-full h-auto"
                onLoad={() => handleImageLoad(setLineLoading)}
                onError={() => handleImageError(setLineError, setLineLoading)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;