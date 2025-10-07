
import { Metadata } from 'next';
import Reports from '@/components/Reports';

export const metadata: Metadata = {
  title: 'FinSight - Reportes',
};

export default function ReportsPage() {
  // Temporal: datos vacíos (se implementará fetch en próximo paso)
  const transactions: any[] = [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reportes</h1>
      <Reports transactions={transactions} />
    </div>
  );
}
