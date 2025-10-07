import React, { useEffect, useState } from 'react';
import { useHead } from '@unhead/react';
import axios from 'axios';
import { 
  FaChartPie, 
  FaChartLine, 
  FaCalendarAlt, 
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaFileDownload,
  FaInfoCircle
} from 'react-icons/fa';
import { generateMonthlyPDF, generateComparativePDF, generateHabitsPDF } from '../utils/pdfGenerator';

const API_BASE = 'http://localhost:5000';

interface MonthlyReport {
  income: number;
  expense: number;
  savings: number;
  top_category: string;
  month?: string;
  year?: number;
}

interface ComparativeReport {
  current_expense: number;
  prev_expense: number;
  difference: number;
}

interface HabitsReport {
  top_days: number[];
  repeated_expenses: { [key: string]: number };
}

const ReportsPage: React.FC = () => {
  useHead({ title: 'FinSight - Reportes' });

  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [comparative, setComparative] = useState<ComparativeReport | null>(null);
  const [habits, setHabits] = useState<HabitsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);

  // Obtener mes y año actual
  const getCurrentMonthYear = () => {
    const now = new Date();
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return {
      month: monthNames[now.getMonth()],
      year: now.getFullYear()
    };
  };

  const currentPeriod = getCurrentMonthYear();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [monthlyRes, comparativeRes, habitsRes] = await Promise.all([
        axios.get(`${API_BASE}/reports/monthly`).catch(() => ({ data: { income: 0, expense: 0, savings: 0, top_category: 'N/A' } })),
        axios.get(`${API_BASE}/reports/comparative`).catch(() => ({ data: { current_expense: 0, prev_expense: 0, difference: 0 } })),
        axios.get(`${API_BASE}/reports/habits`).catch(() => ({ data: { top_days: [], repeated_expenses: {} } }))
      ]);

      setMonthly(monthlyRes.data);
      setComparative(comparativeRes.data);
      setHabits(habitsRes.data);
    } catch (err) {
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (reportType: string) => {
    setDownloadingPDF(reportType);
    try {
      switch (reportType) {
        case 'monthly':
          // Obtener datos de 12 meses para el PDF
          const response = await axios.get(`${API_BASE}/reports/monthly-12`);
          await generateMonthlyPDF(response.data);
          break;
        case 'comparative':
          if (comparative) await generateComparativePDF(comparative);
          break;
        case 'habits':
          if (habits) await generateHabitsPDF(habits);
          break;
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setDownloadingPDF(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const getSavingsColor = (savings: number) => {
    if (savings > 0) return 'text-green-600';
    if (savings < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getDifferenceColor = (diff: number) => {
    if (diff < 0) return 'text-green-600';
    if (diff > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            Reportes Financieros
          </h1>
          <p className="text-gray-600 text-lg">Análisis detallado de tu situación financiera</p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Report */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white">Reporte Mensual</h2>
              <p className="text-blue-100 text-sm mt-1">{currentPeriod.month} {currentPeriod.year}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Info banner */}
              <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-blue-800">
                  Mostrando datos del mes actual. Para ver el reporte de los últimos 12 meses, descarga el PDF.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <FaArrowUp className="text-green-600" size={24} />
                  <span className="text-gray-700 font-medium">Ingresos</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthly?.income || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <FaArrowDown className="text-red-600" size={24} />
                  <span className="text-gray-700 font-medium">Gastos</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthly?.expense || 0)}
                </span>
              </div>

              <div className={`flex items-center justify-between p-4 ${
                (monthly?.savings || 0) >= 0 ? 'bg-blue-50' : 'bg-orange-50'
              } rounded-xl`}>
                <div className="flex items-center space-x-3">
                  <FaPiggyBank className={
                    (monthly?.savings || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
                  } size={24} />
                  <span className="text-gray-700 font-medium">Ahorro</span>
                </div>
                <span className={`text-2xl font-bold ${getSavingsColor(monthly?.savings || 0)}`}>
                  {formatCurrency(monthly?.savings || 0)}
                </span>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Categoría más gastada</p>
                <p className="text-lg font-bold text-gray-900">{monthly?.top_category || 'N/A'}</p>
              </div>

              <button
                onClick={() => handleDownloadPDF('monthly')}
                disabled={downloadingPDF === 'monthly'}
                className="w-full mt-6 flex cursor-pointer items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPDF === 'monthly' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <FaDownload size={18} />
                    <span>Descargar Reporte 12 Meses</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Comparative Report */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white">Comparativo</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Gastos este mes</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(comparative?.current_expense || 0)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Gastos mes anterior</p>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(comparative?.prev_expense || 0)}
                </p>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Diferencia</p>
                <div className="flex items-center space-x-2">
                  {(comparative?.difference || 0) < 0 ? (
                    <FaArrowDown className="text-green-600" size={20} />
                  ) : (
                    <FaArrowUp className="text-red-600" size={20} />
                  )}
                  <p className={`text-3xl font-bold ${getDifferenceColor(comparative?.difference || 0)}`}>
                    {formatCurrency(Math.abs(comparative?.difference || 0))}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {(comparative?.difference || 0) < 0 
                    ? '¡Has reducido tus gastos!' 
                    : 'Tus gastos han aumentado'}
                </p>
              </div>

              <button
                onClick={() => handleDownloadPDF('comparative')}
                disabled={downloadingPDF === 'comparative'}
                className="w-full mt-6 flex cursor-pointer items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPDF === 'comparative' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <FaDownload size={18} />
                    <span>Descargar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Habits Report */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-white">Hábitos</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3 font-medium">Días con más gasto</p>
                <div className="flex flex-wrap gap-2">
                  {habits?.top_days && habits.top_days.length > 0 ? (
                    habits.top_days.map((day, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-pink-600 text-white rounded-full font-bold text-lg shadow-md"
                      >
                        {day}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-3 font-medium">Gastos repetidos</p>
                <div className="space-y-2">
                  {habits?.repeated_expenses && Object.keys(habits.repeated_expenses).length > 0 ? (
                    Object.entries(habits.repeated_expenses).map(([desc, count], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span className="text-gray-800 font-medium text-sm truncate max-w-[200px]">
                          {desc}
                        </span>
                        <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {count}x
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No hay gastos repetidos</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDownloadPDF('habits')}
                disabled={downloadingPDF === 'habits'}
                className="w-full mt-6 cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPDF === 'habits' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <FaDownload size={18} />
                    <span>Descargar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Download All Button */}
        <div className="mt-12 text-center">
          <button
            onClick={async () => {
              setDownloadingPDF('all');
              try {
                const monthlyResponse = await axios.get(`${API_BASE}/reports/monthly-12`);
                await generateMonthlyPDF(monthlyResponse.data);
                if (comparative) await generateComparativePDF(comparative);
                if (habits) await generateHabitsPDF(habits);
              } catch (error) {
                console.error('Error:', error);
                alert('Error al generar los PDFs');
              } finally {
                setDownloadingPDF(null);
              }
            }}
            disabled={downloadingPDF === 'all'}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPDF === 'all' ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Generando PDFs...</span>
              </>
            ) : (
              <>
                <FaFileDownload size={24} />
                <span>Descargar Todos los Reportes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;