import { Metadata } from 'next';
import DashboardClient from '@/components/DashboardClient';

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

export const metadata: Metadata = {
  title: 'FinSight - Dashboard',
};

async function fetchDashboardData() {
  const API_BASE = 'http://localhost:5000';

  try {
    const [analysisRes, predictionRes] = await Promise.all([
      fetch(`${API_BASE}/analysis`, { cache: 'no-store' }).then((res) =>
        res.ok ? res.json() : null
      ),
      fetch(`${API_BASE}/prediction`, { cache: 'no-store' }).then((res) =>
        res.ok ? res.json() : null
      ),
    ]);

    return {
      analysis:
        analysisRes || {
          total_income: 0,
          total_expense: 0,
          net_gain: 0,
          avg_monthly_income: 0,
          avg_monthly_expense: 0,
          unspent_percentage: 0,
          expense_comparison: 'N/A',
          top_category: 'N/A',
          top_days: [],
        },
      prediction: predictionRes?.predicted_expense || 0,
      error: !analysisRes && !predictionRes ? 'No hay datos disponibles.' : null,
    };
  } catch (err) {
    return {
      analysis: {
        total_income: 0,
        total_expense: 0,
        net_gain: 0,
        avg_monthly_income: 0,
        avg_monthly_expense: 0,
        unspent_percentage: 0,
        expense_comparison: 'N/A',
        top_category: 'N/A',
        top_days: [],
      },
      prediction: 0,
      error: 'Error al cargar datos. Intenta más tarde.',
    };
  }
}

export default async function DashboardPage() {
  const { analysis, prediction, error } = await fetchDashboardData();

  if (error) {
    return <p className="text-red-600 text-center p-6">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <DashboardClient analysis={analysis} prediction={prediction} />
    </div>
  );
}