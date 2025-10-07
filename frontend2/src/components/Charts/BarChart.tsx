import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  incomes: number;
  expenses: number;
}

const BarChart: React.FC<BarChartProps> = ({ incomes, expenses }) => {
  const data = {
    labels: ['Mes Actual'],
    datasets: [
      { label: 'Ingresos', data: [incomes], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
      { label: 'Gastos', data: [expenses], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
    ],
  };

  return <Bar data={data} className="max-w-md mx-auto" />;
};

export default BarChart;