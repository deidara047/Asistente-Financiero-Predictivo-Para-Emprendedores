import { Metadata } from 'next';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';

export const metadata: Metadata = {
  title: 'FinSight - Transacciones',
};

export default function TransactionsPage() {
  // Temporal: función vacía (se implementará con Context/Server Actions)
  const addTransaction = async (transaction: any) => {
    console.log('Transaction added:', transaction);
    return { success: true, message: 'Transacción agregada' };
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          💰 Gestión de Transacciones
        </h1>
        <p className="text-gray-600 text-lg">
          Controla tus ingresos y gastos de manera inteligente
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TransactionForm addTransaction={addTransaction} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <TransactionList />
        </div>
      </div>
    </div>
  );
}