import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import type { Transaction } from '../types';

interface TransactionFormProps {
  addTransaction: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ addTransaction }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const MySwal = withReactContent(Swal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto debe ser mayor a 0 y la descripción es obligatoria.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    setIsLoading(true);

    const newTransaction: Omit<Transaction, 'id' | 'category'> = {
      amount,
      description,
      date,
      type,
    };
    addTransaction({ ...newTransaction, id: Date.now(), category: 'Pendiente' });

    try {
      const API_BASE = 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newTransaction.type === 'income' ? 'ingreso' : 'gasto',
          amount: newTransaction.amount,
          description: newTransaction.description,
          date: newTransaction.date,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to add transaction');
      }
      MySwal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Transacción agregada correctamente.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Aceptar',
        timer: 2000,
      });

      setAmount(0);
      setDescription('');
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al agregar la transacción. Intenta de nuevo.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Aceptar',
      });
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '0') {
      setAmount(0);
    } else {
      const numValue = parseFloat(value) || 0;
      setAmount(numValue >= 0 ? numValue : 0);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Encabezado del formulario */}
      <div className="mb-6 pb-4 border-b-2 border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">📝</span>
          Registrar Transacción
        </h2>
        <p className="text-sm text-gray-500 mt-1">Completa los datos de tu movimiento financiero</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo de transacción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Tipo de transacción
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              disabled={isLoading}
              className={`relative py-4 px-4 rounded-xl font-semibold transition-all duration-300 ${
                type === 'income'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105 ring-4 ring-green-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{type === 'income' ? '💰' : '💵'}</span>
                <span>Ingreso</span>
              </div>
              {type === 'income' && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              disabled={isLoading}
              className={`relative py-4 px-4 rounded-xl font-semibold transition-all duration-300 ${
                type === 'expense'
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg scale-105 ring-4 ring-red-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{type === 'expense' ? '💸' : '💳'}</span>
                <span>Gasto</span>
              </div>
              {type === 'expense' && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <span className="text-red-600 text-xs">✓</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💵 Monto
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 text-xl font-bold">
              $
            </span>
            <input
              type="number"
              value={amount === 0 ? '' : amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              disabled={isLoading}
              className="w-full py-4 pl-12 pr-4 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📋 Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Compra de supermercado"
            required
            disabled={isLoading}
            className="w-full py-4 px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📅 Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isLoading}
            className="w-full py-4 px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-4 text-white font-bold text-lg rounded-xl transition-all duration-300 flex justify-center items-center ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Agregando...
            </>
          ) : (
            <>
              <span className="mr-2 text-xl">✓</span>
              Agregar Transacción
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;