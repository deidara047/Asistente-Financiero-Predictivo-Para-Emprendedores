import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  monthlyExpenses: number[];
}

const LineChart: React.FC<LineChartProps> = ({ monthlyExpenses }) => {
  const data = {
    labels: ['Mes 1', 'Mes 2', 'Mes 3'],
    datasets: [
      { label: 'Gastos Mensuales', data: monthlyExpenses, borderColor: 'rgba(153, 102, 255, 1)', fill: false },
    ],
  };

  return <Line data={data} className="max-w-md mx-auto" />;
};

export default LineChart;