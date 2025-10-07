import React, { useEffect, useState } from 'react';
import { useHead } from '@unhead/react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import axios from 'axios';
import { FaMoneyBillWave, FaChartPie, FaCalendarAlt } from 'react-icons/fa'; // Íconos de react-icons

// API base URL
const API_BASE = 'http://localhost:5000';

const DashboardPage: React.FC = () => {
  useHead({ title: 'FinSight - Dashboard' });

  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  const [analysis, setAnalysis] = useState<any>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [barGraph, setBarGraph] = useState<string | null>(null);
  const [pieGraph, setPieGraph] = useState<string | null>(null);
  const [lineGraph, setLineGraph] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const analysisRes = await axios.get(`${API_BASE}/analysis`);
        setAnalysis(analysisRes.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setAnalysis({ total_income: 0, total_expense: 0, net_gain: 0, avg_monthly_income: 0, avg_monthly_expense: 0, unspent_percentage: 0, expense_comparison: 'N/A', top_category: 'N/A', top_days: [] });
          setError('Aún no hay datos disponibles. Agrega transacciones para ver análisis.');
        } else {
          setError('Error al cargar datos. Intenta más tarde.');
        }
      }

      try {
        const predictionRes = await axios.get(`${API_BASE}/prediction`);
        setPrediction(predictionRes.data.predicted_expense);
      } catch (err: any) {
        if (err.response?.status === 400 || err.response?.status === 404) {
          setPrediction(0);
          if (!error) setError('No hay suficientes datos para predicciones.');
        } else {
          if (!error) setError('Error al cargar predicción.');
        }
      }

      try {
        const barRes = await axios.get(`${API_BASE}/graphs/bar`, { responseType: 'blob' });
        setBarGraph(URL.createObjectURL(barRes.data));
      } catch (err: any) {
        if (err.response?.status === 404) {
          setBarGraph(null);
          if (!error) setError('No hay datos para gráficos.');
        } else {
          if (!error) setError('Error al cargar gráfico de barras.');
        }
      }

      try {
        const pieRes = await axios.get(`${API_BASE}/graphs/pie`, { responseType: 'blob' });
        setPieGraph(URL.createObjectURL(pieRes.data));
      } catch (err: any) {
        if (err.response?.status === 404) {
          setPieGraph(null);
          if (!error) setError('No hay datos para gráficos.');
        } else {
          if (!error) setError('Error al cargar gráfico de pastel.');
        }
      }

      try {
        const lineRes = await axios.get(`${API_BASE}/graphs/line`, { responseType: 'blob' });
        setLineGraph(URL.createObjectURL(lineRes.data));
      } catch (err: any) {
        if (err.response?.status === 404) {
          setLineGraph(null);
          if (!error) setError('No hay datos para gráficos.');
        } else {
          if (!error) setError('Error al cargar gráfico de líneas.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center p-6">{error}</p>;
  }

  const totalIncomes = analysis?.total_income || 0;
  const totalExpenses = analysis?.total_expense || 0;

  return (
    <div className="space-y-8">
      {/* Fila 1: Ingresos Totales, Gastos Totales, Predicción Próximo Mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ingresos Totales */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-200">
          <div className="flex items-center mb-4">
            <FaMoneyBillWave className="text-green-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Ingresos Totales</h2>
          </div>
          <p className="text-3xl font-bold text-green-700">
            ${totalIncomes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Gastos Totales */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-200">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-red-500 mr-2" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Gastos Totales</h2>
          </div>
          <p className="text-3xl font-bold text-red-700">
            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Predicción Próximo Mes */}
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
          {pieGraph ? (
            <div className="flex justify-center">
              <img src={pieGraph} alt="Pie Graph" className="max-w-full h-auto" />
            </div>
          ) : 'No disponible'}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Barras: Ingresos vs Gastos</h2>
          {barGraph ? (
            <div className="flex justify-center">
              <img src={barGraph} alt="Bar Graph" className="max-w-full h-auto" />
            </div>
          ) : 'No disponible'}
        </div>
      </div>

      {/* Fila 3: Gráfico de Líneas */}
      <div className="grid grid-cols-1">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Líneas: Evolución de Gastos</h2>
          {lineGraph ? (
            <div className="flex justify-center">
              <img src={lineGraph} alt="Line Graph" className="max-w-full h-auto" />
            </div>
          ) : 'No disponible'}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;