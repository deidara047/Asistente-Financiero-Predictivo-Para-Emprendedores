import React from 'react';
import type { Transaction } from '../types';
import BarChart from './Charts/BarChart';
import PieChart from './Charts/PieChart';
import LineChart from './Charts/LineChart';

// Mock data para demo; reemplaza con cálculos reales
const mockIncomes = 5000;
const mockExpenses = 3000;
const mockCategories = { Transporte: 1000, Alimentación: 800, Entretenimiento: 500, Servicios: 400, Otros: 300 };
const mockMonthlyExpenses = [2000, 2500, 3000];

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Aquí calcularías estadísticas reales basadas en transactions
  const totalIncomes = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Ingresos Totales: {totalIncomes}</p>
      <p>Gastos Totales: {totalExpenses}</p>
      <BarChart incomes={mockIncomes} expenses={mockExpenses} />
      <PieChart categories={mockCategories} />
      <LineChart monthlyExpenses={mockMonthlyExpenses} />
    </div>
  );
};

export default Dashboard;