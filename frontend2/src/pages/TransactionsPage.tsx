import React from 'react';
import { useHead } from '@unhead/react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { addTransaction, setTransactions } from '../store/slices/transactionSlices';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import type { Transaction } from '../types';

// API base URL
const API_BASE = 'http://localhost:5000';

const TransactionsPage: React.FC = () => {
  useHead({ title: 'FinSight - Transacciones' });

  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  const addTransactionHandler = async (transaction: Transaction) => {
    try {
      const res = await axios.post(`${API_BASE}/transaction`, {
        type: transaction.type === 'income' ? 'ingreso' : 'gasto',
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      });
      dispatch(addTransaction(transaction));
      // Refresca la lista desde la API
      const updatedTransactions = await axios.get(`${API_BASE}/transactions`);
      dispatch(setTransactions(updatedTransactions.data));
      return { success: true, message: res.data.message }; 
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      return { success: false, message: error.response?.data?.error || 'Ocurrió un error al agregar la transacción.' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            💰 Gestión de Transacciones
          </h1>
          <p className="text-gray-600 text-lg">
            Controla tus ingresos y gastos de manera inteligente
          </p>
        </div>

        {/* Layout de dos columnas en desktop, apilado en mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario - Columna izquierda (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <TransactionForm addTransaction={addTransactionHandler} />
              
              {/* Info adicional */}
              <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Información</h3>
                    <p className="text-sm text-blue-700">
                      Las transacciones se registran con la fecha ingresada y la hora actual de Guatemala (UTC-6).
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="mt-4 bg-white rounded-xl shadow-lg p-4 border-2 border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📊</span> Resumen Rápido
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Transacciones:</span>
                    <span className="font-bold text-gray-800">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ingresos:</span>
                    <span className="font-bold text-green-600">
                      {transactions.filter((t: any) => t.type === 'ingreso').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gastos:</span>
                    <span className="font-bold text-red-600">
                      {transactions.filter((t: any) => t.type === 'gasto').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de transacciones - Columna derecha (2/3) */}
          <div className="lg:col-span-2">
            <TransactionList />
          </div>
        </div>

        {/* Footer decorativo */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border-2 border-gray-100">
            <span className="text-2xl">✨</span>
            <span className="text-gray-700 font-medium">FinSight</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 text-sm">Tu aliado financiero</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;