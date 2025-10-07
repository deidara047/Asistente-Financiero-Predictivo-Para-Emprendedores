import { Metadata } from 'next';
import Dashboard from '@/components/Dashboard';

export const metadata: Metadata = {
  title: 'FinSight - Dashboard',
};

export default function DashboardPage() {
  // Datos temporales (se reemplazarán con fetch en el próximo paso)
  const transactions: any[] = [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Dashboard transactions={transactions} />
    </div>
  );
}